---
name: devcontainer-setup
version: 1.0.0
description: >
  Set up or review a polyglot-ready .devcontainer environment (Docker
  Compose + Dockerfile + devcontainer.json) built on the Microsoft
  devcontainers base images, for any project stack.
  USE FOR: creating a new .devcontainer for a project, or auditing an
  existing .devcontainer against the standard.
  DO NOT USE FOR: production Docker image authoring, Kubernetes/Compose
  deployment manifests, or CI pipeline configuration.
argument-hint: "Optional: project stack hint (otherwise inferred from the repo); no arg audits an existing .devcontainer"
---

# Devcontainer Setup

## Overview

Create or review a `.devcontainer` environment that is polyglot-ready from
a Microsoft devcontainers base image, with the three-file structure
(`devcontainer.json` + `docker-compose.yml` + `Dockerfile`). The full file
templates, per-file rules, verification steps, and audit checklist live in
[references/reference.md](references/reference.md). **Prime directive:
never create or modify files until Docker is confirmed running, infer the
stack from the project rather than hard-coding a language, and never
report success until the container has built, started, and been confirmed
running.**

## When to Use

- Creating a new `.devcontainer` for a project.
- Auditing an existing `.devcontainer` against the standard.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: DETECT — mode and prerequisites

Determine whether `.devcontainer/` exists (New Setup vs. Audit). Verify
Docker is installed and running (`docker info`); if it fails, stop, tell
the user, and link https://docs.docker.com/get-docker/ — do not create any
files.

### Step 2: BUILD or AUDIT — apply the standard

**New setup:** create the three files from
[references/reference.md](references/reference.md), inferring the base
image variant, ports, extensions, and tooling from the project, and always
including the SSH + `.gitconfig` mounts. **Audit:** read the existing
files, compare against the audit checklist, present numbered findings
(⚠️ / ℹ️ / ✅), let the user select fixes, and modify only the
corresponding parts — preserving everything unflagged.

### Step 3: VERIFY — prove the container works

Dispatch a subagent to `build` → `up -d` → `ps` (confirm the `app` service
is running) → `down`, per
[references/reference.md](references/reference.md). Fix any failure and
re-run from the build step. Report success only after the container has
built, started, been confirmed running, and been cleaned up.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "I'll use `build.dockerfile` directly." | Use `dockerComposeFile` + `service` so services can be added later without restructuring. |
| "`${localWorkspaceFolderBasename}` works in compose too." | Compose can't resolve it — hardcode the actual folder name in `docker-compose.yml` or the mount breaks. |
| "Project deps belong in the Dockerfile." | Global tooling goes in the Dockerfile; lock-file installs (`npm install`) belong in `postCreateCommand`. |
| "It's written, so it's done." | Not until it builds, starts, and runs. Verify with the subagent before reporting success. |

## Red Flags

- Creating files before confirming Docker is running.
- Hard-coding a specific language image instead of inferring the stack.
- Missing SSH / `.gitconfig` mounts, or `${localWorkspaceFolderBasename}` used in `docker-compose.yml`.
- Reporting success without building and starting the container.

## Verification

- [ ] Docker confirmed running before any file was created.
- [ ] Three files present; base image is `mcr.microsoft.com/devcontainers/*` matching the stack.
- [ ] `dockerComposeFile` + `service` used; SSH and `.gitconfig` mounts present; workspace folder hardcoded in compose.
- [ ] Container built, started, confirmed running via `ps`, and cleaned up with `down`.
- [ ] Audit mode: only user-selected fixes applied; unflagged config preserved.
