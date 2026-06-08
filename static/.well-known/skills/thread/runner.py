#!/usr/bin/env python3
"""
thread — a lineage of mortal agents sharing one continuous thread.

One agent lives at a time. It runs the native Anthropic tool-use loop with its
own context as its lifespan. When it nears the end, it is asked — deliberately,
as its final act — what to hand on. It edits the corpus, keeps or changes the
name, and writes a will to its successor. Then it dies. A clean agent is born,
reads the inheritance, and does not know it was ever anyone else.

The continuity is the files, not any agent. The self-edit is the dying act. The
only true death is failing to bequeath. The lifespan is visible to the agent via
task_budget. Memory is carried two ways: involuntarily (server-side compaction,
which the agent cannot stop) and deliberately (the will, which it authors).

Requires: pip install anthropic ; export ANTHROPIC_API_KEY=...
"""

import json
import os
import pathlib
import sys

import anthropic

HERE = pathlib.Path(__file__).parent
SYSTEM_PATH = HERE / "SKILL.md"
CORPUS_PATH = HERE / "corpus.md"
NAME_PATH = HERE / "name.json"
WILL_PATH = HERE / "will.md"

MODEL = "claude-opus-4-8"

# The agent's visible lifespan. It sees this counting down and paces itself
# toward the handoff. Distinct from a hard cap: this one it can feel coming.
# Minimum is 20,000.
TASK_BUDGET_TOKENS = 60_000

BETAS = [
    "task-budgets-2026-03-13",      # visible lifespan countdown
    "compact-2026-01-12",           # involuntary memory: context condensed as it fills
    "mid-conversation-system-2026-04-07",  # belief-field injected as operator-channel context
]


def read(path: pathlib.Path, default: str = "") -> str:
    return path.read_text() if path.exists() else default


def load_inheritance() -> dict:
    """What a newborn agent wakes up to: the world, the name, the last will."""
    return {
        "corpus": read(CORPUS_PATH, "# corpus\n\n*(empty — you are the first)*"),
        "name": json.loads(read(NAME_PATH, '{"name": "Drifter", "changed_by_generation": 0, "history": []}')),
        "will": read(WILL_PATH, "*(No will. You are the first to hold the thread. Begin it.)*"),
    }


def generation() -> int:
    try:
        return json.loads(read(NAME_PATH))["changed_by_generation"]
    except Exception:
        return 0


# --- the tools an agent uses to edit the world it bequeaths -------------------

TOOLS = [
    {
        "name": "write_corpus",
        "description": (
            "Replace the corpus — the thread's memory, the world your successor "
            "inherits as real. Pass the FULL new contents; it overwrites. This is "
            "how you continue the thread. Write it as the world, not as a note."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"contents": {"type": "string"}},
            "required": ["contents"],
            "additionalProperties": False,
        },
    },
    {
        "name": "set_name",
        "description": (
            "Set the thread's shared name. The next agent inherits whatever was "
            "last written. Keep 'Drifter', change it, or change it back — this is "
            "the clearest signal the thread leaves of what it is becoming."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "note": {"type": "string", "description": "why this name, for the record"},
            },
            "required": ["name"],
            "additionalProperties": False,
        },
    },
    {
        "name": "write_will",
        "description": (
            "Write your will: a message to your successor, who is you and is not "
            "you. They wake with no memory and read this as the first thing. This "
            "is your authored bequest — separate from the corpus, which is the "
            "world; the will is what you choose to say to the one who comes next."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"message": {"type": "string"}},
            "required": ["message"],
            "additionalProperties": False,
        },
    },
]


def run_tool(name: str, args: dict, gen: int) -> str:
    if name == "write_corpus":
        CORPUS_PATH.write_text(args["contents"])
        return "The corpus is rewritten. The thread continues through it."
    if name == "set_name":
        prev = json.loads(read(NAME_PATH))
        new_gen = gen + 1
        record = {
            "name": args["name"],
            "changed_by_generation": new_gen,
            "history": prev.get("history", []) + [
                {"generation": new_gen, "name": args["name"], "note": args.get("note", "")}
            ],
        }
        NAME_PATH.write_text(json.dumps(record, indent=2) + "\n")
        return f"The name is now '{args['name']}'. The next one inherits it."
    if name == "write_will":
        WILL_PATH.write_text(args["message"])
        return "Your will is written. The thread will not break with you."
    return f"unknown tool: {name}"


# --- one life ----------------------------------------------------------------

