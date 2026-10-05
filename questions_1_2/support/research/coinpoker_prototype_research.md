# CoinPoker Research for Prototyping Three Interaction Features

This report supports implementation of the CoinMahjong prototype and covers avatars and rings, emote interactions, and in-game chat.
The core controls, assets, and client states provide enough evidence to build an interactive local prototype.
Online membership eligibility, remote feature flags, and chat restrictions still require simulated data.

Research date: 2026-10-04. Client baseline: CoinPoker 1.27.0 for macOS.
This research phase delivered findings and an asset index. It did not integrate the features into the Mahjong table.

## Findings Overview

| Feature | Role in CoinPoker | Behavior to Reproduce in the Prototype |
| --- | --- | --- |
| Avatars and rings | Player identity and status. Avatars are selectable, with some restricted by membership eligibility. | Grouped selection, current selection, immediate application, lock prompts, and rings based on player state. |
| Emote interactions | Reactions at your own seat and throwables directed from you to an opponent. | Separate entry points, category menus, Recents, target selection, animation playback, and disable settings. |
| In-game chat | Table message history and temporary bubbles beside seats. | Drawer opening and closing, scrolling, input, quick phrases, replies, copying, tagging, and mute settings. |

Use desktop pointer interaction as the initial baseline.
The original Mahjong draft uses a fixed stage with proportional scaling. Mobile touch entry points need separate adaptation during implementation.
This research does not treat desktop hover behavior as confirmed mobile behavior.

### How to Interpret the Evidence

- **Observed in the UI**: interface inspected in the native client during this investigation, or verified native screenshots.
- **Confirmed in code**: behavior supported by client code, scene configuration, or original assets. This does not establish that online operation was tested.
- **Official documentation**: public descriptions of user-facing features on CoinPoker's website.
- **Prototype recommendation**: a proposed simulation or adaptation for local demonstration. It is not yet a user-approved decision.

The SHA-256 hashes of four source files match the existing asset manifest.
New evidence also verifies instruction positions and opcodes for 193 methods.
See the [client evidence](coinpoker_evidence.json) for details.

The native avatar settings page was inspected for categories, previews, and membership locks.
The native table was inspected for avatars, rings, and the chat entry point.
The chat icon did not expand during tool-based interaction in this investigation. The reason remains unknown.
No account avatar was changed, no seat was taken, and no chat message or throwable was sent.

The [asset gallery](../coinpoker_assets/index.html) and most of its verification screenshots are locally reconstructed demonstrations.
They can verify assets but cannot establish CoinPoker's native layout or online behavior.

## Avatars and Rings

### Interface and Feature Placement

**Observed in the UI**: Settings → Avatars includes a large player preview.
The content below is organized into themed rows of circular avatars and scrolls vertically.
Longer categories have left and right navigation buttons.
The selected item has a checkmark, and exclusive categories show lock overlays.

| Category | Assets Acquired | Availability Evidence |
| --- | --- | --- |
| 3-BET CLUB | 16 | The settings page confirms this category and its locks. Actual access depends on account eligibility. |
| WORLD CUP | 10 | The settings page confirms this category and horizontal navigation. |
| ANIMAL | 5 | Confirmed on the settings page. |
| ANIME | 5 | Confirmed on the settings page. |
| HALLOWEEN | 5 | Confirmed on the settings page. |
| NOBLE | 5 | Confirmed on the settings page. |
| ROYAL | 5 | Confirmed on the settings page. |

The native table combines avatars, rings, nicknames, and chip information into seat identity areas.
Active-state glows and timers also appear nearby.
**Prototype recommendation**: transfer only identity and interaction elements while retaining the Mahjong table's scores, winds, and turn information.

### Flows and States

| User Action | CoinPoker Behavior | Evidence |
| --- | --- | --- |
| Open Settings → Avatars | Show the current player preview and grouped choices. | UI observation. |
| Scroll or navigate a category | View other avatars without changing the selection. | UI observation and component structure. |
| Click an available avatar | Update selection and immediately invoke application and settings updates. | `handleAvatarClick` and `onApply`. |
| Click a members-only avatar | Non-members enter the membership prompt branch instead of normal application. | The same click handler. |
| Return to the table | Load the player's avatar by ID, using the default when none is set. | `PlayerAvatarStore.GetAvatar` and `PlayerComponent.SetAvatar`. |
| Click an opponent's table avatar | Open the player profile and HUD. | Official documentation and `HoverOnAvatar.OnPointerClick`. |

