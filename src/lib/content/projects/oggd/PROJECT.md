---
repo: xandwr/oggd
title: oggd
tagline: a godot 4 editor plugin that adds right-click ogg vorbis conversion straight from the filesystem dock
featured: false
order: 8
tags: [godot, gdscript, audio]
---

A Godot 4 editor plugin that adds right-click conversion of audio files to OGG Vorbis directly from the FileSystem dock.

## Requirements

- Godot 4+
- ffmpeg installed on your system

## Install

1. copy the `oggd` folder into `res://addons/` in your Godot project
2. enable **oggd** in **Project > Project Settings > Plugins**

## Use it

right-click supported audio files in the FileSystem dock to either create a new OGG file or replace the original. handles MP3, WAV, FLAC, AAC, M4A, AIFF, Opus, WMA, OGG, and OGX, and you can convert multiple files at once.

vorbis quality (0–10) lives under **Editor > Editor Settings > Oggd > Vorbis Quality**. default is 6, higher means better audio at the cost of larger files.

## License

MIT
