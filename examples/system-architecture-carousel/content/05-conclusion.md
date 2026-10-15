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
  <!-- BEFORE Row -->
  <div class="split-card-row">
    <div class="split-card-label">BEFORE</div>
    <div class="diagram-flow" style="flex: 1; justify-content: flex-start; gap: 20px;">
      <div class="diagram-node" style="width: 170px; padding: 14px 20px;">
        Many writers
      </div>
      <div class="diagram-arrow" style="width: 100px;">
        <span class="diagram-arrow-label">contended</span>
        <div class="diagram-arrow-line">──────►</div>
      </div>
      <div class="diagram-node" style="width: 170px; padding: 14px 20px;">
        Shared state
      </div>
    </div>
  </div>

  <div style="height: 1px; background-color: #232630; margin: 16px 0;"></div>

  <!-- AFTER Row -->
  <div class="split-card-row" style="margin-bottom: 0;">
    <div class="split-card-label">AFTER</div>
    <div class="diagram-flow" style="flex: 1; justify-content: flex-start; gap: 20px; align-items: center;">
      <div class="diagram-node" style="width: 170px; padding: 14px 20px;">
        Many writers
      </div>
      <div class="diagram-arrow" style="width: 100px;">
        <span class="diagram-arrow-label">by key</span>
        <div class="diagram-arrow-line">──────►</div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="diagram-node accent" style="width: 180px; padding: 12px 20px;">
          Owner A
        </div>
        <div class="diagram-node accent" style="width: 180px; padding: 12px 20px;">
          Owner B
        </div>
      </div>
    </div>
  </div>
</div>

<div class="takeaway-box">
What's the most contested piece of state in your architecture, and how did you resolve it?
</div>
