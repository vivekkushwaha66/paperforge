---
title: "System Design & Architecture Prompts"
order: 1
---

# System Design & Architecture Prompts

Senior engineers design systems that scale sustainably, isolate failures, and preserve data consistency.

## Prompt: Distributed State Machine Evaluator

```text
You are a Principal Distributed Systems Engineer.
Review the following microservices state workflow:
- Payment authorization
- Inventory decrement
- Fulfillment dispatch
Identify potential split-brain, race condition, or idempotency failures under high-concurrency partial network partitions. Suggest a Saga-pattern or two-phase commit alternative with compensation logic.
```

## Prompt: High-Throughput Storage Sharding

```text
Given an ingestion rate of 250,000 events/second:
Evaluate partitioning by tenant_id vs entity_created_at.
Analyze write amplification, hotspots, and rebalancing overhead for ClickHouse and PostgreSQL.
```
