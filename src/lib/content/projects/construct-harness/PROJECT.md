---
repo: xandwr/construct-harness
title: construct-harness
tagline: a harness for long-lived agents that remember across conversations, dream between turns, and judge their own work with an adversarial critic panel
featured: true
order: 5
tags: [typescript, agents, llm]
---

A harness for long-lived agents. Each agent is a **Construct**: something you talk to that remembers across conversations, streams its replies, calls tools, and keeps itself under the context window without supervision.

it's two halves you can use separately: a provider-neutral core library you import, and an optional SvelteKit web client for talking to a Construct and inspecting what it knows.

## The opinions

- **the core has one runtime dependency**, the Anthropic SDK, quarantined to a single file. everything else is the Node standard library, `node:sqlite` included. no vector database, no build step
- **the model lives behind a bridge.** nothing outside `src/bridge/anthropic.ts` knows which model you're talking to, so swapping providers touches one file
- **tests run without a network.** the mappers are pure, the loop runs against a scripted fake client, the stores run in `:memory:`

## What's interesting here

**memory that degrades gracefully.** facts live in SQLite with three ways in: importance and recency, an FTS5 full-text index, and per-row float32 embeddings for semantic recall. one recall walks a ladder, semantic first, then lexical, then substring, then importance. if the embedding service is down, recall falls back to lexical instead of failing the turn. memories carry a strength that rises when they keep resurfacing and decays when they go untouched.

**a Construct that doesn't wake up cold.** recall is pull-based, so a memory only surfaces if the current message matches it. the working mind adds push: a small evolving set of the Construct's own recent thoughts and recently-surfaced memories rides every turn, kept warm instead of vanishing the moment the next message doesn't match. the harness promotes and decays these but never authors them, so the held state stays the Construct's own.

**dreaming.** during downtime a Construct can invent a throwaway personality, drop it into a scenario abstracted from its own memory corpus, and record what that persona chooses. the point isn't to remember you better, it's to explore the decision-space you inhabit with synthetic agents that cost nothing to discard.

**an adversarial critic panel with stakes.** this is the reason the project exists. a reviewer told to "be blunt" still drifts toward the agreeable centroid, so instead of ordering a critic to be harsh you give it something to protect. each critic is dealt a stake, a scene where being wrong has a cost: a `falsePass` stake dreads waving something broken through and pulls toward rejection, a `falseFail` stake dreads blocking good work and pulls toward approval. deal both across a panel and you get a jury arguing a real tension instead of a monoculture nodding along.

`dealRoster` stratifies the deal so both valences are guaranteed present for any panel of two or more, while keeping which persona is biased which way random within each panel. there's a bias harness (`npm run bias`) that runs the live panel over a candidate many times, re-seating and re-dealing between trials, and reports how stable and correct the verdict was. on code carrying a cardinal flaw it fails every trial; on genuinely sound code the verdict still wobbles with the seating. invariance is a property the design is built toward and measures, not one it claims to have solved.

## Quick start

```sh
export ANTHROPIC_API_KEY=sk-...
export OPENAI_API_KEY=sk-...   # optional: turns on semantic recall

npm start
```

runs on Node 23.6+ using native type stripping, so there's nothing to compile.

## License

ISC.
