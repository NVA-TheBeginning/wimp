import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { StartScreen } from "./components/StartScreen";

const renderer = await createCliRenderer();
createRoot(renderer).render(<StartScreen />);
