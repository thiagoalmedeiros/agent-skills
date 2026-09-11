# Jira Ticket Fetch — Full Reference

> The complete credential handling, REST calls, pagination, and output
> format for the `jira-fetch` skill. `SKILL.md` is the lean process that
> points here; this file holds every command and rule.

## When to Use

- User provides a Jira ticket URL and wants to see the full details
- User provides a Jira issue key (e.g. `PROJ-123`) and wants to fetch it
- User needs ticket context (description, comments, subtasks) for planning or implementation

## Procedure

> ⚠️ **CREDENTIAL GUARD — run this before anything else**: Your very first action MUST be to run the `_load_jira_env` bash function from Step 1. If it exits non-zero, **stop immediately** and tell the user which variables are missing (`JIRA_DOMAIN`, `JIRA_EMAIL`, `JIRA_API_TOKEN`) and that they must create `.claude/.env` from `.claude/.env.sample`. **Never assume credentials exist. Never skip the credential check.**

### Step 1 — Load Credentials

Search for `JIRA_DOMAIN`, `JIRA_EMAIL`, and `JIRA_API_TOKEN` by checking the following locations **in order**, stopping at the first file that contains all three variables:

1. `.claude/.env` — skill-specific credentials (preferred)
2. `.github/.env` — shared CI/tooling credentials
3. `.env` — project root (fallback)
4. Environment variables already present in the shell (`$JIRA_DOMAIN`, etc.)

Use this shell snippet to resolve them at runtime:

```bash
_load_jira_env() {
  for f in .claude/.env .github/.env .env; do
    if [[ -f "$f" ]] && grep -q 'JIRA_DOMAIN' "$f" && grep -q 'JIRA_EMAIL' "$f" && grep -q 'JIRA_API_TOKEN' "$f"; then
      set -a; source "$f"; set +a
      return 0
    fi
  done
  # Fall through to environment — check if all vars are already set
  if [[ -n "$JIRA_DOMAIN" && -n "$JIRA_EMAIL" && -n "$JIRA_API_TOKEN" ]]; then
    return 0
  fi
  echo "❌ JIRA credentials not configured. The following variables are required but were not found:"
  echo "- JIRA_DOMAIN"
  echo "- JIRA_EMAIL"
  echo "- JIRA_API_TOKEN"
  echo ""
  echo "Copy \`.claude/.env.sample\` to \`.claude/.env\` and populate these values, then try again."
  return 1
}
_load_jira_env || exit 1
```

If the function exits with an error, **stop immediately** and output this exact message (do not paraphrase or summarize — output it verbatim):

```
❌ JIRA credentials not configured. The following variables are required but were not found:
- JIRA_DOMAIN
- JIRA_EMAIL
- JIRA_API_TOKEN

Copy `.claude/.env.sample` to `.claude/.env` and populate these values, then try again.
```

Do not proceed to Step 2.

### Step 2 — Parse the Issue Key

Extract the issue key from the user input. The input can be:

- **Full URL**: `https://<domain>.atlassian.net/browse/PROJ-123` → extract `PROJ-123`
- **Board URL**: `https://<domain>.atlassian.net/jira/software/projects/PROJ/boards/1?selectedIssue=PROJ-123` → extract `PROJ-123`
- **Bare key**: `PROJ-123` → use as-is

The issue key pattern is: `[A-Z][A-Z0-9]+-\d+`

If multiple matches are found, prefer the value of the `selectedIssue` query parameter; otherwise use the last path segment after `/browse/`.

If the input does not contain a recognizable issue key, ask: "I could not find a Jira issue key in your input. Please provide a key like PROJ-123 or a full Jira URL."

### Step 3 — Fetch the Parent Ticket via REST API

Call the Jira REST API directly using `run_in_terminal`:

```bash
curl -s \
  -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "https://$JIRA_DOMAIN/rest/api/3/issue/PROJ-123?fields=summary,description,status,priority,issuetype,project,labels,assignee,reporter,created,updated,comment,subtasks"
```

The response includes: summary, description, status, priority, issue type, project, labels, assignee, reporter, dates, comments array, and subtasks array.

> **ADF Note:** Description and comment bodies are returned as Atlassian Document Format (ADF) JSON by API v3. Convert ADF content to markdown before writing to the output file — preserve headings, lists, code blocks, links, and mentions. Alternatively, append `&expand=renderedFields` to the request URL and convert the rendered HTML to markdown instead.

