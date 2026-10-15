---
title: "Distributed Multi-Region Persistence"
order: 3
background: "#180D2B"
accent_color: "#A78BFA"
---

# Multi-Region Persistence

Global consistency without centralized lock managers requires **TrueTime-synchronized consensus protocols** and distributed transactional consensus.

```svg
<svg width="680" height="260" viewBox="0 0 680 260">
  <rect width="680" height="260" rx="14" fill="#24143E" stroke="#A78BFA" stroke-width="2"/>
  
  <!-- US Region -->
  <rect x="50" y="60" width="160" height="130" rx="8" fill="#321D54" stroke="#A78BFA" stroke-width="1.5"/>
  <text x="130" y="95" fill="#A78BFA" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Leader (US-East)</text>
  <text x="130" y="120" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Raft Group Leader</text>
  <text x="130" y="140" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">Write Coordinator</text>
  <text x="130" y="160" fill="#34D399" font-family="Helvetica" font-size="10" text-anchor="middle">&bull; Active &amp; Serving</text>

  <!-- Consensus Link -->
  <path d="M 210 125 L 260 125" stroke="#A78BFA" stroke-width="2.5" stroke-dasharray="4" fill="none"/>

  <!-- EU Region -->
  <rect x="260" y="60" width="160" height="130" rx="8" fill="#321D54" stroke="#818CF8" stroke-width="1.5"/>
  <text x="340" y="95" fill="#818CF8" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Follower (EU-West)</text>
  <text x="340" y="120" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Raft Quorum Peer</text>
  <text x="340" y="140" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">Local Read Replica</text>
  <text x="340" y="160" fill="#34D399" font-family="Helvetica" font-size="10" text-anchor="middle">&bull; Active &amp; Serving</text>

  <!-- Consensus Link -->
  <path d="M 420 125 L 470 125" stroke="#818CF8" stroke-width="2.5" stroke-dasharray="4" fill="none"/>

  <!-- AP Region -->
  <rect x="470" y="60" width="160" height="130" rx="8" fill="#321D54" stroke="#F472B6" stroke-width="1.5"/>
  <text x="550" y="95" fill="#F472B6" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Follower (AP-South)</text>
  <text x="550" y="120" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Raft Quorum Peer</text>
  <text x="550" y="140" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">Snapshot Compaction</text>
  <text x="550" y="160" fill="#34D399" font-family="Helvetica" font-size="10" text-anchor="middle">&bull; Active &amp; Serving</text>

  <!-- Bottom Metric -->
  <text x="340" y="225" fill="#A78BFA" font-family="Helvetica" font-size="12" font-weight="bold" text-anchor="middle">RPO = 0 &bull; RTO &lt; 3 seconds under catastrophic regional network partition</text>
</svg>
```

- **Vector Precision:** Perfectly sharp vector lines and typography when zoomed or printed.
- **Consensus Latency:** Synchronous cross-region roundtrip achieved within 65ms quorum threshold.
