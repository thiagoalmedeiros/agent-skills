---
name: jira-fetch
version: 1.0.0
description: >
  Fetch full Jira ticket details (description, comments, subtasks, linked
  issues) from a URL or issue key via the read-only REST API, and save
  them to a markdown file. Credentials are resolved from a lookup chain,
  never hard-coded.
  USE FOR: pulling a Jira ticket's full context from a URL or key
  (e.g. PROJ-123) for planning or implementation.
  DO NOT USE FOR: creating, updating, or transitioning Jira issues; Jira
  administration; or any write operation.
argument-hint: "Jira ticket URL (e.g. https://your-org.atlassian.net/browse/PROJ-123)"
---

# Jira Ticket Fetch

## Overview

Resolve a Jira issue from a URL or key and save its full context —
description, all comments (paginated), and direct subtasks — to
`plans/<ISSUE_KEY>/context.md`. The credential lookup snippet, REST calls,
ADF conversion note, pagination procedure, and output template live in
[references/reference.md](references/reference.md). **Prime directive:
this skill is strictly read-only — never modify or transition a ticket —
and it never proceeds without all three credentials (`JIRA_DOMAIN`,
`JIRA_EMAIL`, `JIRA_API_TOKEN`); never hard-code them.**

## When to Use

- The user provides a Jira ticket URL and wants the full details.
- The user provides a bare issue key (e.g. `PROJ-123`) to fetch.
- The user needs ticket context (description, comments, subtasks) for planning or implementation.

## The Process

Follow these steps in order. Do not skip the verification step.

### Step 1: LOAD CREDENTIALS — the guard, run first

Your **very first action** is the credential guard: run the
`_load_jira_env` function from
[references/reference.md](references/reference.md), which checks
`.claude/.env` → `.github/.env` → `.env` → shell env for all three
variables. If it exits non-zero, **stop immediately** and output the exact
error message from the reference verbatim (naming the missing variables
and the `.claude/.env.sample` copy step). Do not proceed to Step 2.

### Step 2: PARSE — extract the issue key

Extract the issue key (`[A-Z][A-Z0-9]+-\d+`) from a full URL, a board URL
(prefer the `selectedIssue` query parameter), or a bare key. If no key is
recognizable, ask the user for a key like `PROJ-123` or a full URL.

### Step 3: FETCH — parent, subtasks, and all comments

Call the REST API for the parent ticket, then each direct subtask (one
level deep only), converting ADF bodies to markdown. Fetch every comment
via the pagination procedure, applied independently to the parent and each
subtask. Retry 429/5xx up to three times with backoff; on 401 ask the user
to verify email/token, on 404 verify the key and domain.

### Step 4: SAVE — write the context file

Write the full, untruncated content to `plans/<ISSUE_KEY>/context.md`
using the output template in
[references/reference.md](references/reference.md), creating the directory
if needed and overwriting any existing file. Do **not** print the ticket
content in chat — confirm only with the saved file path.

## Common Rationalizations

| Rationalization | Reality |
| --- | --- |
| "Credentials are probably set, I'll just fetch." | Never assume. Run the guard first; stop with the exact error if any variable is missing. |
| "I'll hard-code the token to move faster." | Never hard-code credentials — always resolve via the lookup chain. |
| "I'll transition the ticket while I'm here." | This skill is read-only. Never modify or transition an issue. |
| "I'll paste the ticket into chat." | Don't — save to `context.md` and confirm only the path. |

## Red Flags

- Any REST call made before the credential guard ran successfully.
- A hard-coded domain, email, or token anywhere in the flow.
- Any write/transition call to the Jira API.
- Truncated content saved, or ticket bodies dumped into chat.

## Verification

- [ ] `_load_jira_env` ran first and passed (or stopped with the exact error message).
- [ ] Issue key parsed correctly from URL / board URL / bare key.
- [ ] Parent, direct subtasks, and all paginated comments fetched; ADF converted to markdown.
- [ ] Full untruncated content saved to `plans/<ISSUE_KEY>/context.md`; only the path shown in chat.
- [ ] No write operations performed against Jira.
