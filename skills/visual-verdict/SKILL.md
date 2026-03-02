---
name: visual-verdict
description: Evaluate visual outputs and provide a structured quality verdict
---

Run visual checks and return JSON with these required fields:
- "score" (0-100, target 90+ for accept)
- "verdict" ("pass" | "needs_work" | "fail")
- "category_match"
- "differences"
- "suggestions"
- "reasoning"

Guidance:
- Include both numeric + qualitative feedback.
- Use pixel diff analysis when screenshots are available.
- Prefer pixelmatch-compatible comparisons for deterministic thresholds.
