# InputFlow v0.1 Rollback and Deprecation Policy

Date: 2026-06-22
Status: Draft policy for owner authorization; no rollback action performed.

## Purpose

This document gives the owner a release/no-release/defer decision aid for what
would happen after an accidental or defective v0.1 publish. It does not run any
registry command and does not authorize a release.

Relevant npm documentation:

- `https://docs.npmjs.com/policies/unpublish/`
- `https://docs.npmjs.com/unpublishing-packages-from-the-registry/`
- `https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/`
- `https://docs.npmjs.com/cli/v11/commands/npm-deprecate/`

## Default Response Model

For an accidental or defective v0.1 release, prefer this order:

1. Stop further release automation.
2. Identify whether the issue is package metadata, package content, docs,
   runtime behavior, security, or legal approval.
3. Publish a fixed version if the package should remain available.
4. Deprecate the defective version with a clear install-time message if users
   should avoid it.
5. Consider unpublish only if npm policy allows it and the owner explicitly
   approves that route.

## Deprecation Policy

Deprecation is the expected rollback communication mechanism when a published
version should remain addressable but should no longer be installed.

Owner must decide the exact message, target package, and version range before
running any command such as:

```txt
npm deprecate @inputflow/core@0.1.0 "message approved by owner"
```

The message should name the replacement version or mitigation path when one
exists.

## Unpublish Policy

Unpublish is not the default rollback path. npm documents time, dependency,
download, and ownership criteria that can make unpublish unavailable or
inappropriate. It can also prevent the same package name and version from being
published again.

Owner must explicitly approve any unpublish attempt, including:

- package name,
- version,
- reason,
- expected registry impact,
- fallback if npm rejects the unpublish request,
- who is responsible for downstream notification.

Phase 12 does not run `npm unpublish`.

## Fix-Forward Policy

For most runtime, docs, or metadata defects, the preferred recovery is a new
patch release after validation:

- fix the defect,
- run the full validation matrix,
- update release notes,
- publish the next owner-approved version,
- deprecate the defective version if users should move away from it.

This policy avoids relying on unpublish availability.

## Owner Decisions Required

Before v0.1 release authorization, owner must name:

- rollback owner,
- deprecation message approver,
- npm account or organization that can deprecate packages,
- unpublish decision owner,
- user notification path,
- maximum tolerated time to publish a fix-forward version.

Until those decisions exist, the expected Phase 12 status remains
`AUTH_PACKET_READY_BLOCKED_OWNER_DECISIONS`.

## Boundaries

This policy does not claim:

- unpublish will be possible,
- deprecation has been performed,
- any package exists on npm,
- owner has approved v0.1 release,
- downstream Sinan adapter acceptance,
- physical Gamepad hardware acceptance.
