# PROBE — Provable Resource & Behavior Endpoints

**Version:** 0.1 (draft)
**Status:** experimental
**Discovery path:** `/.well-known/probe.json`

---

## The problem

The agentic web is drowning in *manifests*: `agents.txt`, `ai-agent.json`,
`agent-card.json`, skills indices, AI-plugin descriptors. They all answer the
same question — **"what does this site claim it can do?"** — and they all share
the same fatal flaw:

> A claim is a promise nobody checks.

Every existing manifest is an **unverifiable declaration**. A site can advertise
a capability it never had, or that broke six deploys ago, and no reader can tell
the difference without bespoke, out-of-band probing. The `agents.txt` spec even
lists this in its own weaknesses: *"a malicious site could declare capabilities
it doesn't actually support."* It's left as an exercise for the reader.

Worse, every manifest is a **second copy of the truth**. The real capability
lives in the code; the manifest is a hand-maintained mirror that drifts the
moment someone forgets to update it.

## The idea

PROBE changes the question from *"what do you claim?"* to:

> **"what do you claim, stated as something anyone can independently prove
> against your live site?"**

A PROBE manifest is not a description. It is a list of **assertions** — testable
predicates about live endpoints. Each assertion names a request to make and a
deterministic check on the response. For example: *"`GET /resume.json` returns
200 with `content-type: application/json` and a body where `$.basics.name` is a
non-empty string."*

The cleverness is **not in the format** — the format is boring, inert JSON,
because inert JSON is what wins. The cleverness is that **conformance is
externally verifiable**:

- The site publishes claims.
- A **shared, neutral verifier** — *not owned by the site* — fetches the
  manifest, executes each assertion against the live endpoints, and returns a
  verdict the site does not control.
- "This domain conforms" becomes a **fact anyone can recompute from scratch**:
  no registry, no signing authority, no trusting the publisher.

A stale or lying manifest doesn't *get away with it* — it **fails verification
in public**. Honesty is enforced by the checker, not by discipline.

## What this gives you that the others can't

| Property                          | agents.txt / ai-agent.json / … | PROBE |
|-----------------------------------|:------------------------------:|:-----:|
| Inert, parses everywhere          | ✅ | ✅ |
| Self-hosted, no registry          | ✅ | ✅ |
| Drift is *detectable* by readers  | ❌ | ✅ |
| Claims are *falsifiable*          | ❌ | ✅ |
| Trust is portable / recomputable  | ❌ | ✅ |
| Verifier is third-party           | ❌ | ✅ |

## The manifest

`/.well-known/probe.json`:

```jsonc
{
  "probe": "0.1",
  "subject": "https://example.com",
  "generated": "2026-06-06T00:00:00Z",
  "assertions": [
    {
      "id": "resume-json",
      "describe": "Resume is served as valid JSON Resume",
      "request": { "method": "GET", "path": "/resume.json" },
      "expect": [
        { "status": 200 },
        { "header": "content-type", "contains": "application/json" },
        { "json": "$.basics.name", "type": "string", "nonEmpty": true }
      ]
    }
  ]
}
```

### Assertion grammar

An **assertion** is an object:

- `id` *(string, required)* — stable, unique within the manifest.
- `describe` *(string, required)* — human sentence; what a pass means.
- `request` *(object, required)*
  - `method` — HTTP method (default `GET`).
  - `path` — path relative to `subject`, or an absolute URL on the same origin.
  - `headers` *(object, optional)* — request headers to send.
  - `body` *(string, optional)* — request body.
- `expect` *(array, required)* — a list of **checks**, ALL of which must hold.

A PROBE manifest **passes** iff every assertion passes. An assertion passes iff
every check in its `expect` array passes against a single live response.

### Checks

Each check is one object with exactly one *primary* key:

| Check                          | Passes when… |
|--------------------------------|--------------|
| `{ "status": 200 }`            | response status equals the value |
| `{ "status": [200, 204] }`     | response status is in the list |
| `{ "header": "x", "contains": "y" }` | header `x` exists and contains substring `y` |
| `{ "header": "x", "equals": "y" }`   | header `x` equals `y` exactly |
| `{ "header": "x", "present": true }` | header `x` exists (or `false` → absent) |
| `{ "json": "$.a.b", "equals": v }`   | JSONPath `$.a.b` deep-equals `v` |
| `{ "json": "$.a.b", "type": "string" }` | value is of that JSON type |
| `{ "json": "$.a.b", "nonEmpty": true }` | string/array/object is non-empty |
| `{ "json": "$.a", "minLength": n }`  | array/string length ≥ `n` |
| `{ "body": "contains", "value": "z" }` | raw body contains substring `z` |

`json` uses a deliberately tiny JSONPath subset: `$`, dot keys, and `[n]`
indices. No filters, no wildcards — verification must be deterministic and
trivial to reimplement.

Unknown check keys are a **conformance error in the manifest**, not silently
ignored — a verifier that can't evaluate a check MUST report the assertion as
`error` (distinct from `fail`), so unverifiable claims never read as passing.

### Verdicts

A verifier reports, per assertion, one of:

- `pass` — every check held.
- `fail` — a check evaluated to false against a valid response.
- `error` — the request couldn't be made, or a check couldn't be evaluated
  (unknown check, malformed manifest). **`error` is never `pass`.**

The domain-level verdict is `pass` only if every assertion is `pass`.

## Affordances — capabilities that retract themselves

Assertions say what's *true*. An **affordance** says what's true *and useful*:
"because these assertions hold, you can do this." Crucially, an affordance is
**never a claim** — it is *derived* from assertions and exists only while they
pass.

```jsonc
"affordances": [
  {
    "id": "fetch-resume",
    "describe": "Retrieve a structured résumé in JSON Resume format.",
    "requires": ["resume-json", "resume-json-preset"],  // assertion ids
    "via": { "method": "GET", "path": "/resume.json",
             "params": { "preset": "software | embedded | it | content" } },
    "returns": "application/json (jsonresume.org)"
  }
]
```

A verifier computes, for each affordance, a field `available`:

> `available` is `true` iff **every** assertion id in `requires` evaluated to
> `pass`.

This is the property no other manifest has. Elsewhere, a capability is a
promise typed once that stays advertised long after it breaks. In PROBE, the
moment a backing endpoint regresses, its assertion fails and the affordance
**withdraws itself** — the verifier reports it as unavailable, naming the
assertions that blocked it. A site cannot offer what it cannot currently prove.

An agent's loop becomes trivial and trustworthy: fetch manifest → verify →
*use only the affordances that came back `available`*.

## Why "the checker isn't yours" is the whole point

Anyone can run the verifier. The site operator, an agent about to transact, a
directory ranking sites, a skeptic, a competitor. They all compute the **same
verdict** from the **same public inputs** (your manifest + your live responses).

There is nothing to trust about the publisher, because there is nothing the
publisher can fake: the proof is in endpoints the publisher does not get to
intercept between you and them. This is the robots.txt of *accountability* —
one declaration, external proof.

## Reference implementation

- Manifest: [`/.well-known/probe.json`](/.well-known/probe.json) — **generated**
  from this site's source of truth at build/request time, so it cannot drift
  from what the site actually serves.
- Verifier: [`/.well-known/probe/verify.mjs`](/.well-known/probe/verify.mjs) —
  a dependency-free, ~1-file checker. Run it against *any* PROBE domain:

  ```sh
  node verify.mjs https://xandwr.com
  ```

PROBE is offered into the public domain. Fork it, break it, beat it.
