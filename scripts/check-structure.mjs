import { existsSync, readFileSync } from "node:fs";
import { checkPackageMetadata } from "./check-package-metadata.mjs";
import { checkWorkflows } from "./check-workflows.mjs";

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

checkWorkflows();
checkPackageMetadata();

console.log("structure check passed");
