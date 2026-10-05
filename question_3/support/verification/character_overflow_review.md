# Character Performances Outside the Frame

## Accepted Behavior

The user's revised direction requires both emotes and throwables to extend beyond the circular avatar frame.
This supersedes the earlier in-frame emote behavior.
The circle is the character's origin and resting place, not its performance boundary.

Happy, Sad, and Angry now bring the full character out before the expression begins.
The head, body, hands, and feet remain visible without circular clipping.
Happy bounces and waves, Sad tilts its head and sheds a tear, and Angry shakes and stomps.
The same character returns to its idle portrait afterward.
The menu previews show the full character above the frame.

The existing climb demonstration remains outside the frame.
Reduced motion shows a still outside pose for both emotes and the climb demonstration.
It skips the movement into and out of the circle.
Future quick-message emotes and throwable journeys follow the same outside-frame rule in the [plan](../../plan.md).
Full throwable journeys and configurable quick-message sending remain unimplemented.

## Verification

Verified on 2026-10-05 on `codex/question-3-avatar-interactions`.
Changes remain local and uncommitted.

The [initial test](character_overflow_red.json) failed because the circular mask still cropped emotes.
The [current complete run](character_overflow_results.json) passed all 28 groups.
The result includes hashes of the tested runtime files.

The new test exercises all three emotes in normal and reduced motion.
It checks that the circular clip is removed, the body extends above the frame, and the idle portrait returns.
Existing checks cover mouse and keyboard parity, climbing, return, interruption, queue bounds, static fallback, input, chat, and table layout.

The in-app browser was used to view Happy and Angry at its default size and Sad at 390 × 844.
The temporary viewport override was reset afterward.

- [Happy outside the frame](character_overflow_happy.jpg)
- [Sad outside the frame on a narrow viewport](character_overflow_mobile.jpg)

## Preview and Limits

Open the [Question 3 prototype](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).
Use Shift + 1–3 or select an expression from your avatar menu.
Select Momo in Settings → Avatars if an inherited static avatar is active.

The table still scales as one fixed layout on small screens. Outside performances use adjacent table space and can overlap neighboring tiles temporarily.
They do not intercept table input.
Physical Chinese IME candidate selection remains the earlier input verification gap.

The [previous alignment review](character_alignment_review.md) is historical evidence for the superseded in-frame emotes.
