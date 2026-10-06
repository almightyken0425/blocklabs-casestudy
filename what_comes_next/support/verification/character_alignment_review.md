# Question 3 Character Alignment Review

## Scope and Result

Reviewed on 2026-10-05 on `codex/question-3-avatar-interactions`.
The existing four-seat and input work remains in place.
This revision brings Step 2 closer to the agreed avatar-driven experience.
The changes remain local and uncommitted.

The selected Momo avatar now has three expression cards showing its own face.
Independent sticker effects are absent from that primary menu.
Static avatars retain their inherited effect library.
Movement preview contains the separate climb, return, and reset controls.

The same rig performs expressions inside the circular frame.
The climb reaches for the rim, holds it with connected arms, pulls upward, and lifts the legs over.
The full body rests against the rim before returning through the opening.
The smaller outside pose reduces interference with the left tile column.
The active frame shrinks back to the original seat size when playback ends.

## Evidence

The [initial behavior check](character_alignment_red.json) failed because the menu still opened as Dogs.
An earlier attempt to launch Chrome was blocked by the local execution sandbox and did not establish a behavior failure.
The rerun produced the recorded failure against the prior implementation.

The [current complete regression run](character_alignment_results.json) passed all 27 groups.
Its source hashes identify the exact runtime files checked.
The new menu check covers the three matching character previews and the absence of the unrelated sticker grid.
The existing climb check now also checks that the feet settle close to the frame rim.
Inherited emote-library tests select a static avatar before exercising that fallback.

Other coverage includes all three expressions through mouse and keyboard, bounded queuing, interruption, manual return, reduced motion, and artwork failure.
Input, chat, stable seats, targeting, settings persistence, and inherited effects passed their existing regression checks.

The in-app browser was used to inspect the menu, Happy, Angry, gripping, and the outside pose.
The 390 × 844 layout was inspected separately for menu access and the full-body pose.
Shift + 3 was exercised in that browser and displayed Angry.
The temporary viewport override was reset afterward.

| View | Evidence |
| --- | --- |
| Default-size expression menu | [Menu](character_alignment_menu.jpg) |
| Default-size outside pose | [Perched character](character_alignment_perch.jpg) |
| Narrow expression menu | [Narrow menu](character_alignment_mobile_menu.jpg) |
| Narrow outside pose | [Narrow character](character_alignment_mobile_perch.jpg) |

## Preview and Limits

Open the [Question 3 table](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).
Select Momo under Settings → Avatars if a static avatar was saved earlier.
Click the own-avatar menu or press Shift + 1–3 to play an expression.
Expand Movement preview to try Climb out, Return to frame, or Reset.

Full throwable journeys and configurable quick-message sending remain later plan steps.
This revision does not claim those behaviors are implemented.
Physical Chinese IME candidate selection remains the input verification gap recorded in the [Step 1 review](input_scope_review.md).
The table still scales as one fixed layout on narrow screens. Enlarged animations temporarily use space around their seat.

The [earlier character review](character_review.md) describes the previous candidate and is retained as historical evidence.
