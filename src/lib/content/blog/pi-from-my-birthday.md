---
title: deriving pi from my own birth date
description: bored at work, service desk was dead today lol
published: 2026-06-03
last-edited: 2026-06-03
---

DOB: June 24, 2003 → `2003-06-24`

- `2003 = 2 * (2 ** 3) * (5 ** 3) + 3`  *(same as `(2 ** 4) * (5 ** 3) + 3`)*
- `06 = 3!`
- `24 = 4!`

---

month is `3!`. day is `4!`. `2003` is prime.

## setup: a birthday made of factorials

```python
def xanders_birthday() -> Birthday:
    year = (2 ** 4) * (5 ** 3) + 3 # 2003, prime
    month = factorial(3) # 6
    day = factorial(4) # 24
    return Birthday(year, month, day)
```

`3!` and `4!`, sitting next to a prime year. the month divides the day exactly four times (`24 // 6 == 4`),
which i used as a `modulo()` helper without thinking about it.
it's honestly just funny so i did it!

then i wrote this thing (don't ask about the names this was NOT about pi to begin with lol)

```python
def xander_birthday_sum() -> float:
    value = 0
    for i in range(birthday.day + 1): # range(25): 0,1,2,...,24
        value += i ** 2
    return value
```

sums `0² + 1² + 2² + … + 24²`. **4900**, which is
**70²**. a perfect square. sorry maynard.

`24` is the only integer greater than 1 for which `1² + 2² + … + n²` is itself a perfect square. there's a famous problem like this:

- stack cannonballs into a square pyramid exactly 24 layers
tall, and you can re-lay the same cannonballs into a flat 70×70 square. no other pyramid height works, ever!

## 24 is kinda lit, also leeches

That exact fact, `Σ k² = 70²` over the first 24 integers, is used to build the **Leech lattice** in 24 dimensions:
- the densest known sphere packing, where every sphere kisses 196,560 others.

shows up elsewhere but who cares it just works.

proceed with some bullshit:

- **j-invariant -> leech.** near-integer `e^(π√163) ≈
  262537412640768743.99999999999925` comes from the `j`-function and the fact that `163` is the largest **Heegner number** which is the last one that works, just as `24` is the last cannonball dimension...
- **leech -> golay.** build the leech lattice out of the binary golay
  code (thanks wikipedia) `[24, 12, 8]`: 24 coordinates, 12 message bits, minimum distance 8.
- **golay -> octonions (run now)** three copies of the octonions (`𝕆³`), three octonionic coordinates, `3 · 8 = 24`.

hence. how my birthday got involved and how i got to this point lmao.

## golay

there's a stub in my file called `miracle_generator` named after the MOG, for computing in the golay code. i built the `[24, 12, 8]` extended binary g. code the textbook way:
- a generator polynomial for the cyclic `[23, 12]` code
- then an overall parity bit to extend to 24

```python
def miracle_generator() -> list[int]:
    # g(x) = x^11 + x^9 + x^7 + x^6 + x^5 + x + 1
    g = (1<<11)|(1<<9)|(1<<7)|(1<<6)|(1<<5)|(1<<1)|(1<<0)
    codewords = []
    for msg in range(1 << 12):
        a = 0
        for i in range(12):
            if (msg >> i) & 1:
                a ^= g << i
        parity = a.bit_count() & 1 # the 24th bit
        codewords.append(a | (parity << 23))
    return codewords
```

how many codewords have each weight? mine came out:

```
{0: 1, 8: 759, 12: 2576, 16: 759, 24: 1}
```

759 is the number of octads (weight-8 codewords), the same 759 the MOG organizes. 4096 codewords total, minimum distance 8. lgtm.

## π, no cheating

> without copying Ramanujan or Chudnovsky, hopefully

### a theta series from a four-square theorem

**jacobi's four square theorem** says the number of ways to write `n` as a sum
of four squares is

```
r₄(n) = 8 · (sum of divisors of n not divisible by 4)
```

which is a few lines of pure number theory:

```python
def r_4(n: int) -> int:
    if n == 0: return 1
    total = sum(d for d in range(1, n + 1) if n % d == 0 and d % 4 != 0)
    return 8 * total
```

those `r₄(n)` are exactly the coefficients of the theta function

```
θ₃(q)⁴ = Σ r₄(n) qⁿ = 1 + 8q + 24q² + 32q³ + ...
```

a modular form (note the `24` in the `q²` term)

### jacobi's imaginary transform

θ₃ at `q` and at a "dual" point `q̃` are related, and **the relation contains
π**. Writing `q = 1/10 = e^(−ln 10)`:

```
π = ln(10) · θ₃(0.1)² / θ₃(q̃)²,   where  q̃ = e^(−π² / ln 10)
```

i can compute `θ₃(0.1)²` directly from my `r₄` series. pure arithmetic, no π.
small problem: the dual point `q̃` depends on π, the very thing i'm solving for.

### onwards to a fixed point

can't evaluate `q̃` directly, but i can iterate. the identity is a map, chase its fixed point:

```python
x = Decimal(3) # a SEED, can be random, not π
for _ in range(iterations):
    q_dual = (-(x * x) / ln_10).exp()
    dual = theta3(q_dual)
    x = ln_10 * theta3_q_squared / (dual * dual)
```

iteration converges to π.

it's slow (linear convergence where each pass buys a roughly fixed number of new digits), but it's also the best i got given this constraint lmfao.

my best, as of 2026-06-03:
(wrong at like ~34 digits or something)

```
3.141592653589793238462643383279502854366820696260176904419558139725041952891276053860121568789307042969596856483741431247241697890896360916233823790163367919397337650250779271273706370806087950331634415718077996517435414046542786572631531822415734064009193
```