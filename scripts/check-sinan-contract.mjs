import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const requiredPhase11Docs = [
  "docs/sinan-cooperation/inputflow-sinan-adapter-contract.md",
  "docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md",
  "docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md",
  "docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md",
  "docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md",
  "docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md"
];

const fixtureTokens = [
  "runtime.gameplay.interact",
  "editor.viewport.select",
  "runtime.pause.confirm",
  "ui.modal.confirm",
  "keyboardInteract",
  "pointerInteract",
  "gamepadInteract",
  "editorSelect",
  "modalBlocksGameplay",
  "pauseBlocksGameplay",
  "pauseReleaseRestoresGameplay"
];

const docsGuardTokens = [
  "inputflow-sinan-poc-handoff-strategy.md",
  "inputflow-sinan-contract-fixture-inventory.md",
  "inputflow-sinan-blur-reset-scenario.md",
  "inputflow-sinan-diagnostics-handoff.md",
  "inputflow-sinan-downstream-acceptance-checklist.md"
];

const boundaryPattern =
  /(@playwright\/test|playwright|react|three|@inputflow\/browser|@actions|sinan|navigator|document|window)/i;

export const checkSinanContract = ({ log = false } = {}) => {
  const failures = [];

  const requireFile = (file) => {
    if (!existsSync(file)) {
      failures.push(`Missing required Sinan handoff asset: ${file}`);
    }
  };

  const readText = (file) => {
    if (!existsSync(file)) {
      failures.push(`Cannot read missing file: ${file}`);
      return "";
    }
    return readFileSync(file, "utf8");
  };

  const requireIncludes = (file, token) => {
    const text = readText(file);
    if (!text.includes(token)) {
      failures.push(`${file} must include ${token}`);
    }
  };

  for (const file of requiredPhase11Docs) {
    requireFile(file);
  }

  const rootManifest = JSON.parse(readText("package.json"));
  if (rootManifest.scripts?.["sinan:contract:check"] !== "node scripts/check-sinan-contract.mjs") {
    failures.push('package.json must define "sinan:contract:check"');
  }

  if (existsSync("packages/sinan")) {
    failures.push("Phase 11 must not create packages/sinan or @inputflow/sinan in this repository");
  }

  const testingFixture = "packages/testing/src/sinan-adapter-contract.ts";
  const testingFixtureTest = "packages/testing/test/sinan-adapter-contract.test.ts";
  const testingIndex = "packages/testing/src/index.ts";

  for (const token of fixtureTokens) {
    requireIncludes(testingFixture, token);
  }

  for (const token of [
    "accepts Keyboard E, Pointer Primary, and Gamepad South",
    "treats editor viewport select",
    "keeps modal input isolated",
    "keeps pause input isolated",
    "restores runtime gameplay after pause context is released"
  ]) {
    requireIncludes(testingFixtureTest, token);
  }

  for (const token of [
    "createSinanGateAdapterContractFixture",
    "runSinanGateAdapterContractReplay",
    "sinanGateActionIds",
    "sinanGateMapIds"
  ]) {
    requireIncludes(testingIndex, token);
  }

  for (const token of docsGuardTokens) {
    requireIncludes("scripts/check-docs.mjs", token);
    requireIncludes("docs/InputFlow-Development-Plan-v0.1.md", token);
  }

  requireIncludes("docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md", "blur");
  requireIncludes("docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md", "CONTROL_CONSUMED");
  requireIncludes(
    "docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md",
    "CONTEXT_EXCLUSIVE_BLOCK"
  );
  requireIncludes(
    "docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md",
    "Physical Gamepad acceptance unless a real controller/browser run is attached"
  );

  const coreBoundaryHits = [];
  for (const file of listFiles("packages/core/src")) {
    const text = readText(file);
    if (boundaryPattern.test(text)) {
      coreBoundaryHits.push(file);
    }
  }
  const coreManifestText = readText("packages/core/package.json");
  if (boundaryPattern.test(coreManifestText)) {
    coreBoundaryHits.push("packages/core/package.json");
  }
  if (coreBoundaryHits.length > 0) {
    failures.push(
      `packages/core must remain free of Sinan/browser/DOM/React/Three host dependencies:\n${coreBoundaryHits.join(
        "\n"
      )}`
    );
  }

  if (failures.length > 0) {
    throw new Error(`Sinan contract check failed:\n${failures.join("\n")}`);
  }

  if (log) {
    console.log("sinan contract check passed");
  }
};

const listFiles = (dir) => {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      entries.push(...listFiles(path));
    } else {
      entries.push(relative(process.cwd(), path).replaceAll("\\", "/"));
    }
  }
  return entries;
};

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  checkSinanContract({ log: true });
}
