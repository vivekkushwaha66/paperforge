---
title: "Keep the critical path small and predictable"
page: 4
background: "#111215"
margins: "40px 54px"
content_margins: "18px 0px"
accent_color: "#DFBA87"
header:
  accent_bar: true
  right: "04 / 05"
footer:
  left: "Software Engineering | System Architecture"
  right: "Swipe ▶"
---

# Keep the critical path small and predictable.

<div class="section-subtitle">Keep the hot path small</div>
Matching logic does only matching. Logging, risk reporting and notifications happen elsewhere, fed by the same event stream.

<div class="section-subtitle">Design around the cache</div>
Memory layout and allocation patterns matter more than the class hierarchy. Pausing for garbage collection is a design flaw, not a tuning problem.

<div class="forge-diagram-card">
  <div class="diagram-tag">HOT PATH &amp; OFF THE HOT PATH</div>

```mermaid
graph LR
  GW[Gateway] -->|events| Seq[Sequencer<br/><small>ordered log</small>]
  Seq -->|in order| Matcher[Matcher]
  Seq -.->|event stream| Risk[Risk]
  Seq -.->|event stream| Audit[Audit]
  Seq -.->|event stream| Alerts[Alerts]

  classDef accent fill:#DFBA87,stroke:#DFBA87,color:#0E1015,font-weight:bold;
  classDef default fill:#1C1E26,stroke:#383C4A,color:#F8FAFC;
  classDef subtle fill:#14161D,stroke:#333845,stroke-dasharray: 4 4,color:#9CA3AF;
  class Seq accent;
  class Risk,Audit,Alerts subtle;
```
</div>
