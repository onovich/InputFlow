import { existsSync, readFileSync } from "node:fs";

const readText = (file) => readFileSync(file, "utf8");
const readJson = (file) => JSON.parse(readText(file));

const requiredDocs = [
  "docs/release/InputFlow-v0.1-Release-Authorization-Packet.md",
  "docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md",
  "docs/release/InputFlow-v0.1-Package-Metadata-Audit.md",
  "docs/release/InputFlow-v0.1-Remote-CI-Evidence.md",
  "docs/release/InputFlow-v0.1-Local-Release-Confidence.md",
  "docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md",
  "docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md",
  "docs/InputFlow-Phase10-Physical-Gamepad-Evidence.md",
  "docs/InputFlow-Phase11-Final-Report.md",
  "docs/sinan-cooperation/inputflow-sinan-handoff-packet.md"
];

const requiredDecisions = [
  "public license",
  "version",
  "git tag",
  "npm access",
  "dist-tag",
  "publish owner",
  "release notes sign-off",
  "rollback"
];

const assertIncludes = (label, text, expected) => {
  if (!text.includes(expected)) {
    throw new Error(`${label} must include ${JSON.stringify(expected)}`);
  }
};

const assertDocExists = (file) => {
  if (!existsSync(file)) {
    throw new Error(`Missing release authorization document: ${file}`);
  }
};

const assertNoReleaseActions = () => {
  for (const packageName of ["core", "schema", "testing", "browser"]) {
    const manifestPath = `packages/${packageName}/package.json`;
    const manifest = readJson(manifestPath);
    const scopeName = `@inputflow/${packageName}`;

    if (manifest.version !== "0.0.0") {
      throw new Error(`${scopeName} version must remain 0.0.0 until owner authorization`);
    }
    if (manifest.license !== "UNLICENSED") {
      throw new Error(`${scopeName} license must remain UNLICENSED until owner authorization`);
    }
    if (manifest.publishConfig) {
      throw new Error(`${scopeName} must not define publishConfig before owner authorization`);
    }
  }
};

export const checkReleaseAuthorization = () => {
  for (const file of requiredDocs) {
    assertDocExists(file);
  }

  const packet = readText("docs/release/InputFlow-v0.1-Release-Authorization-Packet.md");
  assertIncludes("authorization packet", packet, "AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS");
  assertIncludes("authorization packet", packet, "HARNESS_READY_NO_HARDWARE");
  assertIncludes("authorization packet", packet, "HANDOFF_READY_BLOCKED_DOWNSTREAM");
  for (const boundary of ["npm publish", "GitHub Release", "git tag", "secrets"]) {
    assertIncludes("authorization packet", packet, boundary);
  }
  for (const file of requiredDocs.slice(1, 7)) {
    assertIncludes("authorization packet", packet, file);
  }

  const matrix = readText("docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md");
  for (const decision of requiredDecisions) {
    assertIncludes("owner decision matrix", matrix.toLowerCase(), decision);
  }
  assertIncludes("owner decision matrix", matrix, "BLOCKED_OWNER_DECISION");
  assertIncludes("owner decision matrix", matrix, "HARNESS_READY_NO_HARDWARE");
  assertIncludes("owner decision matrix", matrix, "HANDOFF_READY_BLOCKED_DOWNSTREAM");

  const remoteEvidence = readText("docs/release/InputFlow-v0.1-Remote-CI-Evidence.md");
  for (const workflow of [
    "Validate",
    "Required Browser Smoke",
    "Release Dry Run",
    "Optional Browser Matrix"
  ]) {
    assertIncludes("remote CI evidence", remoteEvidence, workflow);
  }
  assertIncludes("remote CI evidence", remoteEvidence, "success");
  assertIncludes("remote CI evidence", remoteEvidence, "https://github.com/onovich/InputFlow/actions/runs/");

  const localConfidence = readText("docs/release/InputFlow-v0.1-Local-Release-Confidence.md");
  for (const command of [
    "pnpm validate",
    "pnpm workflow:check",
    "pnpm sinan:contract:check",
    "pnpm gamepad:harness:check",
    "pnpm browser:test",
    "pnpm browser:test:all",
    "pnpm release:dry-run",
    "pnpm package:dry-run"
  ]) {
    assertIncludes("local release confidence", localConfidence, command);
  }

  const packageAudit = readText("docs/release/InputFlow-v0.1-Package-Metadata-Audit.md");
  for (const packageName of ["core", "schema", "testing", "browser"]) {
    assertIncludes("package metadata audit", packageAudit, `@inputflow/${packageName}`);
  }
  assertIncludes("package metadata audit", packageAudit, "0.0.0");
  assertIncludes("package metadata audit", packageAudit, "UNLICENSED");

  const publishSimulation = readText(
    "docs/release/InputFlow-v0.1-Publish-Simulation-and-Provenance.md"
  );
  assertIncludes("publish simulation", publishSimulation, "npm publish");
  assertIncludes("publish simulation", publishSimulation, "provenance");
  assertIncludes("publish simulation", publishSimulation, "AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS");

  const rollbackPolicy = readText("docs/release/InputFlow-v0.1-Rollback-and-Deprecation-Policy.md");
  assertIncludes("rollback policy", rollbackPolicy, "npm deprecate");
  assertIncludes("rollback policy", rollbackPolicy, "unpublish");
  assertIncludes("rollback policy", rollbackPolicy, "AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS");

  const plan = readText("docs/InputFlow-Development-Plan-v0.1.md");
  for (const file of requiredDocs.slice(0, 7)) {
    assertIncludes("development plan", plan, file);
  }

  assertNoReleaseActions();
};

if (process.argv[1]?.endsWith("check-release-authorization.mjs")) {
  checkReleaseAuthorization();
  console.log("release authorization check passed");
}
