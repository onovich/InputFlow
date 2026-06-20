import { existsSync, readFileSync } from "node:fs";

const requiredDocs = [
  "docs/InputFlow-Development-Plan-v0.1.md",
  "docs/InputFlow-Phase0-6-Goal-Mode-Execution-Guide.md",
  "docs/InputFlow-Technical-Architecture-v0.1.md",
  "docs/InputFlow-Sinan-Alignment-and-Roadmap-2026-06-20.md",
  "docs/adr/0001-package-manager.md",
  "docs/adr/0002-host-semantics-boundary.md",
  "docs/adr/0003-replay-first-class-contract.md",
  "docs/adr/0004-context-lease-lifecycle.md",
  "docs/adr/0005-schema-hot-path-boundary.md"
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

for (const adr of requiredDocs.filter((file) => file.startsWith("docs/adr/"))) {
  if (!plan.includes(adr)) {
    throw new Error(`Development plan must link ${adr}`);
  }
}

console.log("docs check passed");
