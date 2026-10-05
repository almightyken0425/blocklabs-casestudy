# Question 3 Interaction Prototype

The [Mahjong prototype](../../mahjong-game-standalone.html) implements the first five steps of the [Question 3 plan](../../plan.md).
Four stable seats, typing to open chat, and keyboard routing are implemented.
Momo emerges from the circle to perform three full-body expressions. The climb-and-return demonstration also takes place outside the frame.
Water gun and Banana now perform the full journey to any opponent. Six editable quick messages support bound expressions or text-only sending.
Inherited avatars, effects, and chat remain interactive.
Gameplay remains the original static screen, and social events use local data.

The [inherited change specification](change_spec.md) describes the historical baseline. Use this guide and the plan for current Question 3 behavior.

## Launch and Controls

Start an HTTP server from the repository root.
Use HTTP to preview the prototype because it loads original animation JSON files.

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

Open the [four-player table](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).
The [waiting state](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html?table=japanese-east-b1) retains four seat numbers. Old three-player URLs fall back to Japanese Full.
Preserve the `prototype`, `research`, and `coinpoker_assets` directory structure under `support/`.

| Action | Result |
| --- | --- |
| Click the Settings gear in the window header | Open Avatars settings. |
| Click the Profile button to the left of a wind icon in the player list | Open that player's profile dialog. |
| Select Momo in Settings → Avatars | Use the original animated fox. New sessions select it by default. |
| Choose Happy, Sad, or Angry in your avatar menu | Emerge from the frame, perform the full-body expression outside it, and return. |
| Expand Movement preview and choose Climb out, Return to frame, or Reset | Show the same character outside its frame, bring it back, or immediately restore idle. |
| Click an available avatar | Immediately update the preview, player row, seat, and chat avatar. |
| Click a locked asset | Show the 3-Bet Club eligibility prompt. |
| Hover over your own avatar at a table seat or in the player list | Open three Momo expression cards. Static avatars show the inherited categories and Recents. |
| Hover over an opponent's avatar in either area | Open that player's Throwables menu. With Momo selected, Water gun and Banana send the character on a visit to that opponent. |
| Click an avatar or focus it and press Enter | Open the corresponding menu, with touch and keyboard support. |
| Click Chat inside the table | Open the chat drawer within the table. |
| Start typing from the table | Open chat and preserve the first character, including Shift uppercase. |
| Enter chat text and press Enter | Send a local message. Blank input and composing Enter are not sent. |
| Press Escape in chat outside composition | Close chat and preserve the draft. |
| Click Quick beside Chat, or use a chat-footer slot | Send the configured message and its bound expression; wait together if the character is busy. |
| Open Settings → Quick messages | Edit six messages and their bindings, or preview on the table without sending. |
| Click a message's action button | Show Reply and Copy. |
| Click @ in the input area | Select a player and overwrite the input, matching native behavior. |
| Click the options control at the top right of chat | Configure spectator muting, bubble visibility, and muting all chats. |
| Open Settings → Interactions | Configure throwables and emote sounds. |

Chat and other social interfaces are positioned relative to the table boundaries. The surrounding blank margins are outside the interaction area.
On desktop, Chat and Quick are in the table's bottom-left corner.
On narrow screens, Settings is in the table's top-right corner.
Chat, Quick, player, and demo controls are arranged in the bottom-right corner.
On narrow screens, open Players and select your own or an opponent's avatar to open the corresponding menu.
Avatar entry points replace the separate Emotes and Throwables buttons beside avatars.
The original table still scales proportionally. The mobile Mahjong table has not been redesigned.

