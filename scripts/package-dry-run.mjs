import { execFileSync } from "node:child_process";
import { join } from "node:path";

const packages = ["core", "schema", "testing", "browser"];
const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";
const npmArgs = process.platform === "win32"
  ? ["/d", "/s", "/c", "npm pack --dry-run"]
  : ["pack", "--dry-run"];

for (const packageName of packages) {
  const cwd = join("packages", packageName);
  console.log("> npm pack --dry-run (" + cwd + ")");
  execFileSync(npmCommand, npmArgs, {
    cwd,
    stdio: "inherit"
  });
}
