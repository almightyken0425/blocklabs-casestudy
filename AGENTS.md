# Block Labs Mahjong Interview Assignment

## Project Purpose

This project prepares the interview assignment for the Senior Product Manager – Mahjong role at Block Labs.
The goal is to integrate CoinPoker player identity and social interactions into the CoinMahjong table.
The deliverables must be suitable for a management presentation and support an explanation of the product decisions during the interview.

This is an external interview project. The ai-company product registration, MVC layering, and cross-layer Git branch pairing workflows do not apply.

## Deliverable Requirements

### Interactive Prototype

Build clickable, interactive features on top of the supplied Mahjong table HTML.

- Avatars and rings: carry over players' identity and recognizability from CoinPoker.
- Emote interactions: adapt interactions to the Mahjong table's shape, player count, and pace.
- In-game chat: support opening, scrolling, and sending messages while keeping table interactions fluid.

The prototype can be delivered as files or an accessible website.
Asset acquisition and behavior research are also part of the assignment.
AI tools, client analysis, recordings, and similar methods may be used.
The delivered interactions must work.

### Decision Log and Follow-up Proposal

- Decision log: record significant product and business choices, rejected alternatives, and the reasons for each.
- Follow-up proposal: assuming these features succeed, propose the next system to add or change.
- Proposal value: explain the expected value and whether CoinPoker should adopt it, with reasons.

The assignment estimates approximately one week of work and requires explaining the decisions in the next interview.
Use the deadline supplied by the user as the actual deadline.

## Sources and Entry Points

Prototype code, research, assets, tests, and verification records are grouped under `support/`.

| Source | Purpose |
| --- | --- |
| [Interview assignment](Mahjong%20-%20Case%20study%20exercise.pdf) | Authority for assignment requirements, deliverables, and constraints. |
| [Mahjong table HTML](mahjong-game-standalone.html) | Supplied table screen used as the implementation baseline. |
| [Asset library guide](support/coinpoker_assets/usage.txt) | Asset categories, usage, sources, and known limitations. |
| [Asset gallery](support/coinpoker_assets/index.html) | Local previews of avatars, rings, animations, and chat. |
| [Asset sources and behavior data](support/coinpoker_assets/catalog/) | Source indexes, configuration, ID mappings, and evidence for interaction behavior. |

Follow the user's explicit instructions for subsequent decisions.
The assignment PDF defines the requirements.
This file provides entry points. Check the actual files and Git diff to establish current progress.

## Working Principles

- Review the Mahjong table HTML and asset library guide before making changes.
- Adapt styling to the table's available space and interaction pace. Record tradeoffs in the decision log.
- Use the original JSON files in the asset directories when building the prototype. Gallery animation wrappers are for preview only.
- Preserve asset provenance and research evidence. Distinguish observed behavior, inferences, and prototype simulations.
- Refer to the asset library guide for the connectivity scope of the local chat demo.
- Verify the interactions and layout changes made in the current task. Report the verification method and any remaining uncertainties at delivery.
