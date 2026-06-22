import { existsSync, readFileSync } from "node:fs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

const assertIncludes = (file, requiredValues) => {
  const content = readFileSync(file, "utf8");
  for (const required of requiredValues) {
    if (!content.includes(required)) {
      throw new Error(`${file} must include ${required}`);
    }
  }
};

const assertCommands = (label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

export const checkWorkflows = () => {
  const requiredWorkflowFiles = [
    ".github/workflows/browser-smoke.yml",
    ".github/workflows/optional-browser-matrix.yml",
    ".github/workflows/release-dry-run.yml",
    ".github/workflows/validate.yml"
  ];

  const missing = requiredWorkflowFiles.filter((file) => !existsSync(file));
  if (missing.length > 0) {
    throw new Error(`Missing workflow files:\n${missing.join("\n")}`);
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
    assertIncludes(workflow.file, [
      `name: ${workflow.name}`,
      "on:",
      "jobs:",
      workflow.job,
      "runs-on:"
    ]);
  }

  assertIncludes(".github/workflows/validate.yml", [
    "uses: actions/checkout@v4",
    "uses: actions/setup-node@v4",
    "node-version: 24",
    "cache: pnpm",
    "run: corepack enable",
    "run: pnpm install --frozen-lockfile",
    "run: pnpm validate"
  ]);

  for (const file of [
    ".github/workflows/browser-smoke.yml",
    ".github/workflows/release-dry-run.yml",
    ".github/workflows/optional-browser-matrix.yml"
  ]) {
    assertIncludes(file, [
      "uses: actions/checkout@v4",
      "uses: actions/setup-node@v4",
      "uses: actions/cache@v4",
      "uses: actions/upload-artifact@v4",
      "node-version: 24",
      "cache: pnpm",
      "path: ~/.cache/ms-playwright",
      "path: test-results/browser",
      "run: corepack enable",
      "run: pnpm install --frozen-lockfile"
    ]);
  }

  assertIncludes(".github/workflows/browser-smoke.yml", [
    "run: pnpm exec playwright install --with-deps chromium",
    "run: pnpm browser:test"
  ]);
  assertIncludes(".github/workflows/release-dry-run.yml", [
    "workflow_dispatch:",
    "run: pnpm exec playwright install --with-deps chromium",
    "run: pnpm release:dry-run"
  ]);
  assertIncludes(".github/workflows/optional-browser-matrix.yml", [
    "workflow_dispatch:",
    "run: pnpm exec playwright install --with-deps chromium firefox webkit",
    "run: pnpm browser:test:all"
  ]);

  const rootManifest = readJson("package.json");
  assertCommands("package scripts.validate", rootManifest.scripts?.validate, "pnpm lint && pnpm typecheck && pnpm build && pnpm test && pnpm structure:check && pnpm docs:check");
  assertCommands("package scripts.browser:test", rootManifest.scripts?.["browser:test"], "playwright test --project=chromium");
  assertCommands("package scripts.browser:test:all", rootManifest.scripts?.["browser:test:all"], "playwright test");
  assertCommands("package scripts.release:dry-run", rootManifest.scripts?.["release:dry-run"], "pnpm browser:test && pnpm package:dry-run");

  const opsConfig = readJson(".codex/project-ops-workflow.json");
  assertCommands("ops smoke commands", opsConfig.operations?.smoke?.commands, ["pnpm browser:test"]);
  assertCommands("ops package commands", opsConfig.operations?.package?.commands, ["pnpm package:dry-run"]);
  assertCommands("ops releaseDryRun commands", opsConfig.operations?.releaseDryRun?.commands, [
    "pnpm release:dry-run"
  ]);
};

if (process.argv[1]?.endsWith("check-workflows.mjs")) {
  checkWorkflows();
  console.log("workflow check passed");
}

