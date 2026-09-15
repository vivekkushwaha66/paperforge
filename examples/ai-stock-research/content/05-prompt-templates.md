---
title: "Prompt Templates for Equity Analysts"
order: 5
---

# Prompt Templates for Equity Analysts

Below are the production prompt templates tested on financial statements and transcripts.

## Template: Capex Efficiency Auditor

```text
You are an institutional financial analyst specialized in enterprise software.
Analyze the attached 10-K Cash Flows section.
1. Extract Cash Flow from Operations and Capital Expenditures for the past 5 years.
2. Compute Capital Intensity: Capex as a percentage of Total Revenue.
3. Compare free cash flow conversion trends year-over-year.
Highlight any capitalization of software development costs that distort EBITDA.
```

## Template: Earnings Call Tone & Evasion Scanner

```text
Analyze the attached Q3 earnings call transcript specifically during the Q&A segment.
Identify answers where management deflected questions regarding:
- Customer churn rates
- Average Contract Value (ACV) contraction
- Pricing concessions
Output responses as a table with columns: [Analyst], [Question Topic], [Management Tone], [Directness Score 1-10].
```
