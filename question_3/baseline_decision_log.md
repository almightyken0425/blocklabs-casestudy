# CoinMahjong Baseline Decision Log

This is a copy of the decisions behind the starting prototype for Question 3.
It records the inherited baseline, not decisions about the proposed next system.

This document records the product assumptions and prototype tradeoffs for the CoinMahjong case study.
It follows the [interview assignment](../Mahjong%20-%20Case%20study%20exercise.pdf), specifically the Decision Log requirement on page 3.

## Assignment Assumptions and Experience Direction

This work adopts two main premises.

1. CoinPoker acquires a Mahjong platform, rebrands it, and adapts it into CoinMahjong. This is the scenario established on page 1 of the assignment.
2. CoinMahjong should offer an experience consistent with CoinPoker, allowing existing players to retain familiar identities, controls, and social interactions. This is the design direction adopted to meet the assignment's integration objective.

The assignment describes an initial integration limited to branding, with CoinPoker features not yet fully incorporated into CoinMahjong.
The following three features will be introduced into the supplied Mahjong table HTML in sequence to create a clickable, interactive prototype.

| Implementation Order | Feature | Experience Goal |
| --- | --- | --- |
| 1 | Avatars and rings | Preserve players' identity and recognizability from CoinPoker. |
| 2 | Emote interactions | Retain familiar reactions and throwables while adapting to the Mahjong table's shape, player count, and pace. |
| 3 | In-game chat | Support opening, scrolling, and sending messages while keeping table interactions fluid. |

All three features use CoinPoker behavior as their starting point and adapt it to the Mahjong table context.

## Decision 1: Keep Settings Inside the Game Window

Date: 2026-10-04.
Status: Decided.
Scope: This CoinMahjong prototype.

### Background

The product direction is for CoinMahjong and CoinPoker to share a window title bar.
This gives players consistent window controls and feature entry points across both games.

CoinPoker's title bar contains multiple feature entry points, and its Settings button opens another menu level.
Reproducing the entire bar would introduce several layers of functionality beyond the focus of this three-feature prototype.

### Choice and Rationale

| Option | Decision | Rationale |
| --- | --- | --- |
| Place a Settings entry point inside the game window | Adopted. | Preserve a working settings flow while keeping the prototype focused on the three features. |
| Build a separate, complete window title bar and its nested features | Not adopted for this prototype. | Supporting the additional entry points and feature layers would expand the scope. |

The prototype places a Settings entry point inside the game window without building a separate title bar.
Players use it to access relevant settings, then continue using avatars and the other included features.

The table screen defines the full interaction area of the standalone game window.
Chat, Settings, and other social controls and panels stay within the table boundaries.
Blank browser margins created by scaling are outside the game interaction area.

### Tradeoffs and Implications

This approach preserves settings interactions but does not reproduce CoinPoker's complete title bar and menu hierarchy.
The demonstration focuses on how the three features fit into the Mahjong table and how players use them.

A shared title bar remains the direction for the production product.
The in-game Settings entry point is a prototype scope decision, not a decision to use a different window interaction architecture in production.

## Decision 2: Place Avatars on the Left and Align Hands to the Right

Date: 2026-10-04.
Status: Decided.
Scope: Avatar and hand placement for all four seats.

### Background

An avatar centered on a player's tile area could become too close to the discard area as its height or width grows.
The prototype therefore moves avatars to the left of the tile area, leaving the center for game information and discards.
Left and right are defined from each player's perspective facing the table. The same rule applies to all four seats.

### Choice and Rationale

The layout uses the assumption that most players are right-handed.
Hand interaction is the primary action, so hands align to the right to reserve that side for primary controls.
Social interactions on avatars and viewing player information are secondary actions, so avatars sit on the left.
See [Decision 3](#decision-3-use-table-seats-for-social-interactions-and-the-player-list-for-profiles) for the placement of social menus and player profile entry points.

| Seat Wind | Screen Position | Avatar Position on Screen | Hand Alignment |
| --- | --- | --- | --- |
| East | Bottom. | Left of the hand. | Right side of the screen. |
| South | Right. | Below the hand. | Top of the screen. |
| West | Top. | Right of the hand. | Left side of the screen. |
| North | Left. | Above the hand. | Bottom of the screen. |

### Tradeoffs and Implications

All four seats place the avatar on the player's left and the hand on the player's right.
Emotes, throwables, and chat bubbles follow the new seat positions after avatars move away from the center of the discard areas.
This change adjusts the existing prototype layout. It does not add live gameplay or a left-handed control mode.

## Decision 3: Use Table Seats for Social Interactions and the Player List for Profiles

Date: 2026-10-04.
Status: Decided.
Scope: Table seats and the player list.

### Background

CoinPoker provides Emotes and Throwables buttons beside table avatars.

Mahjong hands take up substantial horizontal space. Copying that arrangement directly would crowd the layout with additional buttons beside each avatar. Social menus are therefore integrated into avatars to reduce extra controls.

### Choice and Rationale

- Hover over your own avatar in either area to open Emotes.
- Hover over an opponent's avatar to open that player's Throwables menu.
- Remove the separate emote and throwable buttons beside avatars.
- Keep wind icons in the player list and add a Profile button to their left.

Table seats focus on interactions between players.

The player list already groups player information. Placing Profile there makes its purpose as an entry point for player details clearer. Future player information can also be presented in the Profile dialog.

### Tradeoffs and Implications

The prototype departs from CoinPoker's separate buttons beside avatars to preserve space on the Mahjong table.

Hover entry points are less discoverable for first-time users. The prototype retains click, touch, and keyboard support and allows the pointer to move smoothly into the menu to select an asset.
