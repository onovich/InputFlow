import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const harnessHtmlPath = "examples/manual-gamepad-harness/index.html";
const harnessServerPath = "scripts/serve-manual-gamepad-harness.mjs";
const harnessGuidePath = "docs/InputFlow-Manual-Gamepad-Harness-Guide.md";

export const checkManualGamepadHarness = () => {
  for (const file of [harnessHtmlPath, harnessServerPath, harnessGuidePath]) {
    if (!existsSync(file)) {
      throw new Error(`Missing manual Gamepad harness file: ${file}`);
    }
  }

  const rootManifest = JSON.parse(readFileSync("package.json", "utf8"));
  if (rootManifest.scripts?.["gamepad:harness"] !== "node scripts/serve-manual-gamepad-harness.mjs") {
    throw new Error("package scripts.gamepad:harness must launch the manual Gamepad harness server");
  }

  const html = readFileSync(harnessHtmlPath, "utf8");
  for (const required of [
    "@inputflow/core",
    "@inputflow/browser",
    "createGamepadSource",
    "navigator.getGamepads",
    "<Gamepad>/button/south",
    "<Gamepad>/stick/left",
    "manual.gamepad.confirm",
    "manual.gamepad.move",
    "PASS / FAIL / SKIP / BLOCKED"
  ]) {
    if (!html.includes(required)) {
      throw new Error(`Manual Gamepad harness HTML must include ${required}`);
    }
  }

  const server = readFileSync(harnessServerPath, "utf8");
  if (!server.includes("/examples/manual-gamepad-harness/index.html")) {
    throw new Error("Manual Gamepad harness server must serve the documented harness URL");
  }

  const guide = readFileSync(harnessGuidePath, "utf8");
  for (const required of [
    "pnpm gamepad:harness",
    "not an automated CI gate",
    "docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md"
  ]) {
    if (!guide.includes(required)) {
      throw new Error(`Manual Gamepad harness guide must include ${required}`);
    }
  }

  const workflowDir = ".github/workflows";
  const workflowFiles = readdirSync(workflowDir).filter((file) => file.endsWith(".yml"));
  for (const file of workflowFiles) {
    const workflow = readFileSync(join(workflowDir, file), "utf8");
    if (workflow.includes("gamepad:harness")) {
      throw new Error(`Manual Gamepad harness must not be promoted to CI workflow ${file}`);
    }
  }
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkManualGamepadHarness();
  console.log("manual Gamepad harness check passed");
}
