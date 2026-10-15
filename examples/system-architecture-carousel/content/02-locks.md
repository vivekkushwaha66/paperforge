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
  <div class="diagram-flow" style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
    <!-- Threads Stack -->
    <div style="display: flex; flex-direction: column; gap: 12px; width: 140px;">
      <div class="diagram-node">Thread 1</div>
      <div class="diagram-node">Thread 2</div>
      <div class="diagram-node">Thread 3</div>
    </div>

    <!-- Wait Arrow -->
    <div class="diagram-arrow" style="flex: 1;">
      <span class="diagram-arrow-label">wait</span>
      <div class="diagram-arrow-line">───────►</div>
    </div>

    <!-- Lock Node -->
    <div class="diagram-node" style="width: 140px; padding: 18px 20px;">
      Lock
    </div>

    <!-- One at a time Arrow -->
    <div class="diagram-arrow" style="flex: 1;">
      <span class="diagram-arrow-label">one at a time</span>
      <div class="diagram-arrow-line">───────►</div>
    </div>

    <!-- Order Book Node -->
    <div class="diagram-node" style="width: 150px; padding: 18px 20px;">
      Order book
    </div>
  </div>
</div>
