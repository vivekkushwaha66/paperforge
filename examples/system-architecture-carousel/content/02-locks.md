---
title: "The common instinct is to add locks"
page: 2
background: "#111215"
margins: "40px 54px"
content_margins: "20px 0px"
accent_color: "#DFBA87"
header:
  accent_bar: true
  right: "02 / 05"
footer:
  left: "Software Engineering | System Architecture"
  right: "Swipe ▶"
---

# The common instinct is to add locks.

Thousands of orders arrive in the same millisecond, all competing to change the same order book. More servers usually make the contention worse.

Lock the book, process, release. It works at low volume, then collapses under load because threads wait on each other instead of working.

<div class="forge-diagram-card">
  <div class="diagram-tag">PROBLEM PATH</div>

```mermaid
graph LR
  T1[Thread 1] -->|wait| Lock[Lock]
  T2[Thread 2] -->|wait| Lock
  T3[Thread 3] -->|wait| Lock
  Lock -->|one at a time| OB[Order book]

  classDef accent fill:#DFBA87,stroke:#DFBA87,color:#0E1015,font-weight:bold;
  classDef default fill:#1C1E26,stroke:#383C4A,color:#F8FAFC;
  class Lock accent;
```
</div>
