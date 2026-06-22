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
  "docs/release/InputFlow-v0.1-Final-Release-Candidate-Audit.md",
  "docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md",
  "docs/release/InputFlow-v0.1-Owner-Decision-Record.md",
  "docs/InputFlow-Phase12-Final-Report.md",
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
  "provenance",
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
  const rootManifest = readJson("package.json");
  if (rootManifest.scripts?.["release:authorization:check"] !== "node scripts/check-release-authorization.mjs") {
    throw new Error("root package.json must expose pnpm release:authorization:check");
  }
  if (rootManifest.version !== "0.0.0") {
    throw new Error("root package.json version must remain 0.0.0 until owner authorization");
  }
  if (rootManifest.private !== true) {
    throw new Error("root package.json must remain private until owner authorization");
  }
  if ("license" in rootManifest) {
    throw new Error("root package.json must not define a license until owner authorization");
  }
  if (rootManifest.publishConfig) {
    throw new Error("root package.json must not define publishConfig before owner authorization");
  }

  for (const [scriptName, scriptValue] of Object.entries(rootManifest.scripts ?? {})) {
    for (const blockedCommand of ["npm publish", "gh release create", "git tag"]) {
      if (scriptValue.includes(blockedCommand)) {
        throw new Error(`${scriptName} must not run ${blockedCommand} during Phase 13`);
      }
    }
  }

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
  assertIncludes("authorization packet", packet, "RELEASE_DEFERRED_DECISION_RECORDED");
  assertIncludes("authorization packet", packet, "STILL_BLOCKED_EXACT_LICENSE");
  assertIncludes("authorization packet", packet, "HARNESS_READY_NO_HARDWARE");
  assertIncludes("authorization packet", packet, "HANDOFF_READY_BLOCKED_DOWNSTREAM");
  assertIncludes("authorization packet", packet, "accepted only as an RC known limit");
  assertIncludes("authorization packet", packet, "no real release authorized");
  for (const boundary of ["npm publish", "GitHub Release", "git tag", "secrets"]) {
    assertIncludes("authorization packet", packet, boundary);
  }
  for (const file of requiredDocs.filter((entry) => entry.startsWith("docs/release/")).slice(1)) {
    assertIncludes("authorization packet", packet, file);
  }

  const ownerRecord = readText("docs/release/InputFlow-v0.1-Owner-Decision-Record.md");
  for (const expected of [
    "RELEASE_DEFERRED_DECISION_RECORDED",
    "DEFERRED_RELEASE_DECISION",
    "0.1.0-rc.0",
    "Public package",
    "`next`",
    "STILL_BLOCKED_EXACT_LICENSE",
    "ACCEPTED_FOR_RC_KNOWN_LIMIT",
    "HARNESS_READY_NO_HARDWARE",
    "HANDOFF_READY_BLOCKED_DOWNSTREAM",
    "OWNER_APPROVAL_REQUIRED"
  ]) {
    assertIncludes("owner decision record", ownerRecord, expected);
  }
  for (const boundary of [
    "not a package publish record",
    "No npm publish",
    "GitHub Release",
    "git tag",
    "secrets",
    "publishConfig",
    "provenance configuration",
    "no physical Gamepad PASS",
    "no downstream Sinan adapter acceptance"
  ]) {
    assertIncludes("owner decision record", ownerRecord, boundary);
  }

  const matrix = readText("docs/release/InputFlow-v0.1-Owner-Decision-Matrix.md");
  for (const decision of requiredDecisions) {
    assertIncludes("owner decision matrix", matrix.toLowerCase(), decision);
  }
  assertIncludes("owner decision matrix", matrix, "RELEASE_DEFERRED_DECISION_RECORDED");
  assertIncludes("owner decision matrix", matrix, "DEFERRED_RELEASE_DECISION");
  assertIncludes("owner decision matrix", matrix, "STILL_BLOCKED_EXACT_LICENSE");
  assertIncludes("owner decision matrix", matrix, "BLOCKED_OWNER_DECISION");
  assertIncludes("owner decision matrix", matrix, "ACCEPTED_FOR_RC_KNOWN_LIMIT");
  assertIncludes("owner decision matrix", matrix, "HARNESS_READY_NO_HARDWARE");
  assertIncludes("owner decision matrix", matrix, "HANDOFF_READY_BLOCKED_DOWNSTREAM");
  assertIncludes("owner decision matrix", matrix, "no physical Gamepad PASS claimed");
  assertIncludes("owner decision matrix", matrix, "no downstream Sinan adapter acceptance claimed");

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

  const ownerChecklist = readText("docs/release/InputFlow-v0.1-Owner-Sign-Off-Checklist.md");
  assertIncludes("owner sign-off checklist", ownerChecklist, "Authorize v0.1 release");
  assertIncludes("owner sign-off checklist", ownerChecklist, "Defer v0.1 release");
  assertIncludes("owner sign-off checklist", ownerChecklist, "Decline v0.1 release");
  assertIncludes("owner sign-off checklist", ownerChecklist, "AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS");
  assertIncludes("owner sign-off checklist", ownerChecklist, "RELEASE_DEFERRED_DECISION_RECORDED");
  assertIncludes("owner sign-off checklist", ownerChecklist, "STILL_BLOCKED_EXACT_LICENSE");
  assertIncludes("owner sign-off checklist", ownerChecklist, "RC known limit only");
  assertIncludes("owner sign-off checklist", ownerChecklist, "no real release authorized");

  const finalReport = readText("docs/InputFlow-Phase12-Final-Report.md");
  assertIncludes("Phase 12 final report", finalReport, "AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS");
  assertIncludes("Phase 12 final report", finalReport, "HARNESS_READY_NO_HARDWARE");
  assertIncludes("Phase 12 final report", finalReport, "HANDOFF_READY_BLOCKED_DOWNSTREAM");
  assertIncludes("Phase 12 final report", finalReport, "Phase 12 did not:");

  const plan = readText("docs/InputFlow-Development-Plan-v0.1.md");
  for (const file of requiredDocs) {
    assertIncludes("development plan", plan, file);
  }

  assertNoReleaseActions();
};

if (process.argv[1]?.endsWith("check-release-authorization.mjs")) {
  checkReleaseAuthorization();
  console.log("release authorization check passed");
}
