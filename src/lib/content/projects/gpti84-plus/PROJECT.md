---
repo: xandwr/GPTi84-Plus
title: GPT in a TI-84
tagline: bit-banged the calculator's link port to run GPT on a TI-84 Plus
featured: true
order: 1
tags: [embedded, firmware, hardware]
---

Soldered a Pico W to a 2.5mm headphone cable to bridge a TI-84 Plus to a remote
server, then implemented a custom wire protocol by bit-banging the DBUS of the
link port. The calculator's state mirrors to the server bidirectionally with
negligible transport time, so responses keep pace with the web version of GPT.

Scored 83% on a mock pure-math exam. Roasted my mom's cooking when prompted.
