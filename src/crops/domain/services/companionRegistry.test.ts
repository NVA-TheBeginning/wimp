import { describe, expect, test } from "bun:test";
import { CropName } from "@/crops/domain/value-objects/cropName";
import { CsvCompanionRegistry } from "@/crops/infrastructure/csvLoader";

describe("CsvCompanionRegistry", () => {
  const csvData = `source,relation,destination
tomato,helps,basil
tomato,helps,carrot
tomato,avoid,fennel
carrot,helps,tomato
carrot,required,leek
leek,required,carrot
fennel,avoid,tomato`;

  test("isHelpful returns true for helpful relationship", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");
    const basil = CropName.create("basil");

    expect(registry.isHelpful(tomato, basil)).toBe(true);
  });

  test("isHelpful returns false when no relationship exists", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");
    const lettuce = CropName.create("lettuce");

    expect(registry.isHelpful(tomato, lettuce)).toBe(false);
  });

  test("isForbidden returns true for forbidden relationship", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");
    const fennel = CropName.create("fennel");

    expect(registry.isForbidden(tomato, fennel)).toBe(true);
  });

  test("isForbidden returns false when no forbidden relationship exists", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");
    const basil = CropName.create("basil");

    expect(registry.isForbidden(tomato, basil)).toBe(false);
  });

  test("getHelpfulCompanions returns all helpful companions", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");

    const companions = registry.getHelpfulCompanions(tomato);
    expect(companions).toHaveLength(2);
    expect(companions.some((c) => c.equals(CropName.create("basil")))).toBe(true);
    expect(companions.some((c) => c.equals(CropName.create("carrot")))).toBe(true);
  });

  test("getForbiddenCompanions returns all forbidden companions", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");

    const forbidden = registry.getForbiddenCompanions(tomato);
    expect(forbidden).toHaveLength(1);
  });

  test("isRequired returns true for required relationship", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const carrot = CropName.create("carrot");
    const leek = CropName.create("leek");

    expect(registry.isRequired(carrot, leek)).toBe(true);
  });

  test("isRequired returns false when no required relationship exists", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");
    const basil = CropName.create("basil");

    expect(registry.isRequired(tomato, basil)).toBe(false);
  });

  test("getRequiredCompanions returns required companions", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const carrot = CropName.create("carrot");

    const required = registry.getRequiredCompanions(carrot);
    expect(required).toHaveLength(1);
    expect(required.some((c) => c.equals(CropName.create("leek")))).toBe(true);
  });

  test("getRequiredCompanions returns empty array when no required companions", () => {
    const registry = CsvCompanionRegistry.fromCsv(csvData);
    const tomato = CropName.create("tomato");

    const required = registry.getRequiredCompanions(tomato);
    expect(required).toHaveLength(0);
  });

  test("handles empty CSV data", () => {
    const registry = CsvCompanionRegistry.fromCsv("source,relation,destination");
    const tomato = CropName.create("tomato");
    const basil = CropName.create("basil");

    expect(registry.isHelpful(tomato, basil)).toBe(false);
    expect(registry.isForbidden(tomato, basil)).toBe(false);
  });
});
