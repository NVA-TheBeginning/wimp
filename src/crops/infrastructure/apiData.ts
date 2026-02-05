import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { z } from "zod/v4";
import {
  CropDetailSchema,
  CropListResponseSchema,
  type GrowstuffCrop,
  type RawCrop,
} from "@/crops/infrastructure/schemas/infrastructure";

const BASE_URL = "https://www.growstuff.org";
const PAGE_LIMIT = 100;
const BATCH_SIZE = 10;
const CACHE_PATH = "data/crops-cache.json";
const SLUG_REGEX = /\/crops\/([^/]+)$/;

async function fetchSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let offset = 0;

  while (true) {
    const url = `${BASE_URL}/api/v1/crops?page[limit]=${PAGE_LIMIT}&page[offset]=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch crop list: ${res.status}`);

    const json = CropListResponseSchema.parse(await res.json());
    for (const item of json.data) {
      const match = item.links.self.match(SLUG_REGEX);
      if (match?.[1]) slugs.push(match[1]);
    }

    if (!json.links.next || json.data.length === 0) break;
    offset += PAGE_LIMIT;
  }

  return slugs;
}

async function fetchCropDetail(slug: string): Promise<z.infer<typeof CropDetailSchema>> {
  const res = await fetch(`${BASE_URL}/crops/${slug}.json`);
  if (!res.ok) throw new Error(`Failed: ${slug} (${res.status})`);

  return CropDetailSchema.parse(await res.json());
}

async function fetchAllCrops(): Promise<GrowstuffCrop[]> {
  const slugs = await fetchSlugs();
  const crops: RawCrop[] = [];

  for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
    const batch = slugs.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(fetchCropDetail));

    for (const d of results) {
      const openfarm = typeof d.openfarm_data === "object" && d.openfarm_data ? d.openfarm_data : null;
      crops.push({
        crop: {
          id: d.id,
          slug: d.slug,
          name: d.name,
          description: d.description,
          perennial: d.perennial ?? false,
          sowingMethod: d.sowing_method,
          sunRequirements: d.sun_requirements,
          rowSpacing: d.row_spacing,
          spread: d.spread,
          height: d.height,
          growingDegreeDays: d.growing_degree_days,
          medianLifespan: d.median_lifespan,
          medianDaysToFirstHarvest: d.median_days_to_first_harvest,
          medianDaysToLastHarvest: d.median_days_to_last_harvest,
          scientificName: d.scientific_names?.[0]?.name ?? null,
        },
        openfarmId: openfarm?.id ?? null,
        companionIds: openfarm?.relationships?.companions?.data?.map((c: { id: string }) => c.id) ?? [],
      });
    }
  }

  const openfarmToSlug = new Map<string, string>();
  for (const { crop, openfarmId } of crops) {
    if (openfarmId) openfarmToSlug.set(openfarmId, crop.slug);
  }

  return crops.map(({ crop, companionIds }) => ({
    ...crop,
    companions: companionIds.map((id) => openfarmToSlug.get(id)).filter((s): s is string => !!s),
  }));
}

export async function loadCrops(): Promise<GrowstuffCrop[]> {
  if (existsSync(CACHE_PATH)) {
    const crops = JSON.parse(readFileSync(CACHE_PATH, "utf-8")) as GrowstuffCrop[];
    console.log(`Loaded ${crops.length} crops from cache`);
    return crops;
  }

  console.log("Cache not found, fetching from Growstuff API...");
  const crops = await fetchAllCrops();
  mkdirSync(dirname(CACHE_PATH), { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(crops, null, 2));
  console.log(`Fetched and cached ${crops.length} crops`);
  return crops;
}

export function clearCache(): void {
  if (existsSync(CACHE_PATH)) rmSync(CACHE_PATH);
}

if (import.meta.main) {
  loadCrops()
    .then((crops) => {
      console.log(`Total crops: ${crops.length}`);
      console.log("Sample crop:", JSON.stringify(crops[0], null, 2));
    })
    .catch(console.error);
}
