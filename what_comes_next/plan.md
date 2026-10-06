# Question 3: Avatar-Driven Social Interactions

## Status and Scope

This plan records the agreed direction for the independent Question 3 prototype.
It includes the user's revisions: three emote-bound quick messages followed by three text-only messages, typing to open chat, and four-player tables only.
Both emotes and throwables must extend outside the circular avatar frame. This replaces the earlier in-frame emote direction.
Steps 1–5 are implemented.
The [final browser regression](support/verification/question3_final_results.json) passed all 39 groups. Native Chrome shortcuts were exercised separately.
Physical Chinese IME candidate selection still needs manual verification because the native tool emitted phonetic characters without a composition session.
Step 2 adds Momo, an original layered fox, with Happy, Sad, Angry, and an operable climb-and-return demonstration.
The main emote menu shows three previews of that same avatar. Its feet settle at the lower edge of the original-size frame.
Water gun and Banana now include climbing out, walking offscreen, entering from the target side, acting, and returning.
Step 5 connects six editable quick messages, bindings, previews, persistence, and failure retry.
Step 6 still requires the final English proposal and the physical IME check above.
See the [Step 1 verification](support/verification/input_scope_review.md), [character verification](support/verification/character_journey_review.md), [six-slot verification](support/verification/quick_messages_six_results.json), and [core product decisions](decision_log.md).

The implementation topic was developed on `codex/question-3-avatar-interactions`.
Work stays within this folder and uses the [existing prototype](mahjong-game-standalone.html) as its baseline.
Questions 1 and 2 and repository-level configuration are outside this change.

## Intended Experience

The player's avatar performs emotes, throwable actions, and reactions linked to quick messages.
Its idle portrait stays in the circular frame. The same character performs both emotes and throwables outside it.

The first version includes:

- One fully animated demonstration character.
- Three emotes: Happy, Sad, and Angry.
- Two throwable actions.
- Six configurable quick-message slots: Happy, Sad, and Angry defaults followed by three text-only defaults.
- Mouse controls and keyboard shortcuts for the same actions.
- Chat that opens when the player starts typing.
- A four-player table, including temporary empty-seat states.

The prototype remains a local simulation. It does not connect to a live chat or game service.

## Character and Animation

### Character Assets

The inherited avatars are static images. The existing emote animations are separate effects.
The original [Momo SVG](support/prototype/assets/momo.svg) provides facial expressions, a body, arms, legs, ears, and a tail.
The same rig performs full-body expressions, climbing, walking, Water gun, Banana, and return transitions.

Required actions are idle, Happy, Sad, Angry, climbing out, walking, using a throwable, and returning to the frame.
Q selects Water gun and W selects Banana. Their menu thumbnails come from the inherited CoinPoker asset library.
The props, water stream, banana flight, impact shapes, and character choreography are original SVG demonstration work.
The inherited static-avatar fallback still plays the original animation JSON files. It does not use gallery animation wrappers.

### Emotes

Selecting an emote makes the avatar emerge from its frame and perform with its full body outside the circle.
The head, hands, body, and effects must not be cropped by the circular portrait mask.
The frame retains its original position and size throughout the action. The character stands at its lower edge, without moving to the upper rim.
Only the body grows into the readable performance pose. The character returns to its idle portrait after performing.

### Throwables

Throwable actions also perform outside the avatar frames. The character and action effects can extend past both the source and target rings.
Selecting a throwable from an opponent's avatar menu starts this sequence:

1. The sender's character climbs out of its frame.
2. It walks beyond the visible game area.
3. It re-enters from the side associated with the selected opponent.
4. It approaches that opponent and performs the throwable action.
5. The target avatar shows a brief impact reaction.
6. The sender leaves and returns to its own frame.

The outer game-window boundary provides the exit and entry illusion. The sender exits through the bottom. Opponent seats 2, 3, and 4 map to the right, top, and left edges.
Animations remain inside the web page and do not move across the operating system desktop.
The complete journey lasts about 5.6 seconds. The additional time makes departure, arrival, impact, and return individually visible. Production pacing remains a review question.

