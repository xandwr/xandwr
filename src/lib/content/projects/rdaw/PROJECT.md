---
repo: xandwr/rdaw
title: rdaw
tagline: a digital audio workstation in rust, built as a cargo workspace from a backend-free dsp core up to an egui frontend
featured: true
order: 7
tags: [rust, audio, dsp]
---

A digital audio workstation written in Rust, laid out as a cargo workspace so the audio model stays clean of any backend or UI.

## The crates

- **`rdaw-core`**: the pure DSP data model. audio buffers, the node trait, the process graph, transport, automation, timeline, tempo, and a handful of built-in nodes. no audio-backend dependency at all, so everything here can be driven from a test or an offline renderer
- **`rdaw-engine`**: the real-time host that drives the core graph against a live audio device
- **`rdaw-io`**: file i/o, including wav roundtrip and an offline bounce example
- **`rdaw-gui`**: an [eframe/egui](https://github.com/emilk/egui) frontend with a timeline and transport, plus `rfd` for native file dialogs
- **`rdaw-app`**: the top-level binary that wires it together

## The split that matters

the core is sample-format-agnostic on the inside, planar `f32` everywhere, and the host converts to whatever the device wants at the very edge. keeping the DSP model free of `cpal` means the whole audio engine is testable offline. the test suite reflects that: automation, fades, filters, mute/solo, resampling, tempo, and timeline all have their own integration tests that run with no sound card in sight.

```
rdaw-core  (pure dsp, no backend)
   ├── rdaw-engine  (real-time host)
   ├── rdaw-io      (wav, bounce)
   └── rdaw-gui     (egui timeline + transport)
          └── rdaw-app  (the binary)
```

## Run it

```sh
cargo run -p rdaw-app
```
