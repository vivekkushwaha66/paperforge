---
title: "Technical Case Study: High-Throughput Document Engine"
order: 2
---

# Technical Case Study: Zero-Download Document Engine

## Challenge
Headless browser dependencies commonly force ~350MB Chromium downloads during npm install, creating slow CI pipelines, flaky builds, and gigabytes of wasted container image bloat.

## Architecture Solution
Decoupled rendering logic from binary distribution through an abstract `IPdfRenderer` interface and auto-detection of host OS browsers (Edge on Windows, Chrome on macOS/Linux).

## Measurable Results
* **Install Footprint:** Reduced from 350MB to under 4MB.
* **Cold Start Latency:** 2.8s build time for typical 25-page publications.
* **Deterministic Output:** 100% byte-for-byte reproducibility using static PDF /Info metadata injection.
