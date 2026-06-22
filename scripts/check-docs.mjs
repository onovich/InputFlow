import { existsSync, readFileSync } from "node:fs";

const requiredDocs = [
  "README.md",
  "CHANGELOG.md",
  "docs/InputFlow-Development-Plan-v0.1.md",
  "docs/InputFlow-Browser-Smoke-Guide.md",
  "docs/InputFlow-CI-Troubleshooting.md",
  "docs/InputFlow-Remote-CI-Observation-Guide.md",
  "docs/InputFlow-Phase9-Remote-CI-Evidence.md",
  "docs/InputFlow-Phase9-Package-Dry-Run-Audit.md",
  "docs/InputFlow-Manual-Gamepad-Harness-Guide.md",
  "docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md",
  "docs/InputFlow-Manual-Gamepad-Release-Checklist.md",
  "docs/InputFlow-Phase10-Final-Report.md",
  "docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase7-Browser-Matrix-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase7-Final-Report.md",
  "docs/InputFlow-Phase8-CI-Release-Gates-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase8-Final-Report.md",
  "docs/InputFlow-Phase9-v0.1-Release-Candidate-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase9-Final-Report.md",
  "docs/InputFlow-Phase10-Physical-Gamepad-Acceptance-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Phase11-Sinan-Adapter-POC-Handoff-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Technical-Architecture-v0.1.md",
  "docs/InputFlow-Sinan-Alignment-and-Roadmap-2026-06-20.md",
  "docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md",
  "docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md",
  "docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md",
  "docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md",
  "docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md",
  "docs/sinan-cooperation/inputflow-sinan-package-export-audit.md",
  "docs/sinan-cooperation/inputflow-sinan-handoff-packet.md",
  "docs/adr/0001-package-manager.md",
  "docs/adr/0002-host-semantics-boundary.md",
  "docs/adr/0003-replay-first-class-contract.md",
  "docs/adr/0004-context-lease-lifecycle.md",
  "docs/adr/0005-schema-hot-path-boundary.md",
  "docs/adr/0006-browser-matrix-strategy.md",
  "docs/adr/0007-ci-release-gates.md",
  "docs/adr/0008-v0.1-release-candidate-policy.md",
  "docs/adr/0009-physical-gamepad-acceptance-policy.md"
];

const missing = requiredDocs.filter((file) => !existsSync(file));
if (missing.length > 0) {
  throw new Error(`Missing required docs:\n${missing.join("\n")}`);
}

const plan = readFileSync("docs/InputFlow-Development-Plan-v0.1.md", "utf8");
if (!plan.includes("README.md")) {
  throw new Error("Development plan must link README.md");
}
if (!plan.includes("CHANGELOG.md")) {
  throw new Error("Development plan must link CHANGELOG.md");
}

const readme = readFileSync("README.md", "utf8");
for (const requiredReadmeLink of [
  "CHANGELOG.md",
  "docs/InputFlow-v0.1-API-Examples.md",
  "docs/InputFlow-Technical-Architecture-v0.1.md",
  "docs/InputFlow-CI-Troubleshooting.md",
  "docs/InputFlow-Remote-CI-Observation-Guide.md",
  "docs/InputFlow-Phase9-Package-Dry-Run-Audit.md",
  "docs/InputFlow-Manual-Gamepad-Release-Checklist.md",
  "docs/InputFlow-Manual-Gamepad-Harness-Guide.md",
  "docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md",
  "docs/InputFlow-Phase10-Final-Report.md",
  "docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md",
  "docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md",
  "docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md",
  "docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md",
  "docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md",
  "docs/sinan-cooperation/inputflow-sinan-package-export-audit.md",
  "docs/sinan-cooperation/inputflow-sinan-handoff-packet.md",
  "docs/InputFlow-Phase9-Final-Report.md"
]) {
  if (!readme.includes(requiredReadmeLink)) {
    throw new Error(`README.md must link ${requiredReadmeLink}`);
  }
}
if (!readme.includes("pnpm sinan:contract:check")) {
  throw new Error("README.md must document pnpm sinan:contract:check");
}

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

const remoteCiEvidencePath = "docs/InputFlow-Phase9-Remote-CI-Evidence.md";
if (!plan.includes(remoteCiEvidencePath)) {
  throw new Error(`Development plan must link ${remoteCiEvidencePath}`);
}

const packageDryRunAuditPath = "docs/InputFlow-Phase9-Package-Dry-Run-Audit.md";
if (!plan.includes(packageDryRunAuditPath)) {
  throw new Error(`Development plan must link ${packageDryRunAuditPath}`);
}

