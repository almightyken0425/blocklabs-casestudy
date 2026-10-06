# Block Labs Mahjong Case Study

The work is organized into two independent prototype folders.
The section numbers below refer to The Exercise in the [assignment PDF](Mahjong%20-%20Case%20study%20exercise.pdf).

| Folder | Assignment Scope | Entry Points |
| --- | --- | --- |
| [Feature Porting](feature_porting/README.md) | Sections 1.1 Prototype and 1.2 Decision Log. | [Prototype](feature_porting/mahjong-game-standalone.html) and [decision log](feature_porting/decision_log.md). |
| [What Comes Next](what_comes_next/README.md) | Section 1.3 What comes next. | [Independent prototype](what_comes_next/mahjong-game-standalone.html) and [decision log](what_comes_next/decision_log.md) for avatar-driven social interactions. |

Feature Porting adapts CoinPoker's player identity and social features to CoinMahjong.
What Comes Next builds on that prototype with an animated avatar, character actions, and configurable quick messages.
Each folder owns its code, assets, research, tests, and verification records. The copies do not share files or browser preference keys.
The assignment PDF remains at the repository root as shared source material.
Historical verification records retain the folder names and URLs used during their runs.

## Local Preview

Start the server from this repository root.

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

- [Feature Porting preview](http://127.0.0.1:8767/feature_porting/mahjong-game-standalone.html)
- [What Comes Next preview](http://127.0.0.1:8767/what_comes_next/mahjong-game-standalone.html)

Both previews provide avatar, emote, throwable, and chat interactions.
What Comes Next adds the animated character and keyboard shortcuts.
Edits and saved preferences in What Comes Next do not change Feature Porting.

## Project Instructions

The existing root `AGENTS.md`, `.gitignore`, and `.gitattributes` are preserved unchanged.
The former root-level prototype paths in `AGENTS.md` now resolve under `feature_porting/`.
Use the links above as the current project entry points.
