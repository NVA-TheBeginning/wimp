import { JsonCompanionKnowledge } from "@/crops/infrastructure/jsonCompanionKnowledge";
import { GenerateCompanionListUseCase } from "@/planting-intelligence/application/use-cases/generateCompanionList";

interface CliOptions {
  plants: string[];
  areaM2: number | null;
  dataPath: string;
  json: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    plants: [],
    areaM2: null,
    dataPath: "data/companions.json",
    json: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) continue;

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--plants") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --plants");
      options.plants = value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
      i += 1;
      continue;
    }

    if (arg === "--area") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --area");
      options.areaM2 = Number(value.replace(",", "."));
      i += 1;
      continue;
    }

    if (arg === "--data") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --data");
      options.dataPath = value;
      i += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp(): void {
  console.log("Test algorithm 1 (companion list optimization)");
  console.log("");
  console.log("Usage:");
  console.log("  bun run test:algo1 -- --plants tomato,carrot --area 9 [--data data/companions.json] [--json]");
  console.log("");
  console.log("Options:");
  console.log("  --plants   Comma-separated plant ids (slugs)");
  console.log("  --area     Garden area in m2");
  console.log("  --data     Companion dataset path (default: data/companions.json)");
  console.log("  --json     Print raw JSON output");
}

function run(): void {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (options.areaM2 === null) {
    throw new Error("Missing required option --area");
  }

  if (options.plants.length === 0) {
    throw new Error("Missing required option --plants");
  }

  const useCase = new GenerateCompanionListUseCase(new JsonCompanionKnowledge(options.dataPath));
  const output = useCase.execute({
    selectedPlantIds: options.plants,
    areaM2: options.areaM2,
  });

  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`Area: ${output.areaM2} m2`);
  console.log(`Side length: ${output.sideLengthMeters.toFixed(2)} m`);
  console.log(`Capacity: ${output.capacity} plants`);
  console.log("");
  console.log("Recommended list:");
  for (const allocation of output.allocations) {
    console.log(`- ${allocation.plantId} x${allocation.quantity} (${allocation.source})`);
  }
}

try {
  run();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  console.error("Use --help for usage.");
  process.exitCode = 1;
}
