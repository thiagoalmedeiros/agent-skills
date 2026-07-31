# Agent Instructions

This repository contains custom SDLC agent skills.

## Agent Rules

- **Continuous Learning (Lessons Learned)**: The agent must always automatically invoke `skill:lessons-learned` to log all user corrections and agent-detected mistakes to a `lessons.md` at the path the caller supplies.
