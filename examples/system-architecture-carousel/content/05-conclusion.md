---
title: "Stop making shared state safe"
page: 5
background: "#111215"
margins: "40px 54px"
content_margins: "18px 0px"
accent_color: "#DFBA87"
header:
  accent_bar: true
  right: "05 / 05"
footer:
  left: "Software Engineering | System Architecture"
  right: "Swipe ▶"
---

# Stop making shared state safe. Ask whether it needs to be shared.

Payments, inventory, booking and real-time collaboration share one shape: many writers, one piece of contested state.

<div class="forge-diagram-card">

```mermaid
graph LR
  subgraph BEFORE
    W1[Many writers] -->|contended| S1[Shared state]
  end
  subgraph AFTER
    W2[Many writers] -->|by key| OA[Owner A]
    W2 -->|by key| OB[Owner B]
  end

  classDef accent fill:#DFBA87,stroke:#DFBA87,color:#0E1015,font-weight:bold;
  classDef default fill:#1C1E26,stroke:#383C4A,color:#F8FAFC;
  class OA,OB accent;
```
</div>

<div class="takeaway-box">
What's the most contested piece of state in your architecture, and how did you resolve it?
</div>
