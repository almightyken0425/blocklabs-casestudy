# Question 3 Character Verification

## Candidate and Scope

Checked on 2026-10-05 on `codex/question-3-avatar-interactions`, with local uncommitted changes under Question 3.
The inherited Step 1 input work remains in place.
This review covers Step 2: the original Momo SVG, three expressions, climbing out, returning, and recovery.
It does not accept the later throwable journeys or configurable quick-message sending.

Preview: [Question 3 table](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).
Select Momo under Settings → Avatars if a static avatar was previously selected.
Use Shift + 1–3 or the own-avatar menu for Happy, Sad, and Angry.
The same menu provides Climb out, Return to frame, and Reset.
On Mac, Alt means Option and Ctrl means Control; Command is not substituted.

## Automated Evidence

The [complete regression run](character_results.json) passed all 26 groups in Chrome via Playwright.
After the visual review found the enlarged frame covering the player name, its bottom anchor was corrected.
The [final character run](character_final_results.json) then passed all six character groups on that final source.
Both records contain the source hashes they actually tested. The unaffected input, chat, and inherited-effect code is covered by the complete run.

| Coverage | Result |
| --- | --- |
| Happy, Sad, and Angry through both menus and keyboard | Each selected face appears, then the same idle avatar returns. |
| Repeated actions | One active and one queued action; a further request reports busy. |
| Climb, automatic return, and manual return | The full body moves above the ring and returns through its mask. |
| Chat during playback | Typing and sending remain available; the animation layer ignores pointer input. |
| Reset, resize, blur, settings, and player departure | Scene and pending playback are removed; the original avatar is visible and reusable. Blur was injected as an event in this automated case. |
| Static avatar and Momo selection | Character actions are unavailable for a static avatar; selecting Momo again persists across reload. |
| Reduced motion at 390 × 844 | The selected face remains still, climbing is skipped, and the enlarged ring stays above the name. |
| Artwork failure | A simulated HTTP 503 leaves a static avatar and working chat. The four-second timeout exists in code; a stalled-network timeout was not separately simulated. |
| Inherited behavior | The existing 20 input, avatar, membership, effects, chat, sound, and responsive regression groups passed. |

The initial [character red test](character_red.json) failed before the rig was implemented.
The [return-mask red test](character_return_red.json) exposed the missing return mask, and the [layout red test](character_layout_red.json) exposed name overlap.
Those behaviors passed after correction. Other added character cases are regression coverage; no separate pre-implementation failure is claimed for them.

## Visual Review

The actual Chrome tab was inspected at the normal desktop viewport and at 390 × 844.
The final [desktop screenshot](character_desktop.png) and [narrow screenshot](character_mobile.png) show the same full-body fox outside its original frame.
The active ring grows upward, preserving the local player's name and staying within the table's lower edge.
The body and limbs are recognizable at actual display size. The empty ring remains visible during the excursion.
The existing narrow table scales as a whole; its small tiles and labels have not been redesigned.
The full-body demonstration temporarily overlaps nearby tiles along the left edge, while pointer events pass through it.

The viewport override was reset after inspection. The existing local server was reused and the preview tab was retained.
The original SVG is newly authored Question 3 artwork. Its character movement is a prototype simulation, not an observation of CoinPoker behavior.
Inherited asset source files and provenance remain unchanged.

## Remaining Limits

The physical Chinese IME candidate-selection gap remains as described in the [input review](input_scope_review.md).
Browser composition tests pass, but they do not establish physical IME acceptance.
The earlier native shortcut evidence verifies the input route; this round's expression key checks used Playwright.
Full source-exit and target-entry journeys, the second throwable, quick-message configuration and sending, live multiplayer, and gameplay are outside this step.