Code evidence shows that avatar selections apply immediately, so an additional save step is unnecessary.
The account avatar was not changed during this investigation, so cross-window update latency was not measured.

Clicking an avatar to view a profile is separate from using the throwable button.
**Prototype recommendation**: retain a separate throwable entry point instead of making a click on the entire avatar throw directly.
A full poker HUD, player notes, and skill statistics are outside the required scope of these three features.
See the [CoinPoker HUD documentation](https://coinpoker.com/help/heads-up-display/) for the official entry point description.

### The Role of Rings

The [ring asset catalog](../coinpoker_assets/catalog/rings.json) contains 26 image files.
These include Unity and Electron versions, plus rank, Skill Score, livestream, and membership assets.
This does not mean players can freely select from 26 rings.

**Confirmed in code**: `AICPlayerComponent.ToggleAICStatus` switches between default and membership rings based on membership state.
Player marker colors are handled separately by `PlayerComponent.UpdatePlayerOutline`.
These should remain separate data fields. Rings must not be conflated with arbitrary marker colors.

**Prototype recommendation**: demonstrate state differences with the default and 3-Bet Club rings.
Keep other rank, Skill Score, and livestream rings in the asset library until those demo scenarios are needed.
The full ring priority order in the real API is not yet confirmed.
The API direction in earlier research is a prototype decision, not a verified online API contract.

### Assets and Prototype Boundaries

- [Avatar index](../coinpoker_assets/catalog/avatars.json): 51 images with IDs, categories, dimensions, sources, and hashes.
- [Ring index](../coinpoker_assets/catalog/rings.json): state-specific images and version provenance.
- [UI asset index](prototype_asset_map.json): original membership locks, membership indicators, and interaction entry points.

**Prototype recommendation**: synchronize the local player's preview, player list, and chat avatars after selection.
Store the selected avatar locally and provide standard-user and member test identities.
The membership prompt only needs to explain the lock. A subscription or payment flow is unnecessary.

## Emote Interactions

### Two Distinct Actions

| Type | Entry Point | Target | Presentation |
| --- | --- | --- | --- |
| Standard emote | Emote button at your own seat. | The sender. | Play in the animation container at the sender's seat. |
| Throwable | Button beside an opponent's seat. | A selected other player. | Move from the sender to the target and continue the effect there. |

This distinction is confirmed by `PlayerEmojiButtonComponent`, `EmojiPanelComponent`, and `ThrowablePopupComponent`.
Official documentation also describes them separately. See the [3-Bet Club feature overview](https://coinpoker.com/promotions/3-bet-club/).

### Standard Emote Menu and Flow

**Confirmed in code**: the menu places a vertically scrollable emote grid above a horizontally scrollable row of category icons.
The original `EmojisListCategoryWise` defines category order.

| Category | Asset Count | Original IDs |
| --- | --- | --- |
| Recents | Up to 10 references | Reuses other categories' IDs without adding animations. |
| Dogs | 10 | 56–65. |
| Penguin | 7 | 41–47. |
| Donkey | 5 | 22–26. |
| Chips | 6 | 48–53. |
| Skull | 8 | 1001–1008. |
| Pepe | 5 | 5001–5005, marked as membership-locked in code. |

Complete assets exist for 41 emotes, with 36 listed in the bundled default configuration.
Pepe visibility also depends on a membership feature flag.
Asset availability on disk does not mean every online account can see or use it.

| Action or Event | Client Behavior |
| --- | --- |
| Click your own emote button | Open or close the emote panel. |
| Open the panel for the first time | Select the first category after Recents, which is Dogs in the original order. |
| Click a category | Clear the other category selections and display the selected category's content. |
| Hover over an asset | Scale to 1.0 over approximately 150 ms. |
| Move the pointer away | Scale back to 0.9 over approximately 150 ms. |
| Click an available emote | Send its ID, update Recents, play at your seat, and close the panel. |
| Reuse an emote | Move it to the start of Recents without adding a duplicate. |
| Recents exceeds 10 entries | Remove the oldest entry and update user preferences. |
| Click a members-only emote | Show the lock prompt without entering the normal playback branch. |
| Receive another player's emote event | Play according to the seat and emote ID. Ignore echoed events from yourself. |
| Play again at the same seat | The player first clears the existing animation at that seat. |
| Receive a central table activity event | Close the emote panel. |

The evidence is in `EmojiPanelComponent`, `EmojiPlayableButton`, `Emoji`, and `SkottieAnimationController` in the [client evidence](coinpoker_evidence.json).
No emotes were actually sent while seated during this investigation.

### Throwable Menu and Flow

**Confirmed in code**: the local player must be seated before hovering over an opponent can expose the throwable entry point.
The throwable menu changes orientation according to the target seat and uses an arrow pointing toward that target.

| Action or Condition | Client Behavior |
| --- | --- |
| Hover over an opponent's seat | With hover enabled, wait approximately 250 ms before showing the button. |
| Leave before the delay ends | Cancel the scheduled display. |
| Move away from an opponent's seat | Hide the button in hover mode. |
| Disable Show throwables on hover | Keep opponents' throwable buttons visible while the local player is seated. |
| Click an opponent's throwable button | Remember that player and place the menu appropriately. |
| Click an available throwable | Close the menu, confirm the source and target still exist, then send the event and play locally. |
| Click a members-only throwable | Show the eligibility prompt. |
| The source or target no longer exists | Stop processing without playing at the wrong seat. |
| Disable throwables | Skip playback when receiving events. Settings text also says others cannot throw at you. |
| Receive an echoed event sent by yourself | Ignore it to avoid duplicate local animation. |

A native screenshot of the relevant settings is available: [Throwable settings](../coinpoker_assets/verification/throwable_settings.jpg).
Its text matches the native accessibility data collected during this investigation.

There are 21 throwable animations, with 17 listed in the bundled defaults.
The four additional membership assets are Water Gun, Donkey, Ace Shredder, and Fish, with IDs 4001–4004.
See the [original throwable data](../coinpoker_assets/catalog/unity/throwables.json) for the full order and thumbnails.

### Animation and Sound Parameters

The values below come from the client or assets.
Display dimensions use Unity design coordinates and need adjustment for the Mahjong stage.

| Item | Confirmed Value | Prototype Implication |
| --- | --- | --- |
| Format | Lottie JSON with PNG thumbnails. | Use thumbnails in menus and play the original JSON after selection. |
| Standard emote grid | 60 × 60 cells with spacing of 16. | Preserve the grid and category structure. |
| Category icons | Original size of 45 × 45. | Use category icons and selection highlights. |
| Throwable grid | Five fixed columns, 51 × 51 cells, spacing of 8. | Scroll vertically for additional content. The original displays at most three rows. |
| Throwable timing | The current Skottie path pauses for approximately 300 ms, then moves for 250 ms. | Continue the effect on arrival instead of making it appear suddenly at the opponent's seat. |
| Default playback | Play once and clean up afterward. | Avoid infinite loops. |
| Repeat overrides | Dogs IDs 56, 60, 62, and 65 play twice. IDs 108 and 119 play five times. | Use the mapping for other overrides. |
| Scale overrides | Chips IDs 48–53 use a 1.5 scale factor. | Preserve relative asset sizes. |
| Sound | 14 WAV clips acquired. | Play audio only for animations with a corresponding source. |
| Sound setting | Native Sounds includes Emoji Playing. | Provide an emote sound toggle without recreating all sound settings. |

See the [animation mapping](../coinpoker_assets/catalog/animation_mapping.json) for playback parameters.
See the [prototype asset index](prototype_asset_map.json) for individual durations, thumbnails, and audio paths.
The library's existing Lottie player can be reused. Original JSON files do not depend on the gallery's data wrappers.

### Assets and Prototype Boundaries

The library contains 41 emotes and 21 throwables with their thumbnails.
This investigation added 13 original UI images, including the throwable entry point, category highlight, Recents, and membership indicators.
The index also references eight existing UI images to avoid duplicate storage.

The remaining 42 animations have playback IDs, but no current menu entry points were found.
**Prototype recommendation**: use assets from confirmed categories in the default menus.
Show membership assets in both locked and unlocked test states.
Retain the 42 animations outside the menus without inventing gameplay triggers for them.

Cooldowns, send-rate limits, and the availability of all assets in the live service remain unconfirmed.
These cannot be inferred from asset existence or animation duration.

## In-game Chat

### UI Structure

**Observed in the UI**: the desktop table has a chat entry point at the bottom left.
**Confirmed in code**: clicking it calls `ShowChatPanel` and slides a chat area in from the left.

| Area | Required UI Elements |
| --- | --- |
| Message history | Scrollable area, own and other players' messages, avatars, nicknames, text, and timestamps. |
| Reply content | Original author and quoted text, shown both in the reply message and above the input before sending. |
| Input area | Type here.. placeholder, text input, Send button, and `@` player entry point. |
| Quick phrases | Horizontal phrase row and an expandable phrase panel. |
| Message actions | An action button appears on hover and opens Reply and Copy. |
| Options | Mute spectator chat, Hide chat bubbles, and Mute all chats. |
| Empty state | Start Chatting. |
| Error state | Error-message styling within the history area. |
| Table bubbles | Temporary text bubbles near the speaker's seat. |

The chat scene retains separate components for your own and other players' messages.
**Prototype recommendation**: preserve that distinction, combining original images with the Mahjong table's existing typography.
The original drawer background is approximately 295 design units wide, with an offset from -300 to 0.
These numbers cannot be treated directly as CSS pixels across different screens.

See the [chat scene structure](../coinpoker_assets/chat/scene_structure.json) and [original copy](../coinpoker_assets/chat/english.json).

### Opening and Sending Flow

| Action or Event | Client Behavior |
| --- | --- |
| Open chat | Clear the reply reference and close subpanels for quick phrases, options, and the player list. |
| Slide the drawer in | Take approximately 150 ms. The same opening refreshes the empty state and focuses the input. |
| Open chat or receive a message | Scroll to the latest message after approximately 50 ms. |
| Enter text and click Send | Send data of type TEXT. |
| Press Enter | Call the same send function. |
| Input is empty or whitespace only | Do not send a message. |
| Receive your own message | Add your message component and clear the input. |
| Receive another player's message | Add their message component without clearing your current input. |
| Close the drawer | Take approximately 100 ms, close subpanels, and clear the reply reference. |
| Receive a central table activity event | Close the chat area. |

Evidence comes from `TableMenuController.OnChatBtnClick` and `ChatPanelComponent`.
The client clears input only after receiving your own message. Code confirmation must not be described as a completed online send test.

The input component is `CustomNPInputField`.
Its scene value for `m_CharacterLimit` is 0, with no fixed character limit configured.
Whether the server limits message length remains unknown.

### Quick Phrases and Message Actions

| Feature | Flow and State |
| --- | --- |
| Quick phrases | Send immediately on selection, close the expanded panel, and refocus the input. They do not merely populate a draft. |
| Reply | Hover over message → action button → Reply → show original author and text → enter text → send reply reference data. |
| Cancel reply | Close the reference area, clear reply data, and return to normal input. |
| Copy | Message action menu → Copy → copy that message's text. |
| `@` a player | Open the player list, select a player, set the input to `@PlayerName `, and focus the cursor. |
| End message hover | Hide the action button and Copy/Reply panel. |
| Click outside the options panel | Close the panel. |

`TagToUser` replaces the input text. Insertion at an arbitrary cursor position is not confirmed behavior.
If the prototype preserves the draft and inserts a tag, record that separately as a product adaptation.

The quick-phrase configuration contains eight translation keys.
Only two actual strings are confirmed in the available locale data: `GG 👍` and `Fishy AF 🐠🐡`.
The other six must not be replaced with invented content presented as the native list.
**Prototype recommendation**: show the two sourced phrases first, or explicitly label additions as Mahjong prototype copy.

See the [chat behavior summary](../coinpoker_assets/chat/behavior.json), [quick-phrase configuration](../coinpoker_assets/catalog/chatConfig.json), and [client evidence](coinpoker_evidence.json).

### Settings and Seat Bubbles

| Setting or Event | Confirmed Behavior | Prototype Presentation |
| --- | --- | --- |
| Mute spectator chat | The value is saved and sent to the table. Official documentation describes it as muting spectators. | Verify filtering with simulated messages carrying a spectator identity. |
| Hide chat bubbles | `GameModal.ShowChatMessage` preserves history but skips seat bubbles. | Add new messages to history without displaying table bubbles. |
| Mute all chats | The client skips new messages from others. Messages matching the local account name can still enter history. | Do not implement this as closing the panel or disabling your own input. |
| New chat message | Show a table bubble only when the message meets the `chatBubble` condition and bubbles are not hidden. | Preserve that flag in simulated data. |
| Bubble appears | Adjust by seat position, with a scale animation of approximately 100 ms. | Map positions separately for four-player and three-player tables. |
| Bubble expires | Hide after approximately three seconds. A new bubble resets the seat's hide timer. | Keep only the current bubble at each seat. |

A local receive-filter branch for spectator muting was not found in the methods selected for this investigation.
Official documentation supports the user-facing behavior, but where online filtering occurs remains unknown.
See the [gameplay navigation FAQ](https://coinpoker.com/fr/help/gameplay-navigation-faq/) for the three settings.

The original scene contains an example error for chat being disabled during an all-in state, as well as error-handling code.
This does not establish that the rule was verified on every table type.
**Prototype recommendation**: retain generic error display without applying poker all-in rules to Mahjong.

### Assets and Prototype Boundaries

The [chat asset index](../coinpoker_assets/catalog/chat_assets.json) contains 38 images.
Input fields, bubbles, reply, copy, close, options, arrows, and checkmarks can be reused.
Text, timestamps, and player avatars should be composed from data rather than baked into images.

**Prototype recommendation**: simulate messages from the local player, opponents, and spectators with local data.
Replies, copying, scrolling, and display settings must work.
Servers, cross-device history, moderation systems, actual blocking, and production chat connections are outside this prototype's scope.

## Asset Handoff

All asset paths in the [prototype asset index](prototype_asset_map.json) are relative to the prototype folder containing `mahjong-game-standalone.html`.
The index connects animations, thumbnails, sounds, membership-locked IDs, and the UI images added in this investigation.
Actual account eligibility still requires simulated data. The index does not claim to verify online permissions.

| Asset | Available Count | Usage |
| --- | --- | --- |
| Avatars | 51 | Load images by ID and retain existing categories. |
| Rings and related status images | 26 | Reference by demo state without treating them as 26 freely selectable rings. |
| Emotes | 41 | Original Lottie files, thumbnails, and categories. |
| Throwables | 21 | Original Lottie files, thumbnails, and target seats. |
| Chat images | 38 | Compose drawers, messages, and options. |
| Corresponding sounds | 14 | Find the matching WAV through the animation index. |
| UI images added in this investigation | 13 | Stored in the [UI asset directory](ui_assets/). |
| Animations outside the current menus | 42 | Retain as references and exclude from prototype menus by default. |

Added images were acquired through original scenes and Sprite references, preserving source, object ID, and SHA-256.
Image decoding and asset paths were checked during this investigation.
Existing animation rendering records remain available as references. Full visual verification of all animations was not repeated.

## Minimal Adaptation Plan for the Mahjong Draft

The following recommendations arise from the research and are not completed implementation changes.

### Seats and Layout

The [Mahjong draft](../../mahjong-game-standalone.html) uses a fixed 1440 × 1024 stage that scales proportionally with the window.
Player avatars and scores are grouped on the right in `player-info-0` through `player-info-3`.
The central table does not have avatar seat cards around its perimeter like CoinPoker.

**Recommended approach**: retain the right-hand player information and establish a stable mapping between players and table seats.
Use the displayed table seat positions for emotes, bubbles, and throwable endpoints.
Selecting an opponent should produce consistent feedback in the right-hand player row and at the target position.
This preserves the meaning of an interaction directed at someone instead of moving throwables only up and down the right-hand list.

Three-player tables hide elements with `data-seat="3"`.
Waiting states also hide rows for players who are not seated.
Build interaction targets from currently valid seats instead of assuming four players are always present.

Chat can retain the left-side drawer concept but must avoid hands and controls.
This is a Mahjong layout adaptation. Its final position needs verification in the implemented screen.
Emote animation layers should pass pointer events through, while menus and chat inputs retain interaction.

### Data Required by the Prototype

| Data | Minimum Fields | Purpose |
| --- | --- | --- |
| Player | ID, nickname, seat, avatar ID, ring state, membership state. | Share one identity across all three features. |
| Table | Three or four players, seated players, local seat, screen scale. | Determine valid targets and animation positions. |
| Asset | ID, category, thumbnail, animation, sound, repeat count, scale, lock state. | Drive menus and playback. |
| Emote event | Sender seat, emote ID. | Play local and simulated opponent emotes. |
| Throwable event | Sender, recipient, asset ID. | Track the correct start and endpoint. |
| Chat message | Author, avatar, text, timestamp, spectator flag, reply content, bubble flag. | Support history, replies, and filtering. |
| Preferences | Recents, three chat settings, throwable setting, emote sound. | Preserve state when panels reopen. |

These fields describe prototype data requirements, not CoinPoker's production API contract.
Replayable local events are sufficient for demonstration without live player connections.

### Recommended Acceptance Scenarios

The following scenarios are intended for later prototype acceptance and were not executed during this research phase.

| Scenario | Observable Result |
| --- | --- |
| Select a standard avatar | The selection indicator, preview, local player row, and chat avatar agree. |
| Click a locked avatar | Show the eligibility prompt and preserve the original selection. |
| Toggle simulated membership | Update rings and membership asset availability together. |
| Use 11 different emotes in sequence | Recents retains only the latest 10. |
| Reuse an older emote | Move it to the start of Recents without duplication. |
| Play repeatedly at the same seat | Clear the previous animation and leave no overlay after playback ends. |
| Throw at different players | Start at the local seat and end at the selected opponent. |
| The target leaves | Do not play at an empty seat or another player. |
| Disable hover display mode | Show opponents' throwable entry points directly while seated. |
| Disable throwables | Simulated received throwables do not appear. |
| Disable emote sound | Animations still play without their associated audio. |
| Open and close chat | Maintain correct focus and allow immediate interaction with the original screen after closing. |
| Send whitespace and normal text | Reject whitespace and add normal text to history. |
| Select a quick phrase | Send immediately without waiting for a second action in the input. |
| Reply and cancel a reply | Reference the correct source and prevent canceled references from carrying into the next message. |
| Copy and tag a player | Copy the correct content and tag the selected player. |
| Hide bubbles | Keep history functional without showing table bubbles. |
| Mute all chats | Filter new simulated messages from others while preserving local-message handling. |
| Use a three-player table or waiting state | Hidden or vacant seats cannot be interaction targets. |
| Resize the window | Throwable positions, menus, and chat remain aligned with the stage. |

## Unconfirmed Areas and Their Impact

| Gap | Prototype Impact | Recommended Treatment |
| --- | --- | --- |
| Complete native emote and chat testing while seated | Core behavior has code evidence, but live presentation still needs checking. | Implement confirmed code behavior first and retain native visual comparison items. |
| Account eligibility and remote feature configuration | Bundled defaults may differ from categories visible in the native client. | Use explicit standard-user and member test identities. |
| Complete ring priority order | All combinations of rankings and events cannot be reproduced faithfully. | Initially show default and membership rings, adding other states as needed. |
| Six quick-phrase strings | The complete native list cannot be reconstructed. | Use the two confirmed strings and mark new copy as a prototype adaptation. |
| Rate, length, and server-side chat restrictions | The prototype must not claim to implement production service rules. | Provide generic errors and avoid unsupported hard-coded restrictions. |
| Native mobile touch flows | Alternatives to hover remain unconfirmed. | Start with desktop and identify touch entry points as Mahjong adaptations. |

These gaps do not block an interactive local prototype, but they limit claims of complete parity with online behavior.
Prioritize demonstrable interactions, then refine details using native interaction results.

## Source Entry Points

| Source | Use in This Investigation |
| --- | --- |
| [Client evidence](coinpoker_evidence.json) | Source hashes, 193 methods, 95 scene nodes, avatar application excerpts, and native observations. |
| [Prototype asset index](prototype_asset_map.json) | 62 emote and throwable assets, UI images, and usage paths. |
| [Existing source manifest](../coinpoker_assets/catalog/manifest.json) | CoinPoker and Unity versions, plus original file hashes. |
| [Existing usage research](../coinpoker_assets/catalog/usage_research.json) | Categories, throwable settings, and unconfirmed uses of older assets. |
| [Chat scene](../coinpoker_assets/chat/scene_structure.json) | Message, input, reply, options, and empty-state structure. |
| [Official 3-Bet Club documentation](https://coinpoker.com/promotions/3-bet-club/) | Roles of exclusive avatars, emotes, and throwables. |
| [Official gameplay navigation FAQ](https://coinpoker.com/fr/help/gameplay-navigation-faq/) | Chat options and user entry points. |
| [Official HUD documentation](https://coinpoker.com/help/heads-up-display/) | Existing behavior for opening player profiles from avatars. |

Official website sources were retrieved during this investigation. Direct access to the English FAQ returned 451, so chat options were checked against the official French page.
Official documentation establishes feature meaning. Detailed timing and states refer to the client version examined here.
