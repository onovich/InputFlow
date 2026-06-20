import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const textExtensions = new Set([
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".yaml",
  ".yml"
]);

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
  encoding: "utf8"
})
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => {
    const normalized = file.replaceAll("\\", "/");
    if (normalized.includes("/dist/") || normalized.includes("/node_modules/")) {
      return false;
    }
    return textExtensions.has(normalized.slice(normalized.lastIndexOf(".")));
  });

const failures = [];

for (const file of files) {
  const bytes = readFileSync(file);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    failures.push(`${file}: UTF-8 BOM is not allowed`);
  }

  const text = bytes.toString("utf8");
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      failures.push(`${file}:${index + 1}: trailing whitespace`);
    }
  });
}

const coreFiles = files.filter((file) => file.replaceAll("\\", "/").startsWith("packages/core/src/"));
const forbiddenCorePattern =
  /\b(from|import)\s*(?:\([^)]*\)\s*)?["'](?:react|three|zod|@inputflow\/schema|@inputflow\/browser|@inputflow\/testing|.*sinan.*)["']|\b(window|document|navigator)\b/i;

for (const file of coreFiles) {
  const text = readFileSync(file, "utf8");
  if (forbiddenCorePattern.test(text)) {
    failures.push(`${file}: core must not import host/browser/schema dependencies or use DOM globals`);
  }
}

if (failures.length > 0) {
  throw new Error(`Lint failed:\n${failures.join("\n")}`);
}

console.log("lint passed");
