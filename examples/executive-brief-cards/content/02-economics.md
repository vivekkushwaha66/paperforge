---
title: "Unit Economics of Token Generation"
page: 2
background: "#06281E"
margins: "35px 45px"
content_margins: "16px 0px"
accent_color: "#34D399"
style: "box-shadow: inset 0 0 100px rgba(52, 211, 153, 0.08);"
header:
  accent_bar: "#34D399"
  right: "02 / 03"
footer:
  left: "AI Infrastructure Strategy | Executive Brief"
  right: "Swipe ▶"
---

# Unit Economics of Token Generation.

<div class="accent-line" style="background-color: #34D399;"></div>

Hardware amortisation without batch inference optimization destroys software gross margins. The cost frontier is governed by KV-cache residency.

<div class="forge-diagram-card" style="background-color: #0A3629; border-color: #175C46;">
  <div class="diagram-tag" style="color: #34D399;">EFFICIENCY PIPELINE</div>
  <div class="diagram-flow" style="display: flex; justify-content: space-between; align-items: center;">
    <div class="diagram-node" style="background-color: #082F24; border-color: #216E55;">
      Raw Prompt
    </div>
    <div class="diagram-arrow">
      <span class="diagram-arrow-label">prefix cache</span>
      <div class="diagram-arrow-line">────►</div>
    </div>
    <div class="diagram-node accent" style="background-color: #34D399; border-color: #34D399; color: #022016;">
      Zero-Copy PagedAttention
    </div>
    <div class="diagram-arrow">
      <span class="diagram-arrow-label">speculative</span>
      <div class="diagram-arrow-line">────►</div>
    </div>
    <div class="diagram-node" style="background-color: #082F24; border-color: #216E55;">
      Output Tokens
    </div>
  </div>
</div>
