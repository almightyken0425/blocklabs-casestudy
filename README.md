# Block Labs Mahjong Case Study

The work is organized into two independent prototype folders.
The section numbers below refer to The Exercise in the [assignment PDF](Mahjong%20-%20Case%20study%20exercise.pdf).

| Folder | Assignment Scope | Entry Points |
| --- | --- | --- |
| [Questions 1 and 2](questions_1_2/README.md) | Sections 1.1 Prototype and 1.2 Decision Log. | [Prototype](questions_1_2/mahjong-game-standalone.html) and [decision log](questions_1_2/decision_log.md). |
| [Question 3](question_3/README.md) | Section 1.3 What comes next. | [Independent prototype copy](question_3/mahjong-game-standalone.html) for exploring the next system. |

Question 3 starts from a copy of the current prototype. No new system has been selected or implemented there yet.
Each folder owns its code, assets, research, tests, and verification records. The copies do not share files or browser preference keys.
The assignment PDF and original asset ZIP remain at the repository root as shared source material.

## Local Preview

Start the server from this repository root.

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

- [Questions 1 and 2 preview](http://127.0.0.1:8767/questions_1_2/mahjong-game-standalone.html)
- [Question 3 preview](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html)

Both previews initially provide the existing avatar, emote, throwable, and chat interactions.
Edits and saved preferences in Question 3 do not change Questions 1 and 2.

## Project Instructions

The existing root `AGENTS.md`, `.gitignore`, and `.gitattributes` are preserved unchanged.
The former root-level prototype paths in `AGENTS.md` now resolve under `questions_1_2/`.
Use the links above as the current project entry points.
