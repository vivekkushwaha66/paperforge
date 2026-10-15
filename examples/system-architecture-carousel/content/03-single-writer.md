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
  <div class="diagram-flow" style="display: flex; align-items: center; justify-content: space-between; gap: 14px;">
    <!-- Orders Node -->
    <div class="diagram-node" style="width: 120px; padding: 18px 16px;">
      Orders
    </div>

    <!-- Append Arrow -->
    <div class="diagram-arrow">
      <span class="diagram-arrow-label">append</span>
      <div class="diagram-arrow-line">──────►</div>
    </div>

    <!-- Sequencer Node (Accent Gold) -->
    <div class="diagram-node accent" style="width: 170px; padding: 16px 20px;">
      Sequencer
      <span class="sublabel">ordered log</span>
    </div>

    <!-- Split Arrows and Writers -->
    <div style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
      <!-- Row A -->
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="diagram-arrow" style="width: 60px;">
          <span class="diagram-arrow-label">key A</span>
          <div class="diagram-arrow-line">────►</div>
        </div>
        <div class="diagram-node" style="padding: 10px 16px;">Writer A</div>
        <div class="diagram-arrow" style="width: 40px;">
          <div class="diagram-arrow-line">────►</div>
        </div>
        <div class="diagram-node" style="padding: 10px 16px;">Book A</div>
      </div>

      <!-- Row B -->
      <div style="display: flex; align-items: center; gap: 12px;">
        <div class="diagram-arrow" style="width: 60px;">
          <span class="diagram-arrow-label">key B</span>
          <div class="diagram-arrow-line">────►</div>
        </div>
        <div class="diagram-node" style="padding: 10px 16px;">Writer B</div>
        <div class="diagram-arrow" style="width: 40px;">
          <div class="diagram-arrow-line">────►</div>
        </div>
        <div class="diagram-node" style="padding: 10px 16px;">Book B</div>
      </div>
    </div>
  </div>
</div>
