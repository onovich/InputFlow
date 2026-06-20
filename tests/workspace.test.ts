import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8"));

describe("workspace baseline", () => {
  it("declares the expected first-party packages", () => {
    const packageNames = ["core", "schema", "testing", "browser"].map(
      (name) => readJson(`packages/${name}/package.json`).name
    );

    expect(packageNames).toEqual([
      "@inputflow/core",
      "@inputflow/schema",
      "@inputflow/testing",
      "@inputflow/browser"
    ]);
  });

  it("keeps core free of runtime dependencies", () => {
    const coreManifest = readJson("packages/core/package.json");

    expect(coreManifest.dependencies).toBeUndefined();
  });
});
