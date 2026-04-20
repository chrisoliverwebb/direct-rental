# Testing Strategy

We use a layered approach to keep tests fast, clear, and maintainable.

---

## Principles

- Test the **right thing at the right level**
- Prefer **user behaviour over implementation**
- Avoid **duplicate coverage across layers**
- Keep tests **readable and focused**
- Use **MSW** to share mocks between dev and tests

---

## Test Layers

### 1. Vitest — Logic

Use for pure logic only:

- utils, mappers, reducers
- validation (zod)
- data transformations

**Rules**
- No React, no DOM
- Keep tests small and fast

---

### 2. Vitest + RTL — Components (Selective)

Use for components with real behaviour:

- forms, modals, editors
- shared interactive components
- validation + async UI states

**Rules**
- Test behaviour, not styling
- Don’t test simple presentational components

---

### 3. Playwright BDD — Flows

Use for real user journeys:

- navigation, pages, workflows
- multi-step interactions
- critical UI flows

**Rules**
- Write human-readable scenarios
- Test what a user sees and does
- Don’t test low-level logic here

---

## Ownership

| Behaviour | Layer |
|----------|------|
| Logic | Vitest |
| Component behaviour | RTL |
| User flows | Playwright BDD |

---

## Avoid Duplication

- Don’t test the same thing in multiple layers
- Prefer the **lowest level** that gives confidence

---

## MSW

- Shared mocks for **dev + tests**
- No separate test-only mock logic
- Keep responses realistic

---

## What Not to Test

- Every component
- Styling/layout details
- Internal implementation
- Duplicate flows

---

## Quick Guide

- Logic → **Vitest**
- Complex component → **RTL**
- User flow → **Playwright BDD**

---

## Goal

- High confidence  
- Fast feedback  
- Minimal maintenance
