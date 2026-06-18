---
repo: xandwr/anthropical
title: anthropical
tagline: a tiny pure-rust client for anthropic's messages api, blocking and no async runtime required
featured: true
order: 6
tags: [rust, claude, api]
---

A lightweight, pure-Rust client library for Anthropic's Messages API. it's blocking (no async runtime required), has a tiny dependency tree, and leans on serde for everything on the wire.

## What it does

- send messages and receive typed responses from Claude
- stream server-sent events incrementally
- count input tokens without generating a completion
- tool-use workflows with proper error handling
- retries with exponential backoff
- a neutral error taxonomy so you can tell failure categories apart

## Install

still pre-release and not on crates.io yet, so it's a git dependency:

```toml
[dependencies]
anthropical = { git = "https://github.com/xandwr/anthropical" }
```

requires Rust 1.96.0 or later.

## Usage

send a blocking message:

```rust
let client = Anthropic::from_env()?;
let response = client
    .message("claude-opus-4-8")
    .system("You are concise.")
    .user("Say hello in one word.")
    .max_tokens(64)
    .send()?;
```

stream a response:

```rust
let stream = Anthropic::from_env()?
    .message("claude-opus-4-8")
    .user("Count to five.")
    .stream()?;

for event in stream {
    let event = event?;
    // process event
}
```

count tokens:

```rust
let tokens = Anthropic::from_env()?
    .message("claude-opus-4-8")
    .user("How many tokens is this?")
    .count_tokens()?;
```

## Dependencies

kept deliberately small: `ureq` (HTTP with rustls), `serde`/`serde_json`, and `thiserror`.

## Status

early-stage with an unstable API surface. contributions and issues welcome.