If the API returns HTTP 429 or 5xx, wait 2 seconds and retry up to 3 times with exponential backoff (2 s, 4 s, 8 s). If all retries fail, stop and report which ticket or page failed.

### Step 4 — Fetch Subtasks

From the parent ticket response, extract the `subtasks` array. Each item contains a key (e.g. `PROJ-124`).

If the subtasks array is empty or absent, skip to Step 4b for the parent ticket only, and omit the Subtasks section from the markdown output (or render it as `### Subtasks (0 total)`).

For **each subtask key**, call:

```bash
curl -s \
  -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "https://$JIRA_DOMAIN/rest/api/3/issue/PROJ-124?fields=summary,status,assignee,description,comment"
```

Collect all subtask details (summary, status, assignee, description, comments).

### Step 4b — Fetch All Comments (Pagination)

Use the following `fetch_all_comments(issueKey)` procedure. Apply it **independently** to the parent ticket AND each subtask.

1. From the issue response, read `fields.comment.total` and `fields.comment.maxResults`.
2. If `total ≤ maxResults`, all comments are already present — no further fetches needed for this ticket.
3. If `total > maxResults`, fetch the remaining pages:
   - Set `startAt = fields.comment.maxResults` (the count of comments already returned).
   - On each page request, use `maxResults=100`.
   - After each response, increment `startAt` by the number of items actually returned in that response.
   - Stop when `startAt >= total`.

```bash
curl -s \
  -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
  -H "Accept: application/json" \
  "https://$JIRA_DOMAIN/rest/api/3/issue/<ISSUE_KEY>/comment?startAt=<startAt>&maxResults=100"
```

Append each page's comments to the in-memory list for that ticket. Do not share `startAt` state across tickets.

### Step 5 — Save to File

Save the full ticket details to a markdown file at:

```
plans/<ISSUE_KEY>/context.md
```

The file must contain the full untruncated content of all fields, all comments, and all subtask details, formatted as markdown:

```markdown
## [PROJ-123] Ticket Summary

**Status**: In Progress | **Priority**: High | **Type**: Story
**Assignee**: Name | **Reporter**: Name
**Project**: Project Name | **Labels**: label1, label2

### Description

(full description text)

### Subtasks (N total)

| Key      | Summary       | Status | Assignee |
| -------- | ------------- | ------ | -------- |
| PROJ-124 | Subtask title | To Do  | Name     |

### Comments (N total)

**Author** — 2025-01-15:

> Comment body text

---

**Author** — 2025-01-14:

> Another comment

### Subtask Comments

#### [PROJ-124] Subtask title

**Author** — 2025-01-15:

> Comment on subtask

---

(Repeat for each subtask that has comments. Omit this section if no subtasks have comments.)
```

Create the `plans/<ISSUE_KEY>/` directory if it does not exist. If `context.md` already exists, overwrite it without prompting — this skill refreshes ticket state. Do **not** display the ticket content in chat — confirm only with the file path once saved.

## Authentication

Credentials are resolved via Basic Auth (email + API token) using the lookup order below:

| Location          | Purpose                                             |
| ----------------- | --------------------------------------------------- |
| `.claude/.env`    | Skill-specific credentials — **preferred** location |
| `.github/.env`    | Shared CI / tooling credentials                     |
| `.env`            | Project root — fallback                             |
| Shell environment | Variables already exported in the current session   |

| Variable         | Purpose                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `JIRA_DOMAIN`    | Atlassian instance (e.g. `your-company.atlassian.net`)                                        |
| `JIRA_EMAIL`     | User email for Basic Auth                                                                     |
| `JIRA_API_TOKEN` | Jira API token ([generate here](https://id.atlassian.com/manage-profile/security/api-tokens)) |

If **none** of the locations contain all three variables, the skill must stop with an explicit error and instruct the user to copy `.claude/.env.sample` to `.claude/.env` and fill in the values.

If the curl call returns `401 Unauthorized`, ask the user to verify `JIRA_EMAIL` and `JIRA_API_TOKEN`.
If it returns `404 Not Found`, verify the issue key and `JIRA_DOMAIN`.

## Constraints

- Only fetch **direct subtasks** (1 level deep), not sub-subtasks.
- Do **not** modify, update, or transition any Jira tickets — this skill is read-only.
- No MCP server is required — all calls are direct HTTP to the Jira REST API.
- Always source credentials via the lookup chain (`.claude/.env` → `.github/.env` → `.env` → shell env), never hard-code them.
