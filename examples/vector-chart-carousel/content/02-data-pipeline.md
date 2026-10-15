---
title: "Event Streaming & Change Data Capture"
order: 2
background: "#061A23"
accent_color: "#38BDF8"
---

# Event Streaming & CDC Pipeline

Asynchronous data propagation decouples transactional OLTP workloads from downstream analytical aggregators with **exactly-once semantics**.

```svg
<svg width="680" height="260" viewBox="0 0 680 260">
  <rect width="680" height="260" rx="14" fill="#0C2533" stroke="#38BDF8" stroke-width="2"/>
  
  <!-- PostgreSQL -->
  <rect x="40" y="70" width="140" height="110" rx="8" fill="#13384D" stroke="#38BDF8" stroke-width="1.5"/>
  <text x="110" y="105" fill="#38BDF8" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">PostgreSQL WAL</text>
  <text x="110" y="130" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Write-Ahead Log</text>
  <text x="110" y="150" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">Logical Replication</text>

  <!-- Arrow -->
  <path d="M 180 125 L 260 125" stroke="#38BDF8" stroke-width="2.5" fill="none"/>

  <!-- Kafka Cluster -->
  <rect x="260" y="55" width="160" height="140" rx="8" fill="#13384D" stroke="#F59E0B" stroke-width="1.5"/>
  <text x="340" y="90" fill="#F59E0B" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Apache Kafka</text>
  <text x="340" y="115" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Partitioned Topics</text>
  <text x="340" y="135" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">100K msgs / sec</text>
  <text x="340" y="155" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">7-Day Retention</text>

  <!-- Arrow -->
  <path d="M 420 125 L 500 125" stroke="#F59E0B" stroke-width="2.5" fill="none"/>

  <!-- Flink Engine -->
  <rect x="500" y="70" width="140" height="110" rx="8" fill="#13384D" stroke="#34D399" stroke-width="1.5"/>
  <text x="570" y="105" fill="#34D399" font-family="Helvetica" font-size="14" font-weight="bold" text-anchor="middle">Apache Flink</text>
  <text x="570" y="130" fill="#E2E8F0" font-family="Helvetica" font-size="11" text-anchor="middle">Stateful Streaming</text>
  <text x="570" y="150" fill="#94A3B8" font-family="Helvetica" font-size="10" text-anchor="middle">Sliding Window Joins</text>

  <!-- Footer -->
  <text x="340" y="225" fill="#38BDF8" font-family="Helvetica" font-size="12" font-weight="bold" text-anchor="middle">End-to-end P99 replication latency &lt; 85ms under full synthetic load</text>
</svg>
```

> "By decoupling producers and consumers through immutable append-only logs, independent service deployments never trigger cascading database lockups."
