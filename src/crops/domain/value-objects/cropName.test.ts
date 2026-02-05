import { describe, expect, test } from "bun:test";
import { CropName } from "@/crops/domain/value-objects/cropName";

describe("CropName", () => {
  test("creates valid crop name", () => {
    const name = CropName.create("Tomato");
    expect(name.getValue()).toBe("tomato");
  });

  test("normalizes to lowercase and trims whitespace", () => {
    const name = CropName.create("  CARROT  ");
    expect(name.getValue()).toBe("carrot");
  });

  test("throws error for empty name", () => {
    expect(() => CropName.create("")).toThrow("Crop name cannot be empty");
    expect(() => CropName.create("   ")).toThrow("Crop name cannot be empty");
  });

  test("throws error for name exceeding 100 characters", () => {
    const longName = "a".repeat(101);
    expect(() => CropName.create(longName)).toThrow("Crop name cannot exceed 100 characters");
  });

  test("equals returns true for same normalized value", () => {
    const name1 = CropName.create("Tomato");
    const name2 = CropName.create("TOMATO");
    expect(name1.equals(name2)).toBe(true);
  });

  test("equals returns false for different values", () => {
    const name1 = CropName.create("Tomato");
    const name2 = CropName.create("Carrot");
    expect(name1.equals(name2)).toBe(false);
  });
});
