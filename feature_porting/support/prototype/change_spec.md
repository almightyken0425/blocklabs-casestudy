# CoinMahjong Prototype Change Specification

This document describes the prototype's functional differences from the original HTML.
It reflects implemented behavior and supports feature review and subsequent changes.

## Comparison Baseline

| Item | Baseline |
| --- | --- |
| Original version | `mahjong-game-standalone.html` in Git commit `1ef5442`. |
| Modified version | The [Mahjong prototype](../../mahjong-game-standalone.html) in this workspace. |
| Behavior source | [CoinPoker behavior research](../research/coinpoker_prototype_research.md). |
| Review date | 2026-10-04. |
| Completion level | An interactive local prototype. Membership and opponent events use simulated data. |

The original version already included the table, hands, discards, player information, and central scoring area.
It also supported table configurations loaded from the URL, three-player tables, waiting screens, and window scaling.
The prototype preserves these capabilities and adds player identity and social interactions.

## Change Overview

| Feature Area | Original Version | Prototype Changes |
| --- | --- | --- |
| Player avatars | Fixed images. | Grouped selection with immediate application and persistence. |
| Player rings | No ring demo configuration. | Random assignment on each load, with no duplicates at the same table. |
| Identity on the table | Players shown in the right-hand list and central scoring area. | Avatars and names added at the corresponding table seats. |
| Tile layout | No consistent left/right arrangement of hands and player identity. | Avatars on the left and hands aligned to the right from each player's perspective. |
| Player profiles | No profile dialog opened from an avatar. | Profiles show your own or an opponent's name, wind, and membership. |
| Standard emotes | No entry point or playback. | Categories, Recents, and seat animations. |
| Targeted throwables | No interaction targeting a player. | Opponent entry points, target feedback, and flight effects. |
| Chat | No chat panel. | Message history, sending, and message actions. |
| Chat bubbles | No message indicators at seats. | Timed bubbles and display settings. |
| Settings | A button on the right without connected settings content. | Entry point moved to the window header, with Avatars and Interactions tabs. |
| Narrow-screen social controls | The entire table scales proportionally. | Fixed-size controls added at the table's bottom right. |
| Demo scenarios | Table type selected through URL parameters. | Demo controls for table type, membership, and opponent events. |
| Automatic-action toggles | Static controls such as Auto-Pass. | Toggle appearance can change, without game-rule processing. |

## A. Player Identity, Avatars, and Rings

### Entry Points and Screens

- Click the Settings gear at the top right of the window header to open the Avatars tab.
- On desktop, the entry point sits beside the minimize and close buttons. On narrow screens, it stays at the table's top right.
- Click Profile in the player list to open that player's profile dialog. The button sits to the left of the East, South, West, or North wind icon, which remains visible.
- The right-hand player rows, table seats, and central scoring area use the same avatar data.
- Your name on the table includes a You label.

