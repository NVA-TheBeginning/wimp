#!/usr/bin/env python3
import argparse
import csv
import json
import re
from pathlib import Path
from typing import Iterable, List, Dict, Tuple


def norm(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"\s+", " ", s)
    return s


def slugify(s: str) -> str:
    s = norm(s)
    s = re.sub(r"[^a-z0-9 ]", "", s)
    return s.replace(" ", "-")


def singularize_token(tok: str) -> str:
    if tok.endswith("ies") and len(tok) > 3:
        return tok[:-3] + "y"
    if tok.endswith("s") and not tok.endswith("ss") and len(tok) > 3:
        return tok[:-1]
    return tok


def singularize_phrase(s: str) -> str:
    parts = [singularize_token(p) for p in s.split(" ") if p]
    return " ".join(parts)


def candidates(label: str) -> List[str]:
    key = norm(label)
    if key in ("", '"'):
        return []

    cands: List[str] = []
    cands.append(key)
    cands.append(slugify(key))

    sing = singularize_phrase(key)
    cands.append(sing)
    cands.append(slugify(sing))

    if "," in key:
        parts = [p.strip() for p in key.split(",") if p.strip()]
        if len(parts) > 1:
            joined = " ".join(parts)
            cands.append(joined)
            cands.append(slugify(joined))
            joined_sing = singularize_phrase(joined)
            cands.append(joined_sing)
            cands.append(slugify(joined_sing))

            rev = " ".join(reversed(parts))
            cands.append(rev)
            cands.append(slugify(rev))
            rev_sing = singularize_phrase(rev)
            cands.append(rev_sing)
            cands.append(slugify(rev_sing))

    seen = set()
    out: List[str] = []
    for c in cands:
        if c not in seen:
            out.append(c)
            seen.add(c)
    return out


def load_aliases(path: Path) -> Dict[str, List[str]]:
    if not path.exists():
        return {}
    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, dict):
        raise ValueError("aliases file must be a JSON object of {label: slug|[slugs]}")
    aliases: Dict[str, List[str]] = {}
    for k, v in raw.items():
        key = norm(str(k))
        if isinstance(v, list):
            aliases[key] = [str(x) for x in v]
        else:
            aliases[key] = [str(v)]
    return aliases


def resolve(
    label: str,
    aliases: Dict[str, List[str]],
    slugs: set,
    name_to_slug: Dict[str, str],
) -> List[str]:
    key = norm(label)
    if key in aliases:
        return aliases[key]

    for c in candidates(label):
        if c in slugs:
            return [c]
        if c in name_to_slug:
            return [name_to_slug[c]]
    return []


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate companions.json from companion_plants.csv and crops-cache.json"
    )
    parser.add_argument("--csv", default="data/companion_plants.csv")
    parser.add_argument("--crops", default="data/crops-cache.json")
    parser.add_argument("--out", default="data/companions.json")
    parser.add_argument("--aliases", default="")
    parser.add_argument(
        "--normalize-helped-by",
        action="store_true",
        help="Convert helped_by into helps with reversed direction",
    )
    parser.add_argument(
        "--keep-helped-by",
        action="store_true",
        help="Keep helped_by as its own type (ignored if --normalize-helped-by is set)",
    )
    parser.add_argument("--report", default="", help="Write unmatched rows to this CSV path")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    crops_path = Path(args.crops)
    out_path = Path(args.out)
    aliases_path = Path(args.aliases) if args.aliases else None
    report_path = Path(args.report) if args.report else None

    if not crops_path.exists():
        default_crops = parser.get_default("crops")
        if args.crops == default_crops:
            fallback_paths = [
                Path("src/crops/infrastructure/data/crops-cache.json"),
                Path("data/crops-cache.json"),
            ]
            for fallback in fallback_paths:
                if fallback.exists():
                    crops_path = fallback
                    break

    if not crops_path.exists():
        raise FileNotFoundError(
            f"Could not find crops cache at '{args.crops}'. "
            "Use --crops <path> or generate it first."
        )

    crops = json.loads(crops_path.read_text(encoding="utf-8"))
    slugs = {c["slug"] for c in crops}
    name_to_slug = {c["name"].strip().lower(): c["slug"] for c in crops}

    aliases = load_aliases(aliases_path) if aliases_path else {}
    # Drop alias targets that don't exist
    for k in list(aliases.keys()):
        aliases[k] = [s for s in aliases[k] if s in slugs]
        if not aliases[k]:
            del aliases[k]

    with csv_path.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    edges: set[Tuple[str, str, str]] = set()
    unmatched: List[Dict[str, str]] = []
    matched_rows = 0

    for r in rows:
        link = norm(r.get("Link", ""))
        srcs = resolve(r.get("Source Node", ""), aliases, slugs, name_to_slug)
        dsts = resolve(r.get("Destination Node", ""), aliases, slugs, name_to_slug)

        if not srcs or not dsts:
            unmatched.append(r)
            continue

        matched_rows += 1

        if link == "helped_by" and args.normalize_helped_by:
            link = "helps"
            srcs, dsts = dsts, srcs

        if link not in ("helps", "avoid") and not (args.keep_helped_by and link == "helped_by"):
            continue

        for s in srcs:
            for d in dsts:
                if s == d:
                    continue
                edges.add((s, d, link))

    edge_list = [
        {"from": s, "to": d, "type": t}
        for s, d, t in sorted(edges, key=lambda x: (x[0], x[1], x[2]))
    ]

    out_path.write_text(json.dumps(edge_list, indent=2), encoding="utf-8")

    if report_path:
        with report_path.open("w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=rows[0].keys() if rows else [])
            w.writeheader()
            w.writerows(unmatched)

    print(f"rows: {len(rows)}")
    print(f"matched rows: {matched_rows}")
    print(f"unmatched rows: {len(unmatched)}")
    print(f"unique edges: {len(edge_list)}")
    print(f"output: {out_path.as_posix()}")
    print(f"crops cache: {crops_path.as_posix()}")
    if report_path:
        print(f"unmatched report: {report_path.as_posix()}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
