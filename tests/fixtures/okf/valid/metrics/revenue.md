---
type: Metric
title: "Revenue: fiscal year"
description: 'Recognized revenue for a fiscal year, per Finance''s definition.'
tags: [finance, revenue]
status: stable        # draft | stable | deprecated
generated: { by: reference_agent/gemini-2.5-pro, at: 2026-06-20T22:53:05Z }
verified:
  - { by: human:ahormati, at: 2026-06-25T09:00:00Z }
  - { by: process:finance-nightly, at: 2026-06-26T02:00:00+02:00 }
stale_after: 2099-12-31T00:00:00Z
sources:
  - id: rev-policy
    resource: https://wiki.acme/finance/revenue-recognition
    title: Revenue recognition policy
    author: team:finance-fpa
    last_modified: 2026-04-02T00:00:00Z
  - id: exec-rev-dash
    resource: dashboards/exec-revenue
    usage_count: 5000
usage_window: { from: 2026-06-01T00:00:00Z, to: 2026-06-30T00:00:00Z }
---

# Definition

Recognized revenue, computed by [the revenue computation](../computations/revenue.md).[^rev-policy]

`[not a link](/missing.md)`

```markdown
[also not a link](/missing.md)
```

See the [update log][log].

[log]: /log.md
[^rev-policy]: Revenue recognition policy
