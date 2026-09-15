---
title: "Incident Post-Mortems & RCA"
order: 3
---

# Incident Post-Mortems & RCA

Blameless post-mortems transform production outages into structural engineering safeguards.

## Five Whys Framework

```text
Outage Occurred ─► Cache Miss Storm ─► Cold Start Throttling ─► Missing Circuit Breaker ─► Root Cause Identified
```

## Prompt: Blameless Post-Mortem Synthesizer

```text
Given the following raw Slack incident timeline, Datadog alerts, and PR changes:
Construct a blameless post-mortem document including:
1. Executive summary of customer impact (MTTD, MTTR).
2. Root cause analysis (contributing factors).
3. Action items categorized by P0 (immediate safeguard) and P1 (long-term hardening).
```
