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
  <!-- Hot Path Row -->
  <div class="diagram-tag">HOT PATH</div>
  <div class="diagram-flow" style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
    <div class="diagram-node" style="width: 140px; padding: 16px 20px;">
      Gateway
    </div>

    <div class="diagram-arrow" style="flex: 1;">
      <span class="diagram-arrow-label">events</span>
      <div class="diagram-arrow-line">───────►</div>
    </div>

    <div class="diagram-node accent" style="width: 170px; padding: 16px 20px;">
      Sequencer
      <span class="sublabel">ordered log</span>
    </div>

    <div class="diagram-arrow" style="flex: 1;">
      <span class="diagram-arrow-label">in order</span>
      <div class="diagram-arrow-line">───────►</div>
    </div>

    <div class="diagram-node" style="width: 140px; padding: 16px 20px;">
      Matcher
    </div>
  </div>

  <!-- Off the Hot Path Section -->
  <div style="margin-top: 24px;">
    <div class="diagram-tag muted" style="margin-bottom: 12px;">OFF THE HOT PATH</div>
    <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
      <div class="diagram-arrow" style="margin-bottom: 10px;">
        <span class="diagram-arrow-label">event stream</span>
        <div style="color: #64748B; font-size: 10pt;">▼</div>
      </div>
      <div style="display: flex; justify-content: center; gap: 24px; width: 100%;">
        <div class="diagram-node subtle" style="width: 150px; padding: 12px 20px;">Risk</div>
        <div class="diagram-node subtle" style="width: 150px; padding: 12px 20px;">Audit</div>
        <div class="diagram-node subtle" style="width: 150px; padding: 12px 20px;">Alerts</div>
      </div>
    </div>
  </div>
</div>
