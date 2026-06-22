import { existsSync, readFileSync } from "node:fs";

const packages = ["core", "schema", "testing", "browser"];

const requiredFiles = [
  ".gitignore",
  ".github/workflows/browser-smoke.yml",
  ".github/workflows/optional-browser-matrix.yml",
  ".github/workflows/release-dry-run.yml",
  ".github/workflows/validate.yml",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "tsconfig.base.json",
  "tsconfig.json",
  ...packages.flatMap((name) => [
    `packages/${name}/package.json`,
    `packages/${name}/tsconfig.json`,
    `packages/${name}/src/index.ts`
  ])
];

const missing = requiredFiles.filter((file) => !existsSync(file));
if (missing.length > 0) {
  throw new Error(`Missing required scaffold files:\n${missing.join("\n")}`);
}

const rootManifest = JSON.parse(readFileSync("package.json", "utf8"));
if (rootManifest.packageManager !== "pnpm@10.12.4") {
  throw new Error("Root packageManager must remain pnpm@10.12.4");
}

const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
if (!workspace.includes("packages/*")) {
  throw new Error("pnpm-workspace.yaml must include packages/*");
}

const coreManifest = JSON.parse(readFileSync("packages/core/package.json", "utf8"));
if (coreManifest.dependencies && Object.keys(coreManifest.dependencies).length > 0) {
  throw new Error("@inputflow/core must not have runtime dependencies in Phase 0");
}

for (const name of ["testing", "browser"]) {
  const manifest = JSON.parse(readFileSync(`packages/${name}/package.json`, "utf8"));
  if (manifest.dependencies?.["@inputflow/core"] !== "workspace:*") {
    throw new Error(`@inputflow/${name} must depend on @inputflow/core via workspace:*`);
  }
}

const workflowChecks = [
  {
    file: ".github/workflows/validate.yml",
    job: "validate:",
    name: "Validate"
  },
  {
    file: ".github/workflows/browser-smoke.yml",
    job: "chromium-smoke:",
    name: "Required Browser Smoke"
  },
  {
    file: ".github/workflows/release-dry-run.yml",
    job: "release-dry-run:",
    name: "Release Dry Run"
  },
  {
    file: ".github/workflows/optional-browser-matrix.yml",
    job: "optional-browser-matrix:",
    name: "Optional Browser Matrix"
  }
];

for (const workflow of workflowChecks) {
  const content = readFileSync(workflow.file, "utf8");
  for (const required of [
    `name: ${workflow.name}`,
    "on:",
    "jobs:",
    workflow.job,
    "runs-on:"
  ]) {
    if (!content.includes(required)) {
      throw new Error(`${workflow.file} must include ${required}`);
    }
  }
}

const validateWorkflow = readFileSync(".github/workflows/validate.yml", "utf8");
for (const required of [
  "uses: actions/checkout@v4",
  "uses: actions/setup-node@v4",
  "node-version: 24",
  "cache: pnpm",
  "run: corepack enable",
  "run: pnpm install --frozen-lockfile",
  "run: pnpm validate"
]) {
  if (!validateWorkflow.includes(required)) {
    throw new Error(`.github/workflows/validate.yml must include ${required}`);
  }
}

const browserSmokeWorkflow = readFileSync(".github/workflows/browser-smoke.yml", "utf8");
for (const required of [
  "uses: actions/checkout@v4",
  "uses: actions/setup-node@v4",
  "node-version: 24",
  "cache: pnpm",
  "run: corepack enable",
  "run: pnpm install --frozen-lockfile",
  "run: pnpm exec playwright install --with-deps chromium",
  "run: pnpm browser:test"
]) {
  if (!browserSmokeWorkflow.includes(required)) {
    throw new Error(`.github/workflows/browser-smoke.yml must include ${required}`);
  }
}

const releaseDryRunWorkflow = readFileSync(".github/workflows/release-dry-run.yml", "utf8");
for (const required of [
  "workflow_dispatch:",
  "uses: actions/checkout@v4",
  "uses: actions/setup-node@v4",
  "node-version: 24",
  "cache: pnpm",
  "run: corepack enable",
  "run: pnpm install --frozen-lockfile",
  "run: pnpm exec playwright install --with-deps chromium",
  "run: pnpm release:dry-run"
]) {
  if (!releaseDryRunWorkflow.includes(required)) {
    throw new Error(`.github/workflows/release-dry-run.yml must include ${required}`);
  }
}

console.log("structure check passed");
