# Question 3: Fixed Frame and Throwable Journeys

## Candidate and Scope

This review covers the latest user correction: preserve the original circle size and position, put emote feet at its lower edge, and make throwables follow the complete character journey.
The candidate is the uncommitted work on `codex/question-3-avatar-interactions` under `question_3/`.
The [browser results](character_journey_results.json) record the runtime source hashes.
The server serves the repository root at port 8767. The preview is [Question 3](http://127.0.0.1:8767/question_3/mahjong-game-standalone.html).

## Implemented Behavior

- Happy, Sad, and Angry use a readable full body with feet at the lower frame edge. The ring retains its original dimensions and position throughout playback.
- A selects Water gun. B selects Banana. Both mouse and keyboard use the same player and action request path.
- The character climbs out, walks completely beyond the bottom of the game window, and enters from the selected opponent's side.
- Seats 2, 3, and 4 map to right, top, and left entry. The character stands beside the target before using the prop and producing an impact reaction.
- The character leaves through that side, re-enters below its own seat, and returns to the portrait. The source ring stays fixed and empty during the journey.
- Reduced motion shows a static actor, prop, and impact beside the target. It skips walking, projectile motion, and target shaking.
- On narrow layouts, the actor uses the side with available room beside the target. Entry still follows the selected seat's direction.

## Checks and Evidence

The [initial failing check](character_journey_red.json) confirms that the preceding version enlarged the circle.
The full regression run passed 29 of 30 groups. One shortcut case timed out during initial page navigation before executing its assertions.
The [focused retry](character_journey_input_retry.json) passed after the test harness navigation timeout increased from 3 to 15 seconds. Interaction assertion timeouts remain unchanged.
All 30 groups therefore have passing evidence on the same runtime source hashes. Coverage includes both actions toward all three opponents, unchanged ring geometry, emote anchoring, keyboard selection, touch entry, cleanup, chat, and inherited static-avatar effects.
Each case also rejects uncaught browser errors.
The reduced-motion geometry check reads its short-lived pose in one DOM snapshot. The interruption check reloads after changing viewport size so the resize cancellation finishes before a new action starts.

The in-app browser was exercised at desktop size and 390 × 844.
The initial tab stopped responding to browser control. Visual checks continued in a fresh tab at the same URL. The temporary viewport override was reset afterward.

| Evidence | Visible result |
| --- | --- |
| [Happy at the lower edge](character_journey_emote.jpg) | The body extends outside the original-size ring and stands above the player name. |
| [Water gun](character_journey_water.jpg) | Momo holds the prop beside the right opponent. The source ring is empty. |
| [Banana](character_journey_banana.jpg) | The same actor performs beside the top opponent, with a banana impact at the target. |
| [Narrow menu](character_journey_mobile_menu.jpg) | Both actions and the keyboard instruction fit inside the game window. |
| [Narrow target placement](character_journey_mobile.jpg) | Momo stands beside the left target instead of over the target's head. |

## Limits and Remaining Work

These are local simulated interactions. Momo, the props, and the choreography are original prototype work. The two menu thumbnails retain their CoinPoker source.
New character actions are silent. Inherited animation audio still follows its existing sound setting.
The whole journey lasts about 5.6 seconds. Production pacing and interruption during a real Mahjong turn still require product validation.
The larger actor briefly occupies space around the seat on narrow screens. Its animation layer does not intercept clicks.
The baseline table still scales proportionally and is not a redesigned mobile Mahjong interface.

The three configurable quick-message slots and their emote bindings remain pending.
Physical Chinese IME candidate confirmation remains unverified, as recorded in the [input review](input_scope_review.md).
No commit, merge, or push is part of this change.
