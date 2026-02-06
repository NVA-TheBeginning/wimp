import { RGBA } from "@opentui/core";

export const theme = {
  primary: RGBA.fromHex("#22c55e"),
  primaryDark: RGBA.fromHex("#16a34a"),
  primaryLight: RGBA.fromHex("#4ade80"),

  bgDark: RGBA.fromHex("#0f1419"),
  bgMedium: RGBA.fromHex("#1a1f26"),
  bgLight: RGBA.fromHex("#242933"),
  bgAccent: RGBA.fromHex("#1e3a2e"),

  textPrimary: RGBA.fromHex("#e5e7eb"),
  textSecondary: RGBA.fromHex("#9ca3af"),
  textDim: RGBA.fromHex("#6b7280"),
  textSuccess: RGBA.fromHex("#22c55e"),
  textWarning: RGBA.fromHex("#f59e0b"),
  textError: RGBA.fromHex("#ef4444"),

  borderDefault: RGBA.fromHex("#374151"),
  borderHighlight: RGBA.fromHex("#22c55e"),
  borderDim: RGBA.fromHex("#1f2937"),

  selected: RGBA.fromHex("#16a34a"),
  hover: RGBA.fromHex("#1e3a2e"),
  focus: RGBA.fromHex("#22c55e"),
} as const;

export const themeColors = {
  primary: "#22c55e",
  primaryDark: "#16a34a",
  primaryLight: "#4ade80",

  bgDark: "#0f1419",
  bgMedium: "#1a1f26",
  bgLight: "#242933",
  bgAccent: "#1e3a2e",

  textPrimary: "#e5e7eb",
  textSecondary: "#9ca3af",
  textDim: "#6b7280",
  textSuccess: "#22c55e",
  textWarning: "#f59e0b",
  textError: "#ef4444",

  borderDefault: "#374151",
  borderHighlight: "#22c55e",
  borderDim: "#1f2937",

  selected: "#16a34a",
  hover: "#1e3a2e",
  focus: "#22c55e",
} as const;