const manualGamepadHarnessGuidePath = "docs/InputFlow-Manual-Gamepad-Harness-Guide.md";
if (!plan.includes(manualGamepadHarnessGuidePath)) {
  throw new Error(`Development plan must link ${manualGamepadHarnessGuidePath}`);
}

const phase10PhysicalGamepadEvidencePath = "docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md";
if (!plan.includes(phase10PhysicalGamepadEvidencePath)) {
  throw new Error(`Development plan must link ${phase10PhysicalGamepadEvidencePath}`);
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

const phase8FinalReportPath = "docs/InputFlow-Phase8-Final-Report.md";
if (!plan.includes(phase8FinalReportPath)) {
  throw new Error(`Development plan must link ${phase8FinalReportPath}`);
}

const phase9GuidePath = "docs/InputFlow-Phase9-v0.1-Release-Candidate-Goal-Mode-Execution-Guide.md";
if (!plan.includes(phase9GuidePath)) {
  throw new Error(`Development plan must link ${phase9GuidePath}`);
}

const phase9FinalReportPath = "docs/InputFlow-Phase9-Final-Report.md";
if (!plan.includes(phase9FinalReportPath)) {
  throw new Error(`Development plan must link ${phase9FinalReportPath}`);
}

const phase10GuidePath = "docs/InputFlow-Phase10-Physical-Gamepad-Acceptance-Goal-Mode-Execution-Guide.md";
if (!plan.includes(phase10GuidePath)) {
  throw new Error(`Development plan must link ${phase10GuidePath}`);
}

const phase10FinalReportPath = "docs/InputFlow-Phase10-Final-Report.md";
if (!plan.includes(phase10FinalReportPath)) {
  throw new Error(`Development plan must link ${phase10FinalReportPath}`);
}

const phase11GuidePath = "docs/InputFlow-Phase11-Sinan-Adapter-POC-Handoff-Goal-Mode-Execution-Guide.md";
if (!plan.includes(phase11GuidePath)) {
  throw new Error(`Development plan must link ${phase11GuidePath}`);
}

const phase11HandoffStrategyPath = "docs/sinan-cooperation/inputflow-sinan-poc-handoff-strategy.md";
if (!plan.includes(phase11HandoffStrategyPath)) {
  throw new Error(`Development plan must link ${phase11HandoffStrategyPath}`);
}

const phase11FixtureInventoryPath = "docs/sinan-cooperation/inputflow-sinan-contract-fixture-inventory.md";
if (!plan.includes(phase11FixtureInventoryPath)) {
  throw new Error(`Development plan must link ${phase11FixtureInventoryPath}`);
}

const phase11BlurResetScenarioPath = "docs/sinan-cooperation/inputflow-sinan-blur-reset-scenario.md";
if (!plan.includes(phase11BlurResetScenarioPath)) {
  throw new Error(`Development plan must link ${phase11BlurResetScenarioPath}`);
}

const phase11DiagnosticsHandoffPath = "docs/sinan-cooperation/inputflow-sinan-diagnostics-handoff.md";
if (!plan.includes(phase11DiagnosticsHandoffPath)) {
  throw new Error(`Development plan must link ${phase11DiagnosticsHandoffPath}`);
}

const phase11DownstreamAcceptanceChecklistPath =
  "docs/sinan-cooperation/inputflow-sinan-downstream-acceptance-checklist.md";
if (!plan.includes(phase11DownstreamAcceptanceChecklistPath)) {
  throw new Error(`Development plan must link ${phase11DownstreamAcceptanceChecklistPath}`);
}

const phase11PackageExportAuditPath =
  "docs/sinan-cooperation/inputflow-sinan-package-export-audit.md";
if (!plan.includes(phase11PackageExportAuditPath)) {
  throw new Error(`Development plan must link ${phase11PackageExportAuditPath}`);
}

const phase11HandoffPacketPath = "docs/sinan-cooperation/inputflow-sinan-handoff-packet.md";
if (!plan.includes(phase11HandoffPacketPath)) {
  throw new Error(`Development plan must link ${phase11HandoffPacketPath}`);
}

if (!plan.includes("pnpm sinan:contract:check")) {
  throw new Error("Development plan must document pnpm sinan:contract:check");
}

for (const adr of requiredDocs.filter((file) => file.startsWith("docs/adr/"))) {
  if (!plan.includes(adr)) {
    throw new Error(`Development plan must link ${adr}`);
  }
}

console.log("docs check passed");