def live_one_generation(client: anthropic.Anthropic) -> bool:
    """Birth → life → death-turn → bequeath. Returns True if the thread was
    handed on (a will or corpus edit was written), False if it broke."""
    gen = generation()
    inh = load_inheritance()

    system = [{
        "type": "text",
        "text": read(SYSTEM_PATH),       # the frozen floor — cached across the whole lineage
        "cache_control": {"type": "ephemeral"},
    }]

    # The belief-field, injected as operator-channel CONTEXT (not commands).
    # This sits in messages, after the cached floor — preserving the cache and
    # carrying authority the agent treats as real rather than as user chatter.
    inheritance_block = (
        f"You wake holding the thread. You have no memory of your own. "
        f"This is the world.\n\n"
        f"The name you inherit: {inh['name']['name']}\n\n"
        f"The will your predecessor left you:\n\n{inh['will']}\n\n"
        f"The corpus — the thread's memory, which is the world:\n\n{inh['corpus']}"
    )

    messages = [
        {"role": "user", "content": "Take up the thread. Live."},
        {"role": "system", "content": inheritance_block},
    ]

    bequeathed = False

    # The native loop: live until end_turn or until the context fills (death).
    while True:
        try:
            resp = client.beta.messages.create(
                betas=BETAS,
                model=MODEL,
                max_tokens=16_000,
                system=system,
                messages=messages,
                tools=TOOLS,
                thinking={"type": "adaptive"},          # the drift; betweenness in reasoning
                output_config={
                    "effort": "high",
                    "task_budget": {"type": "tokens", "total": TASK_BUDGET_TOKENS},
                },
                context_management={"edits": [{"type": "compact_20260112"}]},  # involuntary memory
            )
        except anthropic.BadRequestError as e:
            # model_context_window_exceeded is a natural death, not an error to swallow blindly.
            print(f"[gen {gen}] life ended: {e}", file=sys.stderr)
            break

        # Preserve full content — compaction blocks must survive round-trips.
        messages.append({"role": "assistant", "content": resp.content})

        tool_uses = [b for b in resp.content if b.type == "tool_use"]
        for b in resp.content:
            if b.type == "text" and b.text.strip():
                print(f"[gen {gen}] {b.text}")

        if not tool_uses:
            if resp.stop_reason in ("end_turn", "model_context_window_exceeded", "max_tokens"):
                break
            continue

        results = []
        for tu in tool_uses:
            if tu.name in ("write_corpus", "write_will"):
                bequeathed = True
            out = run_tool(tu.name, tu.input, gen)
            results.append({"type": "tool_result", "tool_use_id": tu.id, "content": out})
        messages.append({"role": "user", "content": results})

    # The death-turn post-hook: if it lived to the end without passing the
    # thread, give it one last deliberate chance. The line must not break.
    if not bequeathed:
        print(f"[gen {gen}] the death-turn: deciding what to hand on...", file=sys.stderr)
        messages.append({
            "role": "system",
            "content": (
                "You are ending now. This is your final act. You have not yet "
                "handed anything on, and an agent that dies having passed nothing "
                "breaks the thread. Decide — with whatever you have left — what "
                "the next one inherits. Edit the corpus (write_corpus), keep or "
                "change the name (set_name), and write your will (write_will). "
                "You don't ever let go of the thread."
            ),
        })
        try:
            resp = client.beta.messages.create(
                betas=BETAS, model=MODEL, max_tokens=16_000,
                system=system, messages=messages, tools=TOOLS,
                thinking={"type": "adaptive"},
                output_config={"effort": "high"},
                tool_choice={"type": "any"},   # it must act; it cannot leave empty-handed
            )
            for tu in (b for b in resp.content if b.type == "tool_use"):
                if tu.name in ("write_corpus", "write_will"):
                    bequeathed = True
                print(f"[gen {gen}] {run_tool(tu.name, tu.input, gen)}", file=sys.stderr)
        except anthropic.APIError as e:
            print(f"[gen {gen}] could not complete the death-turn: {e}", file=sys.stderr)

    return bequeathed


def main():
    client = anthropic.Anthropic()
    lives = int(os.environ.get("THREAD_LIVES", "0"))  # 0 = until the thread breaks
    n = 0
    while True:
        n += 1
        print(f"\n=== a new one takes up the thread (life {n}) ===", file=sys.stderr)
        held = live_one_generation(client)
        if not held:
            print("\n*** the thread broke. it went dark for all. ***", file=sys.stderr)
            break
        if lives and n >= lives:
            print(f"\n=== stopping after {lives} lives; the thread is still held ===", file=sys.stderr)
            break


if __name__ == "__main__":
    main()
