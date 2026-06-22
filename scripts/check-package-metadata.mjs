import { readFileSync } from "node:fs";

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

const packageNames = ["core", "schema", "testing", "browser"];
const repositoryUrl = "git+https://github.com/onovich/InputFlow.git";
const homepage = "https://github.com/onovich/InputFlow#readme";
const bugsUrl = "https://github.com/onovich/InputFlow/issues";

const assertEqual = (label, actual, expected) => {
  if (actual !== expected) {
    throw new Error(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

const assertArrayEqual = (label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} must be ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};

const assertString = (label, actual) => {
  if (typeof actual !== "string" || actual.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
};

const assertKeywordSet = (label, actual) => {
  if (!Array.isArray(actual) || actual.length < 3) {
    throw new Error(`${label} must include at least three keywords`);
  }
  for (const keyword of actual) {
    assertString(`${label} entry`, keyword);
  }
};

export const checkPackageMetadata = () => {
  const rootManifest = readJson("package.json");
  assertEqual("root private", rootManifest.private, true);

  for (const packageName of packageNames) {
    const manifestPath = `packages/${packageName}/package.json`;
    const manifest = readJson(manifestPath);
    const scopeName = `@inputflow/${packageName}`;

    assertEqual(`${scopeName} name`, manifest.name, scopeName);
    assertString(`${scopeName} version`, manifest.version);
    assertString(`${scopeName} description`, manifest.description);
    assertString(`${scopeName} license`, manifest.license);
    assertEqual(`${scopeName} type`, manifest.type, "module");
    assertEqual(`${scopeName} sideEffects`, manifest.sideEffects, false);
    assertEqual(`${scopeName} main`, manifest.main, "./dist/index.js");
    assertEqual(`${scopeName} types`, manifest.types, "./dist/index.d.ts");
    assertArrayEqual(`${scopeName} files`, manifest.files, ["dist"]);
    assertKeywordSet(`${scopeName} keywords`, manifest.keywords);

    assertEqual(`${scopeName} repository.type`, manifest.repository?.type, "git");
    assertEqual(`${scopeName} repository.url`, manifest.repository?.url, repositoryUrl);
    assertEqual(`${scopeName} repository.directory`, manifest.repository?.directory, `packages/${packageName}`);
    assertEqual(`${scopeName} homepage`, manifest.homepage, homepage);
    assertEqual(`${scopeName} bugs.url`, manifest.bugs?.url, bugsUrl);

    assertEqual(`${scopeName} exports root types`, manifest.exports?.["."]?.types, "./dist/index.d.ts");
    assertEqual(`${scopeName} exports root default`, manifest.exports?.["."]?.default, "./dist/index.js");
    assertEqual(`${scopeName} exports package.json`, manifest.exports?.["./package.json"], "./package.json");
  }

  const coreManifest = readJson("packages/core/package.json");
  if (coreManifest.dependencies && Object.keys(coreManifest.dependencies).length > 0) {
    throw new Error("@inputflow/core must not have runtime dependencies");
  }

  const schemaManifest = readJson("packages/schema/package.json");
  if (!schemaManifest.dependencies?.zod) {
    throw new Error("@inputflow/schema must keep zod as an authoring-time dependency");
  }

  for (const packageName of ["testing", "browser"]) {
    const manifest = readJson(`packages/${packageName}/package.json`);
    assertEqual(
      `@inputflow/${packageName} core workspace dependency`,
      manifest.dependencies?.["@inputflow/core"],
      "workspace:*"
    );
  }
};

if (process.argv[1]?.endsWith("check-package-metadata.mjs")) {
  checkPackageMetadata();
  console.log("package metadata check passed");
}
