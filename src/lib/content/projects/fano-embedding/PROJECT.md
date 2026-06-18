---
repo: xandwr/fano-embedding
title: fano-embedding
tagline: read any word against a fixed set of named semantic axes instead of letting PCA pick them
featured: true
order: 4
tags: [python, embeddings, nlp]
---

A semantic instrumentation framework. Instead of letting PCA discover axes from variance, it fixes a set of named axes up front and reads any word or text against them.

Each axis is the unit vector between two pole sets: a handful of words for the positive end, a handful for the negative end. Project a concept onto all of them and you get a fingerprint showing how it aligns with each dimension.

## The axes

Eight axes survived cross-model validation, each built from centroid pairs of opposing word sets:

| Axis | Positive pole | Negative pole |
| --- | --- | --- |
| boundary | Input, Receive, Observe | Output, Emit, Express |
| state | Memory, Belief, Model, State | Signal, Output, Action |
| update | Feedback, Learning, Attention, Reflection | Commit, Choice, Action, Control |
| agency | Goal, Intention, Choice, Action | Perceiving, Receiving, Feedback |
| affect | Desire, Fear, Curiosity, Feeling | Planning, Model, Evaluation |
| prediction | Prediction, Expectation, Planning | Memory, Reflection, Knowing |
| control | Control, Agency, Direction, Constraint | Adaptation, Drift, Chance |
| generativity | Create, Generate, Compose, Originate | Copy, Repeat, Maintain, Preserve |

## How it works

a few methodological choices that make the readings hold up:

- **per-word centroids** for axis construction, not phrase embeddings. averaging individual word vectors gives a cleaner pole than embedding the whole pole as one string
- **mean-centering** the vectors first, to strip out the anisotropic bias that embedding models bake into every vector
- **least-squares residuals** so the projections account for the fact that the axes aren't orthogonal
- the residual doubles as a **centrality meter**: low residual means the concept is a hub that the frame already explains, high residual means it's a leaf living mostly off-frame

## Validation

ran the whole thing across four embedding models. most axes reproduce consistently (generativity held at +0.32 to +0.44 everywhere). a ninth axis, transmission for communication, never converged and got cut. the nice part is the frame can flag its own gaps: an axis with no signal across models is one the word poles just don't capture.

## Run it

```sh
uv run python main.py
```

swap the embedding model via the `MODEL` constant with anything Ollama can serve.