Keep movement near the table edges and away from the central tiles and action controls.
The sender's frame, name, and seat remain visible while the character is away.
Actions triggered through the player list still originate from the corresponding table avatar.

## Quick Messages

Settings → Quick messages contains the six configurable slots.
The table toolbar and chat footer use the same six slots, replacing the two inherited quick phrases.
Each slot provides editable text, an emote binding, and a preview button.
The initial setup is:

| Slot | Default text | Default emote | Shortcut |
| --- | --- | --- | --- |
| 1 | GG! | Happy | `Alt + 1` |
| 2 | Ouch... | Sad | `Alt + 2` |
| 3 | So close! | Angry | `Alt + 3` |
| 4 | Good luck, everyone! | None | `Alt + 4` |
| 5 | One moment, please. | None | `Alt + 5` |
| 6 | Last hand for me. | None | `Alt + 6` |

Bindings can use Happy, Sad, Angry, or None. Existing saved choices in slots 1–3 are retained when slots 4–6 are added.
Valid edits save automatically in Question 3's independent browser storage. Reloading retains those choices.
Each message allows up to 120 characters. Blank input keeps the last saved version and disables preview until corrected.
Preview on table closes Settings and shows the bubble and bound expression without adding a chat message.

Clicking a quick message and using its shortcut invoke the same send operation.
After a successful send, add the chat message, display its speech bubble, and trigger its bound emote together.
The bound emote uses the same outside-frame performance as a directly selected emote.
A failed send shows a retryable error without playing the emote.
Quick messages work while the chat panel is closed and preserve any unsent typed draft and reply target.
Their bubbles appear beside the performing character, with readable text at the actual display scale.
With a static avatar selected or character artwork unavailable, quick messages still send text; the animated binding requires Momo.

## Typing to Open Chat

The player can start typing while interacting with the table.
The chat panel opens automatically, focuses the message input, and retains the first entered character.
The player does not need to click the chat button first.

- Ordinary printable text opens chat. This includes uppercase letters typed with Shift.
- Reserved social shortcuts are handled before the typing-to-chat path.
- Ctrl, Alt, and Meta commands do not insert text or open chat.
- Existing text fields retain normal editing behavior. Typing in Settings does not redirect to chat.
- Chinese input composition must open chat without losing or duplicating the initial composed text.
- Enter sends the message after composition has finished. Enter used to confirm an IME candidate does not send it.
- Escape closes chat and preserves the unsent draft for reopening.
- Navigation keys, modifier keys alone, and typing outside the active game page do not open chat.

Use an input and composition-aware implementation. Do not reconstruct all text solely from keydown events.
Keep the existing chat button as an alternative entry point.

## Keyboard Controls

| Input | Behavior |
| --- | --- |
| `Shift + 1`, `Shift + 2`, `Shift + 3` | Trigger the assigned emote. Defaults are Happy, Sad, and Angry. |
| `Alt + 1–6` | Send the corresponding quick message, including an emote only when one is bound. |
| Hold `Ctrl`, press a seat number, then a throwable letter | Select the target and send the chosen throwable. |

On Mac, Alt means Option and Ctrl means Control. Command is not substituted for Control.

For throwables, keep Ctrl held across the sequence. The number key can be released before pressing the letter.
After target selection, highlight the target frame and show the player's name and available throwable letters.
Releasing Ctrl or pressing Escape cancels the pending selection.
Losing page focus also cancels it.

Use stable seat numbers: 1 for the local player, 2 for the right opponent, 3 for the opposite opponent, and 4 for the left opponent.
Reject self-targeting and empty seats without sending an action.
Do not renumber seats when someone leaves.

