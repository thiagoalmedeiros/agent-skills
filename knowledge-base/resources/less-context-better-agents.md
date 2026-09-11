---
type: Research Paper
title: "Less Context, Better Agents: Efficient Context Engineering for Long-Horizon Tool-Using LLM Agents"
description: Shows that pruning tool-call history to a recent window plus compact summarization beats full-history retention on both reliability and cost for long-horizon tool-using agents.
resource: https://arxiv.org/abs/2606.10209
tags: [context-engineering, agent-harness, efficiency, tool-use]
timestamp: 2026-08-12T22:06:57Z
---

# Less Context, Better Agents: Efficient Context Engineering for Long-Horizon Tool-Using LLM Agents

arXiv paper reference. On a 50-task enterprise expense-itemization benchmark over
MCP tools, full-context retention reaches 71.0% completion at 1.48M tokens, while
pruning to the last 5 tool call/response pairs reaches 79.0% at 535K tokens and
pruning plus summarization reaches 91.6% at 553K tokens. See
[Resources](/resources/index.md) for related papers on harness and efficiency
design, including
[Meta-Harness: End-to-End Optimization of Model Harnesses](/resources/meta-harness-model-harness-optimization.md)
and
[Stop Overthinking: A Survey on Efficient Reasoning for Large Language Models](/resources/stop-overthinking-efficient-reasoning-survey.md).

- **URL**: https://arxiv.org/abs/2606.10209
