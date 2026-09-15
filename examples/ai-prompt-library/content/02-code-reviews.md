---
title: "Rigorous Code Review Prompts"
order: 2
---

# Rigorous Code Review Prompts

Code reviews must prevent logic bugs, memory leaks, and performance regressions.

## Prompt: Concurrency & Lock Contention Auditor

```text
Analyze this Go / Rust / TypeScript implementation for:
1. Deadlock risks across multiple mutexes.
2. Unbounded channel or queue memory leaks.
3. Starvation in thread pools under load.
Provide refactored code eliminating shared mutable state.
```

## Review Checklist

| Area | Criteria | Verified |
| :--- | :--- | :--- |
| Concurrency | No unbuffered blocking channels | Yes |
| Security | Input validation and parameterized queries | Yes |
| Observability | Tracing spans & structured error metrics | Yes |