At all four seats, avatars sit to the left of the tile area and hands align to the right from each player's perspective facing the table.
The South avatar is at the lower right of the screen, the North avatar is at the upper left, and East and West avatars sit beside their hands.
This reserves space on the right for primary actions and keeps avatars clear of growing discard areas.
See the [tile layout decision](../../../questions_1_2/decision_log.md#decision-2-place-avatars-on-the-left-and-align-hands-to-the-right) for the rationale.

Player rings use a randomized demo configuration.
On each load, rings are assigned from five assets: Silver, Gold, 3-Bet, Live, and AIC. No ring is repeated at the same table.
Assignments remain stable during the session. Changing avatars or membership does not reshuffle them.
Table seats, player rows, Profile, chat, and settings previews use the same ring for each player.
Refresh to compare other combinations. Demo rings do not represent actual membership or achievement eligibility.

### Keyboard Routing

| Input | Current result |
| --- | --- |
| Shift + 1, 2, 3 | Play Happy, Sad, or Angry with Momo selected. |
| Alt + 1–6 | Send the configured quick message, with an expression only when one is bound, without opening chat. |
| Hold Ctrl, press 2, 3, or 4 | Highlight the right, opposite, or left opponent and show their name. |
| Keep Ctrl held and press Q or W | Start Water gun with Q or Banana with W toward the selected opponent. |
| Release the target modifier, press Escape, or leave the window | Cancel the selected target. |
| Select seat 1 or an empty seat | Reject the target and explain why. |

On Mac, Alt means Option and Ctrl means Control. Use Shift for emotes. Command is not a targeting modifier.

Seat 1 is always the local player. Seats do not change numbers after a departure.
Settings → Interactions → Throwable target keys offers Alt + Shift as an alternative to Ctrl.
Hold both alternative modifiers across the seat-and-letter sequence.
The choice persists in Question 3's own browser storage.

Social shortcuts are ignored inside chat, settings fields, dialogs, and IME composition.
Held shortcut keys do not repeat actions. Ordinary text keeps its native editing behavior.
On desktop, the same native input remains available while chat is closed so composition can start before the drawer opens.
Touch users can use the Chat button without automatically opening the software keyboard on page load.

The own-avatar menu shows Happy, Sad, and Angry as full-body previews above a small frame, with shortcut labels.
Movement preview is a separate disclosure below those choices. Opponent menus show Water gun and Banana with Q and W labels.
The Quick menu and chat footer show the same six configured slots.
Mouse and keyboard emotes, throwables, and quick messages share the same playback queue.
The `cms:action-request` event reports `started`, `queued`, `busy`, or `unavailable`. A started request is not a completion acknowledgement.
A quick-message request reports `started`, `queued`, or `busy`; only a successful local send adds its message and plays its binding.

Browser composition tests pass, including a candidate-confirmation Enter and a compositionend-before-keydown sequence.
Physical Chinese IME candidate selection remains unverified. The native tool produced phonetic characters without opening a candidate window.
See the [verification record](../verification/input_scope_review.md) before claiming full IME acceptance.

### Quick Messages

| Slot | Default text | Default binding | Shortcut |
| --- | --- | --- | --- |
| 1 | GG! | Happy | Alt + 1 |
| 2 | Ouch... | Sad | Alt + 2 |
| 3 | So close! | Angry | Alt + 3 |
| 4 | Good luck, everyone! | None | Alt + 4 |
| 5 | One moment, please. | None | Alt + 5 |
| 6 | Last hand for me. | None | Alt + 6 |

Click Quick while chat is closed, use a chat-footer slot, or press its shortcut.
All three entry points use the same saved text and binding. The inherited two fixed phrases are replaced by these six slots. The chat footer arranges them in two rows of three.
Existing saved choices in slots 1–3 are preserved when the three new text-only defaults are added.
Settings → Quick messages allows Happy, Sad, Angry, or None for each binding.
Nonblank edits save automatically on this device, up to 120 characters. Blank input shows validation and keeps the last saved value.
Preview on table closes Settings and displays the bubble and expression without sending or adding history.

A message waits with its bound emote when the character is busy. Only one action may wait.
After a successful local send, history, a readable bubble beside the character, and the expression appear together.
The bubble respects Hide chat bubbles. A static avatar or unavailable artwork sends text without the animated binding.
Failed sends add no history or expression. Retry uses the failed message and binding, even with chat closed.
Quick sending preserves unfinished typed text and its reply target; it does not attach that reply to the quick message.
Opening a dialog, losing focus, resizing, or other character cancellation clears pending quick messages before they send.
The six slots persist only in `coinmahjong.question3.social.v1`, isolated from Questions 1 and 2.

### Character Playback

The [Momo artwork](assets/momo.svg) is original Question 3 vector artwork with separate face, head, body, arms, legs, and tail.
It is not a CoinPoker asset. The same rig supplies the idle portrait, Happy, Sad, Angry, and full-body demonstration.
Selecting an inherited static avatar disables character playback until Momo is selected again.

Expressions include a happy bounce and raised hands, a sad head tilt and falling tear, and angry shaking and stomping with raised fists.
The whole character emerges before performing. The circle does not crop the head, hands, body, or expression effects.
Emotes last about 2.3 seconds including emergence and return to the idle portrait.
Climb out reaches for the rim, grips it with connected arms, pulls the body up, and brings the legs over.
The full-body pose stands at the lower edge before returning. The standalone movement preview lasts about 3.3 seconds.
The frame retains its original size and position at every phase. Only the body grows into the readable performance pose.
The baseline table remains proportionally scaled. The larger body uses some space around the seat.
The transparent animation layer does not intercept clicks.

Water gun and Banana use that same rig. Momo climbs out, walks completely below the game window, then enters from the selected opponent's side.
Seat 2 uses the right edge, seat 3 the top, and seat 4 the left. The actor approaches the target before using its prop.
Q sprays water from a held gun. W tosses a banana. Both show an impact and a brief target shake.
Momo then walks off that side, re-enters below its own seat, and returns to the portrait. The full sequence takes about 5.6 seconds.
The source frame and player name remain fixed while the character is away. No diagonal flight across the table replaces the journey.
The menu thumbnails come from the inherited Water-Gun and Banana assets. Props, impacts, and choreography are original demonstration work.
These new character actions are silent. The sound preference continues to control mapped audio in the inherited effect library.

One action may wait behind the current action. A third request shows a busy notice.
Return to frame clears that queue and starts returning immediately. Reset restores idle without animation.
Resize, focus loss, page hiding, opening settings or a profile, changing an avatar, player departure, and disabling throwables also restore idle.
Reduced motion shows a still full-body emote for about 0.9 seconds. For throwables, it shows the actor with its prop and an impact beside the target for one second. It skips travel, climbing, and shaking.
Artwork failure or a four-second load timeout retains a static avatar and usable chat. Reload to retry loading, then select Momo if needed.

### Demo Controls

Expand Demo controls under Prototype on the right.
On narrow screens, use the ellipsis control at the table's bottom right.

- 4 players and Waiting · 4 seats: switch between a full table and a four-seat waiting scenario.
- 3-Bet Club membership: simulate membership eligibility and asset permissions.
- Incoming chat, Emote, Throw: simulate inherited opponent events. The Throw demo retains the legacy effect because only the local player has the Momo rig.
- Spectator: simulate a spectator message.
- Chat history: create a scrollable demo conversation.
- Clear chat: clear the local conversation.
- Send error: make the next send fail to verify draft preservation and retry.

Avatars, demo membership, Recents, preferences, and quick-message configuration persist in the local browser.
Message history lasts only for the current page session.
Demo conversations are not CoinPoker's original quick phrases.

## Adaptation Decisions

The [Question 3 decision log](../../decision_log.md) explains the avatar-led social concept and its future extensions.
The following describes inherited behavior retained for comparison.

Behavior is based on the [CoinPoker research](../research/coinpoker_prototype_research.md).
Original assets are referenced through the [asset index](../research/prototype_asset_map.json).
The asset gallery's animation wrappers are not used.

| Decision | Rationale and Tradeoffs |
| --- | --- |
| Preserve the Mahjong table and player information on the right | Retain existing score, wind, and turn information. |
| Add compact player identifiers on the table | Give emotes, bubbles, and throwables clear seat locations. Reject the alternative of moving effects only within the right-hand list. |
| Assign demo rings randomly | Compare existing rings on the Mahjong table as requested by the user. Production eligibility remains tied to player state. |
| Open avatar settings from the window header | Follow the CoinPoker settings entry point confirmed by the user. Player profiles open from the list's Profile buttons. |
| Open social menus directly from avatars | Remove separate emote and throwable buttons as requested. Move Profile to the left of the list's wind icon, retaining the wind's informational role. |
| Apply avatars immediately | Follow CoinPoker behavior without adding a save step. |
| Show membership assets and locked states | Demonstrate permission differences using a local eligibility toggle, without a subscription flow. |
| Revert to a standard avatar when demo membership expires | Prevent an exclusive avatar from remaining selected after eligibility is lost. This is a prototype decision, not a confirmed server rule. |
| Keep the chat drawer clear of the bottom hand | Retain the left-side entry point. The open drawer temporarily covers part of the table's left side. |
| Place narrow-screen controls at the table's bottom right | Keep controls large enough to tap and inside the table. This is a Mahjong adaptation. |
| Use replayable local events | Verify the three interactions without connecting real players. |
| Use static thumbnails for reduced motion | Preserve the expression while stopping flight and animation playback. |
| Show a thumbnail when an animation fails to load | Preserve feedback and report the playback failure. Selecting it again retries loading. |

Inherited static-avatar throwables pause for approximately 300 ms, then travel for 250 ms.
Emotes use the playback counts and sizes in the asset mapping.
Playing another effect of the same type at the same seat clears the previous effect.

Chat provides scrollable history, replies, copying, and seat bubbles.
Bubbles close after approximately three seconds. A new message at the same seat resets the timer.
Mute settings affect future incoming messages and preserve existing history.

Enable throwables stops both local sending and received effects in the prototype.
This scope follows the intended meaning of disabling throwables.
The research fully confirmed only the receive branch and the native settings text.

## Implementation and Verification

The [input router](input.js) owns keyboard routing and composition guards. The [interaction code](social.js) owns player identity, preferences, chat, and action requests.
The [character player](character.js) owns the original SVG rig, animation queue, and recovery. Its [styles](character.css) keep the animation layer separate from hit targets.
The [interface styles](social.css) retain the original table's dark panels and orange accent color.
The HTML retains the existing tiles, loads the interaction modules, and restricts table selection to four-player rulesets.

The [browser tests](../tests/social_prototype.cjs) use Playwright and local Chrome.
The environment must provide the `playwright` package and run the server described above.

```sh
node question_3/support/tests/social_prototype.cjs
```

Use `PROTOTYPE_URL` to specify another preview URL.
Use `RESULT_PATH` to specify a JSON results file.
Use `TEST_FILTER` to run only cases whose names contain the supplied text.

Tests cover immediate application, membership locks, Recents, targeted throws, and cleanup when a player leaves.
Chat coverage includes blank-message prevention, replies, copying, tagging, muting, and retry after failure.
Layout verification includes four-seat waiting states and controls at 390 × 844. Old three-player URLs are checked for a four-player fallback.
Thumbnail fallbacks, sound loading, and disable settings are also checked.

The [final full browser run](../verification/question3_final_results.json) passed all 39 groups on the completed implementation candidate. Its source hashes match the runtime files.
The [six-slot run](../verification/quick_messages_six_results.json) passed all nine quick-message groups, including preservation of saved choices, Alt + 4–6 text-only sends, held-key protection, editable slot 6, and narrow menu and footer access.
The [input regression](../verification/quick_messages_six_input.json) and [targeting regression](../verification/quick_messages_six_targeting.json) passed on the same candidate.
The [six-slot menu](../verification/quick_messages_six_menu.jpg) shows the appended text-only choices and shortcut labels.
The earlier [36-group run](../verification/quick_messages_results.json), [seven-group follow-up](../verification/quick_messages_final.json), and [quick-message review](../verification/quick_messages_review.md) describe the preceding three-slot version.
Earlier [journey results](../verification/character_journey_results.json), their [navigation retry](../verification/character_journey_input_retry.json), and [Q/W checks](../verification/throwable_keys_results.json) remain historical evidence.
Character coverage includes original frame geometry, lower-edge emotes, both throwable journeys toward all three opponent positions, reduced motion, return, queue bounds, interruption, and failed artwork loading.
Inherited effect tests explicitly select a static avatar before testing the legacy library.
The [journey review](../verification/character_journey_review.md) records desktop and narrow visual checks.
The earlier [character review](../verification/character_review.md) and its results remain historical evidence.
The [Step 1 results](../verification/input_scope_results.json) preserve 20 test groups on the earlier input candidate.
The [verification review](../verification/input_scope_review.md) records native shortcuts, visual checks, and limits.
The [native input check page](../tests/native_input_check.html) records events from an embedded local prototype for manual checks.
It does not synthesize keys or provide an IME implementation.

The earlier [folder split results](../verification/folder_split_results.json), screenshots, and other review records remain historical evidence.
Their source hashes and three-player coverage describe the inherited baseline, not the current candidate.

## Known Scope

Steps 1–5 are implemented. The final Question 3 proposal and physical Chinese IME candidate confirmation remain outstanding. The prototype is not connected to production chat or player services.
Online membership permissions, server limits, and the complete ring priority order remain research gaps.
Poker HUD, payments, the 42 animations outside the menus, and real gameplay logic are not included.

Local behavior has been verified for the three interactions. This does not establish a complete comparison with CoinPoker's online services.