At all four seats, avatars sit to the left of the tile area and hands align to the right from the player's perspective.
The East avatar at the bottom of the screen is left of the hand. The West avatar at the top is to its right.
The South avatar on the right side of the screen is below the hand. The North avatar on the left is above it.
See the [tile layout decision](../../decision_log.md#decision-2-place-avatars-on-the-left-and-align-hands-to-the-right) for the rationale.

Avatar settings provide a large preview, category rows, and a current-selection indicator.
Category rows scroll horizontally, and settings content scrolls vertically.
3-BET CLUB and WORLD CUP also have left and right navigation buttons.

| Avatar Category | Count | Availability |
| --- | --- | --- |
| 3-BET CLUB | 16 | Demo membership enabled. |
| WORLD CUP | 10 | Available to standard users. |
| ANIMAL | 5 | Available to standard users. |
| ANIME | 5 | Available to standard users. |
| HALLOWEEN | 5 | Available to standard users. |
| NOBLE | 5 | Available to standard users. |
| ROYAL | 5 | Available to standard users. |

### Interaction Rules

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| A01 | Click an available avatar. | Update the selection indicator and preview immediately, with no additional save step. |
| A02 | Complete an avatar selection. | Synchronize your player row, table seat, small central avatar, and chat avatar. |
| A03 | Click a members-only avatar as a standard user. | Show the eligibility prompt and preserve the current selection. |
| A04 | Close and reopen settings. | Show the currently applied avatar. |
| A05 | Reload the page. | Restore the locally saved avatar selection. |
| A06 | Enable membership in the demo controls. | Update your membership badge and asset availability while preserving the demo ring. |
| A07 | Disable membership in the demo controls. | Return to standard eligibility while preserving the demo ring. |
| A08 | Disable membership while using an exclusive avatar. | Switch to the standard default avatar. This is the prototype's chosen behavior. |
| A09 | Click your own or an opponent's Profile button in the player list. | Open Profile with a centered title. Show the avatar, ring, name, wind, and membership badge. |
| A10 | Load the table. | Randomly assign rings from five options without repeating one at the same table. |
| A11 | Change avatars or use social features. | Keep the current ring assignments consistent. |
| A12 | Refresh the table. | Reassign rings randomly without retaining the previous assignments. |
| A13 | View all four seats. | Show the avatar on the left and hand on the right from each player's perspective, without overlap. |

The demo pool contains five existing assets: Silver, Gold, 3-Bet, Live, and AIC.
Table seats, player rows, Profile, chat, and settings previews share each player's ring assignment.
Random assignment is for visual comparison only and does not represent actual membership or achievement eligibility.
Production rings remain tied to player state, within the boundaries established by the research.
There is no menu for freely selecting rings.
The simplified profiles do not include poker skill statistics or player notes.

Screen reference: [Avatar settings](../verification/social_avatars.png).

## B. Standard Emotes and Targeted Throwables

### Standard Emotes

Table seats and the player list share the same avatar interactions.
Hovering over your own avatar opens Emotes directly after approximately 180 ms.
The separate Emotes and Throwables buttons are removed. Clicking an avatar also opens its corresponding menu.
The menu places the emote grid above the category icons.
Dogs is selected on the first opening. The page session retains the last viewed category.

| Category | Count | Availability |
| --- | --- | --- |
| Recents | Up to 10 entries | References recently used emotes. |
| Dogs | 10 | Available to standard users. |
| Penguin | 7 | Available to standard users. |
| Donkey | 5 | Available to standard users. |
| Chips | 6 | Available to standard users. |
| Skull | 8 | Available to standard users. |
| Pepe | 5 | Demo membership enabled. |

There are 41 standard emotes, using original animations and thumbnails.
Recents reuses these assets without adding separate emotes.

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| B01 | Hover over your own avatar in either area. | Open the Emotes menu. |
| B02 | Click a category icon. | Switch the grid content and category highlight. |
| B03 | Hover over an emote. | Enlarge its thumbnail, then shrink it when the pointer leaves. |
| B04 | Click an available emote. | Play it at your seat and close the menu. |
| B05 | Use an emote. | Move it to the start of Recents. |
| B06 | Reuse an emote. | Keep Recents free of duplicates. |
| B07 | Use more than 10 distinct recent emotes. | Remove the oldest entry. |
| B08 | Open Recents before using any emotes. | Show the empty Recents state. |
| B09 | Click a Pepe emote as a standard user. | Show the membership prompt without playing the animation. |
| B10 | Play another standard emote at the same seat. | Clear the previous standard emote before playing the new one. |

### Targeted Throwables

Hovering over an opponent's avatar at a table seat or in the player list opens Throwables directly.
Profile opens through a separate button in the player list.
The menu title shows the target's name, and both the table seat and player row are highlighted.

There are 21 throwables, including four members-only assets.
The menu uses a five-column grid. Content beyond three rows can be scrolled.

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| B11 | Hover over an opponent's avatar in either area. | Open that player's Throwables menu after approximately 180 ms. |
| B12 | Move the pointer away during the delay. | Cancel the scheduled opening. |
| B13 | Leave the avatar and a menu that has not been clicked. | Close after approximately 300 ms. Moving into the menu cancels the scheduled close. |
| B14 | Click the avatar or a menu control after hover has opened the menu. | Keep it open until an asset is selected, it is closed, or the user clicks outside it. |
| B15 | Use touch or a keyboard. | Tap the avatar, or focus it and press Enter, Space, or Arrow Down to open the menu. |
| B16 | Hover over another player's avatar. | Switch the menu content and target player. |
| B17 | Click an available throwable. | Close the menu and move the effect from your seat to the target. |
| B18 | Play a throwable. | Pause for approximately 300 ms, travel for 250 ms, and continue the effect on arrival. |
| B19 | Click a locked throwable. | Show the eligibility prompt without playing the effect. |
| B20 | The source or target is not seated. | Do not play an effect at an empty seat. |
| B21 | Receive a simulated player-departure event. | Clear current effects and remove that player as an interaction target. |
| B22 | Disable Enable throwables. | Stop current throwables and reject new local sends and received effects. |

Show throwables on hover previously controlled separate button visibility and was removed with those buttons.
Avatar menu hover behavior is always enabled. Throwable effects still follow Enable throwables.

There is currently no demo button for making a player leave.
B21 is verified through the local event interface and does not indicate a live player connection.

### Shared Playback and Closing Rules

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| B23 | An animation ends. | Clear the effect without looping indefinitely. Specified assets repeat according to the mapping. |
| B24 | An asset has a sound and sounds are enabled. | Play its corresponding audio. |
| B25 | Disable Emoji Playing. | Stop current audio and play subsequent animations silently. |
| B26 | The system prefers reduced motion. | Use static thumbnails without flight or animation playback. |
| B27 | An animation fails to load. | Show a thumbnail and a notice. Selecting it again retries loading. |
| B28 | Click outside the menu, click Close, or press Escape. | Close the menu and clear target highlighting. |
| B29 | Open chat. | Close the emote or throwable menu. |
| B30 | Open an emote or throwable menu. | Close the chat drawer. |

Animation positions follow table scaling.
The animation layer does not intercept pointer events.
Each seat maintains at most one standard emote and one throwable effect.

Screen references: [Own avatar menu](../verification/avatar_hover_emotes.png) and [opponent avatar menu](../verification/avatar_hover_throwables.png).

## C. In-game Chat

### Entry Point and Message History

A Chat button at the table's bottom left opens a left-side drawer within the table.
On desktop, the drawer avoids the bottom hand and temporarily covers part of the table's left side.
The button and panel follow the scaled table boundaries. Surrounding blank margins are outside the interaction area.
The panel contains the table name, message history, quick phrases, an input field, and display options.

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| C01 | Open chat. | Expand the drawer, focus the input, and scroll to the latest message. |
| C02 | Open chat for the first time with no messages. | Show the Start Chatting empty state. |
| C03 | View messages. | Show author, avatar, text, and time. Your messages and other players' messages use different layouts. |
| C04 | Messages exceed the visible area. | Allow scrolling through history. |
| C05 | Receive a new message while the panel is open. | Add it to history and scroll to the latest message. |
| C06 | Receive an unmuted message from another player while the panel is closed. | Increment the unread count on Chat, displaying 9+ above nine messages. |
| C07 | Reopen chat. | Clear the unread count. |
| C08 | Click Close, click Chat, or press Escape. | Close chat and retain the current session's history. |
| C09 | Click the central table area. | Close the chat drawer. |

The drawer opens in approximately 150 ms and closes in approximately 100 ms.
Reopening or closing it clears the reply reference and closes submenus.

### Input and Sending

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| C10 | Enter text and click Send. | Add the message to the local conversation. |
| C11 | Enter text and press Enter. | Run the same send flow. |
| C12 | The input is empty or contains only whitespace. | Do not send a message. |
| C13 | A send is still being processed. | Temporarily prevent another send to avoid duplicates. |
| C14 | Sending succeeds. | Clear that draft and its reply reference. |
| C15 | Different text is entered while a send is processing. | Preserve the new draft. |
| C16 | Simulate a send failure. | Show an error and preserve the draft for retry. |
| C17 | Enter text containing HTML-like markup. | Display it as plain text without executing it. |

No fixed character limit is currently configured.
A successful send indicates completion of the local flow, with no server delivery status.

### Message Actions

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| C18 | Click GG 👍. | Send the phrase immediately. |
| C19 | Click Fishy AF 🐠🐡. | Send the phrase immediately. |
| C20 | Click the quick-phrase icon. | Open a menu with the same phrases. |
| C21 | Hover over a message or focus it with the keyboard. | Show the message action entry point. |
| C22 | Click the message action entry point. | Show Reply and Copy. |
| C23 | Click Reply. | Show the original author and quoted text above the input. |
| C24 | Send while replying. | Include the quoted content in the new message. |
| C25 | Cancel the reply. | Clear the reference and return to normal input. |
| C26 | Click Copy. | Copy the message text to the clipboard and show confirmation. |
| C27 | The browser does not allow copying. | Show a failure notice so the user can select the text manually. |
| C28 | Click @. | List the other players currently seated. |
| C29 | Select a player to tag. | Replace the input with `@PlayerName ` and move the cursor to the end. |

Only the two confirmed original quick phrases are included.
@ is a text tag and is not connected to a notification system.

### Seat Bubbles and Chat Settings

| ID | Action or Condition | Observable Result |
| --- | --- | --- |
| C30 | Receive a player message eligible for a bubble. | Show a text bubble beside that player's seat. |
| C31 | A bubble has been visible for approximately three seconds. | Hide it automatically. |
| C32 | Receive a new bubble at the same seat. | Replace the previous content and restart the timer. |
| C33 | Bubble text exceeds the container. | Clip the overflow. The full text remains available in chat history. |
| C34 | Enable Hide chat bubbles. | Remove current bubbles and retain only message history for subsequent messages. |
| C35 | Enable Mute spectator chat. | Skip subsequent spectator messages. |
| C36 | Enable Mute all chats. | Skip subsequent messages from others while retaining your own messages. |

Mute settings preserve existing history.
Spectator messages carry a Spectator label and do not display seat bubbles.

Screen reference: [Chat drawer](../verification/social_chat.png).

## D. Shared Settings, Persistence, and Input Adaptations

### First-use Defaults

The following defaults apply to browsers without locally saved data.
Existing saved selections take precedence.

| Item | Default State | Entry Point |
| --- | --- | --- |
| Your avatar | Default avatar in the ANIMAL category. | Avatars. |
| Your membership | Standard user. | Demo controls. |
| Demo player rings | Random assignment from five assets without duplicates at the same table. | Assigned automatically on load. |
| Enable throwables | On. | Interactions. |
| Emoji Playing | On. | Interactions. |
| Mute spectator chat | Off. | Chat options. |
| Hide chat bubbles | Off. | Chat options. |
| Mute all chats | Off. | Chat options. |
| Recents | Empty list. | Emote menu. |
| Chat history | Empty list. | Chat. |

### Persistence Scope

| Data | After Reload |
| --- | --- |
| Your avatar | Preserved. |
| Demo membership | Preserved. |
| Demo player rings | Not preserved. Reassigned on every load. |
| Recent emotes | Preserved, up to 10 entries. |
| Throwable and sound settings | Preserved. |
| Three chat settings | Preserved. |
| Chat history and unread count | Cleared. |
| Unsent draft and reply reference | Cleared. |
| Auto-Pass and Auto-Ron / Tsumo | Return to their initial toggle appearance. |

Data is stored only in the current browser, with no cross-device synchronization.
Interactions remain available for the current session if local storage is unavailable.

### Shared Interaction Rules

- Only valid seats appear as interaction targets.
- Three-player tables do not create an interaction entry point for a fourth seat.
- Waiting states retain social interactions for seated players.
- Settings tabs and emote categories support left and right arrow keys.
- Dialogs support Close and Escape.
- Icon buttons have accessible names and visible keyboard focus outlines.
- Main social entry points are disabled until social assets load.
- Failed asset loading shows a notice. Reloading the page retries it.

### Narrow Screens and Short Windows

The narrow-screen layout applies when the viewport is no wider than 760 px or no taller than 560 px.
Settings stays at the table's top right.
Chat, player, and demo entry points are arranged in two columns at the bottom right.
After opening Players, select your own avatar for Emotes or an opponent's avatar for Throwables.
Profile buttons and wind icons remain separate in the list.

Settings, emote menus, and chat panels are constrained to the table's available dimensions.
On narrow screens, open chat covers the table. History remains scrollable, and closing chat returns to the table.
The table itself retains its original proportional scaling.
Mobile retains the desktop arrangement and scaling without a separate hand interaction design.

Screen reference: [Current mobile player list](../verification/avatar_hover_mobile_players.png).

## E. Prototype Demo Controls

Prototype → Demo controls is added on the right side of the desktop layout.
On narrow screens, open it using the ellipsis at the table's bottom right.
These controls are only for demonstrating and verifying the prototype.

| Control | Result |
| --- | --- |
| 4 players | Load the original four-player scenario. |
| 3 players | Load the original three-player scenario. |
| Waiting | Load the original waiting-for-players scenario. |
| 3-Bet Club membership | Toggle your simulated eligibility and asset permissions while preserving the demo ring. |
| Incoming chat | Generate a simulated opponent message. |
| Emote | Play an emote at a simulated opponent's seat. |
| Throw | Simulate an opponent throwing at your seat. |
| Spectator | Generate a simulated spectator message. |
| Chat history | Generate 24 demo messages and open the scrollable conversation. |
| Clear chat | Clear history, unread count, reply references, and current bubbles. |
| Send error | Make the next send show an error, then allow another send to verify retry. |

Demo messages respect current mute settings. The number added to history depends on those settings.
Chat history contains simulated conversation, not original quick phrases.
Switching table type reloads the page and therefore clears chat history.

## F. Changes to Existing Controls

Auto-Pass and Auto-Ron / Tsumo already had visual controls.
They can now toggle their selected appearance.
This provides visual feedback only, without automatic passing or winning-hand logic.

The following remain from the original version.

- Table background, tile assets, discard areas, and central scoring area.
- Loading of table names, amounts, and rules.
- Seat count and starting scores for three-player tables.
- Waiting-for-players screen.
- Existing leave-table action.
- The 1440 × 1024 stage and proportional scaling.

## G. Delivery and Scope

The original HTML contains the tiles and existing scripts.
The prototype adds external styles, interaction code, an animation player, and asset data.
Preserve the `prototype`, `research`, and `coinpoker_assets` directory structure under `support/` when running it.
The prototype currently uses HTTP preview and is not packaged as a single portable HTML file.

See the [prototype guide](README.md) for launch instructions.
The [four-player preview](http://127.0.0.1:8767/feature_porting/mahjong-game-standalone.html) supports all three interactive features.

The scope excludes live player connections, production membership services, and payments.
It also excludes gameplay progression, server-side chat rules, and cross-device history.
Unconfirmed CoinPoker online restrictions remain gaps documented in the research.

## Verification Evidence

All [15 browser test groups](../verification/folder_split_results.json) passed after separating the question folders.
The source hashes in that record match the current code.
Existing screenshots and verification records retain their original contents. Their source paths refer to the layout before the move.
Verification covers avatar menus in both areas, wind preservation, Profile entry points, keyboard, touch, and hover cancellation.
Existing header entry points, immediate avatar application, membership locks, and player profiles also passed.
Top entry points and settings dialog bounds were checked at 390 × 844.
See the [entry point verification record](../verification/avatar_header_review.json) for visual checks in the in-app browser.

Randomized ring checks cover loading all five assets and consistency across seats, player rows, Profile, chat, and settings previews.
See the [ring verification record](../verification/rings_review.json) and [desktop screenshot](../verification/rings_desktop.png).
The current tile layout has been checked for relative positions at all four seats, no overlap between avatars and four discard rows, three-player tables, and mobile screens.
See the [layout verification record](../verification/seat_layout_review.json) and [current desktop screenshot](../verification/seat_layout_desktop.png).
See the [table boundary record](../verification/table_bounds_review.json) for verification that controls follow the table bounds.

The following table summarizes test coverage.

| Area | Covered Behavior |
| --- | --- |
| Avatars | Immediate application, locks, persistence, and membership changes. |
| Emotes | Deduplication, ordering, and the 10-entry limit in Recents. |
| Throwables | Target seats, hover delays, empty seats, player departure, and disabling. |
| Chat | Blank-message prevention, replies, copying, tagging, muting, and retry after failure. |
| Playback fallback | Reduced motion and animation loading failures. |
| Sound | Corresponding file loading and request behavior after muting. |
| Layout | Desktop, three-player tables, waiting states, and controls at 390 × 844. |

Tests cover these main flows. Not every specification row has a separate test case.
Audio has not been checked through physical speakers.
A complete comparison between the table and CoinPoker's native services has not been performed.
