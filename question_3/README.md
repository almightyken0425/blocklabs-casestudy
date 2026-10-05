# Question 3: What Comes Next

This folder contains the independent prototype for assignment section 1.3.
The task is to propose a system to add or modify after the initial features succeed, explain its value, and assess whether CoinPoker should adopt it.

The [plan](plan.md) defines avatar-driven emotes, throwable journeys, and six configurable quick messages.
The [prototype](mahjong-game-standalone.html) implements four stable seats, typing to open chat, keyboard input routing, and the animated character and both throwable journeys.
Momo is an original layered fox with Happy, Sad, and Angry expressions. It emerges and performs all three outside its circular frame.
Use Shift + 1–3 or the own-avatar menu. The frame keeps its original size, and the full-body emote stands at its lower edge.
For throwables, choose Water gun or Banana from an opponent's menu. Momo climbs out, leaves the window, enters from that opponent's side, acts, and returns.
Alternatively, hold Ctrl, press seat 2, 3, or 4, then Q for Water gun or W for Banana.
The menu shows three previews of Momo. Expand Movement preview for Climb out, Return to frame, and Reset.
Click Quick beside Chat or press Alt + 1–3 to send GG! + Happy, Ouch... + Sad, or So close! + Angry. Alt + 4–6 send Good luck, everyone!, One moment, please., and Last hand for me. without an emote. Chat can stay closed.
Settings → Quick messages provides six editable messages, emote bindings, and an on-table preview. Valid changes save on this device.
The message and its expression wait together if Momo is busy. Failed sends offer Retry without playing an emote. Typed drafts stay intact.
Static avatars retain the inherited CoinPoker emote library and send quick messages as text only.

## Working on the New Prototype

- Edit `mahjong-game-standalone.html` and `support/prototype/` in this folder for Question 3 changes.
- This folder has its own assets, research, tests, and verification records under `support/`.
- Saved browser preferences use a separate key, so they do not affect Questions 1 and 2.
- The [operation guide](support/prototype/README.md) describes the current controls and limitations.
- The [decision log](decision_log.md) explains the avatar-led social concept, player customization, and future character interactions.
- The [six-slot checks](support/verification/quick_messages_six_results.json) verify the expanded shortcuts, saved settings, and narrow layout. The [earlier quick-message review](support/verification/quick_messages_review.md) records the original three-slot implementation.
- The [character verification](support/verification/character_journey_review.md) records the preceding journey regression and visual checks. The [Q/W input check](support/verification/throwable_keys_results.json) verifies the updated shortcut mapping.
- The [input verification](support/verification/input_scope_review.md) preserves native shortcut checks and the pending physical IME check.
- The [inherited change specification](support/prototype/change_spec.md) and earlier screenshots describe the historical baseline. Their three-player behavior does not apply to the current Question 3 prototype.

Start the server from the repository root using the [shared preview instructions](../README.md#local-preview).
Open the [Question 3 preview](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).