Show shortcut labels in the relevant menus.
Ignore repeated keydown events from holding a key.
Disable social shortcuts while editing text or composing with an IME.
Check the proposed combinations in the current browser before expanding the implementation.
If a system shortcut intercepts a combination, provide a configurable alternative and retain mouse access.

## Playback and Recovery

Each character performs one action at a time, with room for at most one pending action.
Provide feedback when another action cannot be queued.
Avoid an accumulating animation backlog.

If a bound quick-message emote cannot start immediately, keep its message and emote together as the pending action.
Start its send operation when the character becomes available.
Cancellation clears both the pending text and animation. An interrupted in-flight local send cannot publish later.
A send failure adds no history or emote and offers Retry for the same message and binding.

Cancel affected animations and restore the character when a target leaves, an avatar changes, or throwables are disabled.
Loading or playback failures must restore a usable avatar and show a short error.
Animation layers must not intercept table clicks.

Reduced-motion mode skips travel and the animated transition out of the frame.
It briefly shows the full-body pose outside the frame and retains impact feedback.
Preserve the relevant sound and interaction preferences from the baseline.

## Implementation Sequence

The first five rows are implemented with the native IME verification gap above.
The own-avatar menu and Shift + 1–3 play Momo expressions. Expand Movement preview for Climb out, Return to frame, and Reset.
Momo has three character expression cards. Static avatars retain the inherited effect library as a separate fallback.
Opponent menus offer Water gun and Banana. Mouse and keyboard start the same character journey.
The Quick toolbar, chat footer, and Alt + 1–6 send the same configured messages and bound expressions.
Settings → Interactions offers Alt + Shift as an alternative target modifier and saves it only for Question 3.

| Step | Output | Completion criterion |
| --- | --- | --- |
| Establish the four-player scope and input behavior | Four-player demo controls, shortcut handling, and typing-to-chat behavior | No three-player mode is offered. Initial characters and IME composition survive chat opening. |
| Build the character | Layered artwork and reusable animation states | The same character performs all three expressions outside its frame and demonstrates climbing out. |
| Complete one throwable journey | Source exit, target-side entry, action, and return | The sequence works toward each of the three opponent positions. |
| Add the second throwable and recovery behavior | Two distinct actions and bounded playback | Repeated input, interruption, and reduced motion leave the avatar usable. |
| Connect quick messages and settings | Six editable slots, bindings, previews, and persistence | Mouse and keyboard send the same message and reaction. Failures do not play success animations. |
| Verify and prepare the Question 3 explanation | Verified prototype and an English proposal with decision rationale | The demonstration works, remaining limitations are documented, and adoption claims are labeled as hypotheses. |

Reuse the current seat positioning, menus, chat rendering, and local event simulation where they support these behaviors.
Keep character playback, input routing, and message sending separate enough to handle cancellation and test their interaction.
Update Question 3's inherited guides and verification records as implementation replaces their baseline behavior.

## Verification and Demonstration

Verify all three expressions, both throwables, and all six quick-message slots.
Exercise every opponent direction on the four-player table.
Check browser resizing, narrow layouts, and readability at the actual display scale.

Input checks cover first-character retention, uppercase text, Chinese composition, Enter, Escape, shortcut cancellation, and held keys.
State checks cover saved configuration, unsent drafts, failed sends, empty seats, interrupted animations, and reduced motion.
Confirm that Question 3 preferences remain isolated from Questions 1 and 2.

The current demonstration supports all four steps below, plus Movement preview in the own-avatar menu:

1. Press `Shift + 1` to make the avatar emerge and perform Happy outside its frame.
2. Start typing with chat closed, then send the message.
3. Press `Alt + 2` to send the Sad quick message and its expression.
4. Use the Ctrl sequence to target an opponent and play the complete throwable journey.

The accompanying proposal will explain the expected value, production cost, and whether CoinPoker should adopt the system.
Evaluate interaction usage, repeat usage, and interference with table actions.
Treat those benefits and costs as hypotheses until supported by evidence.
