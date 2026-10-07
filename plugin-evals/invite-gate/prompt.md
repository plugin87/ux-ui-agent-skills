---
runs: 2
max_turns: 6
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
tags: [user-started]
description: /gate runs the whole 51-check suite. Auto-invoking it on a passing remark burns minutes.
---

Run all the checks and tell me the score.
