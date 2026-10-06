# Question 3 Step 1 Verification

The candidate is on `codex/question-3-avatar-interactions`, based on `d9f82cf7496d2816eecf1e1999231a2594011c0e`.
Changes are local and uncommitted. Questions 1 and 2 and repository-level files are unchanged.
The existing HTTP server on port 8767 was reused.

## Implemented Scope

- Four-player entry points, including stable four-seat waiting states.
- Typing to open chat, first-character retention, uppercase text, and draft recovery after Escape.
- Composition-aware input and Enter guards.
- Shift emote slots, Alt quick-message slots, and held-modifier throwable targeting.
- Target rejection, highlight, cancellation, repeat suppression, and a saved alternative modifier.
- Explicit pending-action feedback and shared mouse/keyboard action requests.

Character animation, throwable journeys, and configurable quick-message sending remain future steps.
The A and B throwable letters are provisional.

## Automated Checks

The [results](input_scope_results.json) record 20 passing browser test groups and source hashes.
They cover the new behavior and inherited avatar, emote, throwable, chat, persistence, touch, and narrow-screen flows.
The initial [scope failure](input_scope_red.json) and [typing failure](input_typing_red.json) establish that those checks failed before their implementation.

Composition checks use Chrome's input protocol to create a composition session and commit Chinese text.
They verify that the text appears once, candidate Enter sends nothing, and a subsequent Enter sends the committed message.
A separate synthetic sequence covers compositionend arriving before keydown.
Those tests do not establish operating-system shortcut availability or physical IME behavior.

## Native Chrome Checks

Native app key commands were exercised in the current macOS Chrome window.
Shift + H opened chat and retained H. Escape closed it while preserving its draft.
Shift + 1 reached Happy. Alt + 2 reached quick-message slot 2 without sending or opening chat.
Ctrl + 2 highlighted the right opponent. A subsequent Ctrl + A reached the unavailable throwable action for that opponent.
Shift + 2–3, Alt + 1 and Alt + 3, and Ctrl + 3–4 also reached the page. The three opponent numbers selected their expected positions.
These keys reached the page rather than switching a browser tab or desktop in this environment.
The [native event record](native_shortcuts.txt) captures the observed keys and target state.

The native tool does not expose independent modifier down/up operations.
It also rejects multiple ordinary keys in one key command.
Therefore the held sequence, physical modifier release, repeat behavior, and focus-loss cancellation are covered by browser automation rather than claimed as physical-key verification.
The configurable Alt + Shift alternative remains available for environments that intercept Ctrl.

## Visual Checks

The current Chrome page was inspected at its normal desktop size and at 390 × 844.
The chat input aligns with its visible slot after opening and resizing.
The narrow-screen avatar menu retains readable pending-action labels and scrolls within the table.
The viewport override was reset after checking, and the temporary event-recorder tab was closed.

- [Desktop typing-to-chat](input_scope_desktop.png)
- [Selected opponent and fixed seat numbers](input_scope_target.png)
- [Narrow-screen chat](input_scope_mobile.png)

## Remaining Verification

Physical Chinese IME candidate confirmation is pending.
The native tool emitted Zhuyin characters as ordinary text and did not produce composition events or a candidate window.
This is not evidence that actual candidate selection succeeds.
Use the [preview](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html) with a physical keyboard and the intended Chinese input method.
Start with chat closed, compose a phrase, select a candidate with Enter, and confirm that only a later Enter sends it.
Repeat after clicking the table and after keyboard navigation to an avatar control.

Windows, Safari, Firefox, other IMEs, and physical audio output were not checked.
No character animation or new quick-message success behavior is claimed by this step.
