import { existsSync, readFileSync } from "node:fs";

const requiredDocs = [
  "docs/InputFlow-Development-Plan-v0.1.md",
  "docs/InputFlow-Browser-Smoke-Guide.md",
  "docs/InputFlow-CI-Troubleshooting.md",
  "docs/InputFlow-Manual-Gamepad-Release-Checklist.md",
  "docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase7-Browser-Matrix-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase7-Final-Report.md",
  "docs/InputFlow-Phase8-CI-Release-Gates-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Technical-Architecture-v0.1.md",
  "docs/InputFlow-Sinan-Alignment-and-Roadmap-2026-06-20.md",
  "docs/adr/0001-package-manager.md",
  "docs/adr/0002-host-semantics-boundary.md",
  "docs/adr/0003-replay-first-class-contract.md",
  "docs/adr/0004-context-lease-lifecycle.md",
  "docs/adr/0005-schema-hot-path-boundary.md",
  "docs/adr/0006-browser-matrix-strategy.md",
  "docs/adr/0007-ci-release-gates.md"
];

const missing = requiredDocs.filter((file) => !existsSync(file));
if (missing.length > 0) {
  throw new Error(`Missing required docs:\n${missing.join("\n")}`);
}

const plan = readFileSync("docs/InputFlow-Development-Plan-v0.1.md", "utf8");
const guidePath = "docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md";
if (!plan.includes(guidePath)) {
  throw new Error(`Development plan must link ${guidePath}`);
}

const phase7GuidePath = "docs/InputFlow-Phase7-Browser-Matrix-Goal-Mode-Execution-Guide.md";
if (!plan.includes(phase7GuidePath)) {
  throw new Error(`Development plan must link ${phase7GuidePath}`);
}

const browserSmokeGuidePath = "docs/InputFlow-Browser-Smoke-Guide.md";
if (!plan.includes(browserSmokeGuidePath)) {
  throw new Error(`Development plan must link ${browserSmokeGuidePath}`);
}

const ciTroubleshootingPath = "docs/InputFlow-CI-Troubleshooting.md";
if (!plan.includes(ciTroubleshootingPath)) {
  throw new Error(`Development plan must link ${ciTroubleshootingPath}`);
}

const manualGamepadChecklistPath = "docs/InputFlow-Manual-Gamepad-Release-Checklist.md";
if (!plan.includes(manualGamepadChecklistPath)) {
  throw new Error(`Development plan must link ${manualGamepadChecklistPath}`);
}

const phase7FinalReportPath = "docs/InputFlow-Phase7-Final-Report.md";
if (!plan.includes(phase7FinalReportPath)) {
  throw new Error(`Development plan must link ${phase7FinalReportPath}`);
}

const phase8GuidePath = "docs/InputFlow-Phase8-CI-Release-Gates-Goal-Mode-Execution-Guide.md";
if (!plan.includes(phase8GuidePath)) {
  throw new Error(`Development plan must link ${phase8GuidePath}`);
}

for (const adr of requiredDocs.filter((file) => file.startsWith("docs/adr/"))) {
  if (!plan.includes(adr)) {
    throw new Error(`Development plan must link ${adr}`);
  }
}

console.log("docs check passed");
