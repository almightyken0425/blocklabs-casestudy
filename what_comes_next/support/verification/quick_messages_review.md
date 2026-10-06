# Quick Message Verification

Checked on 2026-10-05 against the local [Question 3 preview](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).
This record covers implementation step 5 on `codex/question-3-avatar-interactions`. Changes remain uncommitted.

## Result

The prototype has exactly three configurable quick messages. The table toolbar, chat footer, and Alt + 1–3 share their text and emote bindings.
Defaults are GG! with Happy, Ouch... with Sad, and So close! with Angry.
Settings supports Happy, Sad, Angry, or None, valid automatic saving, and an on-table preview without adding history.

The [full regression run](quick_messages_results.json) passed all 36 groups.
A subsequent fix lets long bubbles grow and keeps them inside the table. The [final focused run](quick_messages_final.json) passed all seven quick-message groups on the final source hashes.
The full run predates only that bubble-position and height correction; it was not repeated after the focused checks passed.
The [initial failing checks](quick_messages_red.json) establish the missing behavior before implementation. The [long-message failure](quick_messages_long_red.json) reproduced clipping before its correction.

## Automated Checks

The existing Chrome and Playwright harness verified:

- All three shortcuts add the expected message, bubble, and expression while chat remains closed and a typed draft stays intact.
- Three editable slots retain text and binding across reloads, preserve Question 1 and 2 storage, reject blank configuration, and support text-only sending.
- Preview displays the message and expression without history. A 120-character unbroken message fits at desktop and 390-pixel widths.
- A busy character queues the message and emote together. Further requests receive a busy notice. Opening Settings cancels the queued message before it sends.
- A failed send adds neither history nor animation. Retry sends the same message and binding, with chat still closed and the draft preserved.
- Losing focus during the local send cancels its commit. A later request works, and its bubble does not cover the performing character.
- A static avatar retains text-only quick sending. Touch can open the menu and send a bound message at 390 × 844.

The full regression also passed character journeys to all three opponent directions, Q/W routing, reduced motion, recovery, keyboard and synthetic composition handling, and inherited chat and avatar behavior.

## Visual Checks

The in-app browser was inspected at 1440 × 1024 and 390 × 844. The temporary viewport override was reset afterward.

| View | Observed result |
| --- | --- |
| [Desktop settings](quick_messages_settings.jpg) | Three editable messages and bindings are visible with their preview controls. |
| [Desktop menu](quick_messages_menu.jpg) | All three messages show their character expression and Alt shortcut. |
| [Desktop send](quick_messages_send.jpg) | GG! appears beside Happy with chat closed. The frame keeps its original size and the character stands at its lower edge. |
| [Narrow menu](quick_messages_mobile_menu.jpg) | All three choices and the edit entry fit inside the game area. |
| [Narrow send](quick_messages_mobile_send.jpg) | Ouch... remains readable beside the full-body Sad expression. |

The third slot's preview was also activated from the narrow Settings panel and showed Angry with the preview-only notice.
Settings retains its scrollable content within the proportionally scaled table; narrow portrait layouts show fewer fields at once.
The underlying Mahjong table has not been redesigned for mobile.

## Limits and Follow-Up

All sends are local simulations. The 80 ms send delay and failure control do not establish server delivery, moderation, rate limits, or multiplayer synchronization.
Character artwork and production chat are not connected to external services.
Physical Chinese IME candidate confirmation remains unverified; see the [input review](input_scope_review.md).
The final English proposal and production adoption rationale remain step 6 of the [plan](../../plan.md).
