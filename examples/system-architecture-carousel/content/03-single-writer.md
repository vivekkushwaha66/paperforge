---
title: "Give each book one writer, and put every event in order"
page: 3
background: "#111215"
margins: "40px 54px"
content_margins: "18px 0px"
accent_color: "#DFBA87"
header:
  accent_bar: true
  right: "03 / 05"
footer:
  left: "Software Engineering | System Architecture"
  right: "Swipe ▶"
---

# Give each book one writer, and put every event in order.

<div class="section-subtitle">Single-writer ownership</div>
One thread owns each order book. No locks, no contention. Parallelism comes from partitioning by instrument, not from sharing one structure.

<div class="section-subtitle">Sequence everything</div>
Every event gets a position in a single ordered log before it's processed, so behavior is deterministic and can be replayed and audited.

<div class="forge-diagram-card">
  <div class="diagram-tag">BETTER PATH</div>

```mermaid
graph LR
  Orders[Orders] -->|append| Seq[Sequencer<br/><small>ordered log</small>]
  Seq -->|key A| WA[Writer A] --> BA[Book A]
  Seq -->|key B| WB[Writer B] --> BB[Book B]

  classDef accent fill:#DFBA87,stroke:#DFBA87,color:#0E1015,font-weight:bold;
  classDef default fill:#1C1E26,stroke:#383C4A,color:#F8FAFC;
  class Seq accent;
```
</div>
