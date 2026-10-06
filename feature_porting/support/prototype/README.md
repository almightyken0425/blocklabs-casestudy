# CoinMahjong Social Interaction Prototype

The three features are integrated into the original [Mahjong draft](../../mahjong-game-standalone.html).
Avatars, emotes, throwables, and chat are interactive.
Gameplay remains the original static screen, and social events use local data.

See the [change specification](change_spec.md) for functional differences from the original HTML.

## Launch and Controls

Start an HTTP server from the repository root.
Use HTTP to preview the prototype because it loads original animation JSON files.

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

Open the [four-player table](http://127.0.0.1:8767/feature_porting/mahjong-game-standalone.html).
You can also open the [three-player table](http://127.0.0.1:8767/feature_porting/mahjong-game-standalone.html?table=kansai-full-b1) or [waiting state](http://127.0.0.1:8767/feature_porting/mahjong-game-standalone.html?table=japanese-east-b1) directly.
Preserve the `prototype`, `research`, and `coinpoker_assets` directory structure under `support/`.

| Action | Result |
| --- | --- |
| Click the Settings gear in the window header | Open Avatars settings. |
| Click the Profile button to the left of a wind icon in the player list | Open that player's profile dialog. |
| Click an available avatar | Immediately update the preview, player row, seat, and chat avatar. |
| Click a locked asset | Show the 3-Bet Club eligibility prompt. |
| Hover over your own avatar at a table seat or in the player list | Open Emotes categories and Recents. |
| Hover over an opponent's avatar in either area | Open that player's Throwables menu. Selecting an asset throws it from your seat to theirs. |
| Click an avatar or focus it and press Enter | Open the corresponding menu, with touch and keyboard support. |
| Click Chat inside the table | Open the chat drawer within the table. |
| Enter chat text and press Enter | Send a local message. Blank messages are not sent. |
| Click a quick phrase | Send the phrase immediately. |
| Click a message's action button | Show Reply and Copy. |
| Click @ in the input area | Select a player and overwrite the input, matching native behavior. |
| Click the options control at the top right of chat | Configure spectator muting, bubble visibility, and muting all chats. |
| Open Settings → Interactions | Configure throwables and emote sounds. |

Chat and other social interfaces are positioned relative to the table boundaries. The surrounding blank margins are outside the interaction area.
On desktop, Chat is in the table's bottom-left corner.
On narrow screens, Settings is in the table's top-right corner.
Chat, player, and demo controls are arranged in the bottom-right corner.
On narrow screens, open Players and select your own or an opponent's avatar to open the corresponding menu.
Avatar entry points replace the separate Emotes and Throwables buttons beside avatars.
The original table still scales proportionally. The mobile Mahjong table has not been redesigned.

At all four seats, avatars sit to the left of the tile area and hands align to the right from each player's perspective facing the table.
The South avatar is at the lower right of the screen, the North avatar is at the upper left, and East and West avatars sit beside their hands.
This reserves space on the right for primary actions and keeps avatars clear of growing discard areas.
See the [tile layout decision](../../decision_log.md#decision-2-place-avatars-on-the-left-and-align-hands-to-the-right) for the rationale.

Player rings use a randomized demo configuration.
On each load, rings are assigned from five assets: Silver, Gold, 3-Bet, Live, and AIC. No ring is repeated at the same table.
Assignments remain stable during the session. Changing avatars or membership does not reshuffle them.
Table seats, player rows, Profile, chat, and settings previews use the same ring for each player.
Refresh to compare other combinations. Demo rings do not represent actual membership or achievement eligibility.

### Demo Controls

Expand Demo controls under Prototype on the right.
On narrow screens, use the ellipsis control at the table's bottom right.

- 4 players, 3 players, Waiting: switch between the original table scenarios.
- 3-Bet Club membership: simulate membership eligibility and asset permissions.
- Incoming chat, Emote, Throw: simulate opponent events.
- Spectator: simulate a spectator message.
- Chat history: create a scrollable demo conversation.
- Clear chat: clear the local conversation.
- Send error: make the next send fail to verify draft preservation and retry.

Avatars, demo membership, Recents, and preferences persist in the local browser.
Message history lasts only for the current page session.
Demo conversations are not CoinPoker's original quick phrases.

## Adaptation Decisions

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
| Use only the two confirmed quick phrases | Use GG 👍 and Fishy AF 🐠🐡 without inventing additional native phrases. |
| Place narrow-screen controls at the table's bottom right | Keep controls large enough to tap and inside the table. This is a Mahjong adaptation. |
| Use replayable local events | Verify the three interactions without connecting real players. |
| Use static thumbnails for reduced motion | Preserve the expression while stopping flight and animation playback. |
| Show a thumbnail when an animation fails to load | Preserve feedback and report the playback failure. Selecting it again retries loading. |

Throwables pause for approximately 300 ms, then travel for 250 ms.
Emotes use the playback counts and sizes in the asset mapping.
Playing another effect of the same type at the same seat clears the previous effect.

Chat provides scrollable history, replies, copying, and seat bubbles.
Bubbles close after approximately three seconds. A new message at the same seat resets the timer.
Mute settings affect future incoming messages and preserve existing history.

Enable throwables stops both local sending and received effects in the prototype.
This scope follows the intended meaning of disabling throwables.
The research fully confirmed only the receive branch and the native settings text.

## Implementation and Verification

The [interaction code](social.js) owns player identity, preferences, and local events.
The [interface styles](social.css) retain the original table's dark panels and orange accent color.
The original HTML adds only loading entry points and retains the existing tiles.

The [browser tests](../tests/social_prototype.cjs) use Playwright and local Chrome.
The environment must provide the `playwright` package and run the server described above.

```sh
node feature_porting/support/tests/social_prototype.cjs
```

Use `PROTOTYPE_URL` to specify another preview URL.
Use `RESULT_PATH` to specify a JSON results file.
Use `TEST_FILTER` to run only cases whose names contain the supplied text.

Tests cover immediate application, membership locks, Recents, targeted throws, and cleanup when a player leaves.
Chat coverage includes blank-message prevention, replies, copying, tagging, muting, and retry after failure.
Layout verification includes three-player tables, waiting states, and controls at 390 × 844.
Thumbnail fallbacks, sound loading, and disable settings are also checked.

The [current verification results](../verification/folder_split_results.json) record 15 test groups after separating the question folders, all passing.
Existing screenshots and verification records retain their original contents. Their source paths refer to the layout before the move.
Additional verification covers avatar menus in both areas, pointer entry and exit, wind preservation, Profile, keyboard, and touch interactions.
Desktop header and mobile top entry points, immediate avatar application, membership locks, and the local player's profile have been checked.
See the [entry point verification record](../verification/avatar_header_review.json) for visual checks in the in-app browser.
See the [ring verification record](../verification/rings_review.json) for randomized ring loading and consistency across screens.
The layout checks cover relative positions at all four seats, spacing with four discard rows, three-player tables, and mobile scaling. See the [layout verification record](../verification/seat_layout_review.json).
See the [table boundary verification](../verification/table_bounds_review.json) for current interaction bounds, scaling, and chat flows.
The [test-first record](../verification/test_first_evidence.json) preserves incremental failure evidence.
Sound verification covers file requests and toggle behavior. Audio has not been checked through physical speakers.

| Screen | Purpose |
| --- | --- |
| [Current desktop and Profile entry points](../verification/avatar_hover_desktop.png) | Separate buttons beside avatars are removed. Profile sits to the left of the list's wind icon. |
| [Own avatar menu](../verification/avatar_hover_emotes.png) | Hovering over your own avatar opens Emotes. |
| [Opponent avatar menu](../verification/avatar_hover_throwables.png) | Hovering over an opponent's avatar in the list opens Throwables. |
| [Current mobile player list](../verification/avatar_hover_mobile_players.png) | Avatars provide social entry points. Profile and wind indicators are separate. |
| [Chat entry point adjustment](../verification/table_bounds_desktop.png) | Controls stay inside the table, with none in the side margins. |
| [Current chat panel](../verification/table_bounds_chat.png) | The panel expands inside the table. |
| [Current narrow-screen controls](../verification/table_bounds_mobile.png) | Social controls move to the table's bottom-right corner. |
| [Current tile layout](../verification/seat_layout_desktop.png) | Avatars sit on each player's left and hands align to the right at all four seats. |
| [Four discard rows](../verification/seat_layout_discards.png) | Spacing between avatars and the expanded discard areas. |
| [Three-player layout](../verification/seat_layout_three_players.png) | Layout with the absent side hidden. |
| [Current mobile layout](../verification/seat_layout_mobile.png) | Desktop positions and proportional scaling are retained. |
| [Randomized rings on desktop](../verification/rings_desktop.png) | Players at the same table use different rings. |
| [Ring in Profile](../verification/rings_profile.png) | Ring presentation in the player profile dialog. |
| [Mobile player rings](../verification/rings_mobile.png) | Player list and rings at fixed display sizes. |
| [Desktop Settings entry point](../verification/avatar_header_desktop.jpg) | Settings sits in the top-right window control area. |
| [Mobile Settings entry point](../verification/avatar_header_mobile.jpg) | Settings sits at the top, with four entry points retained at the bottom. |
| [Avatar settings](../verification/social_avatars.png) | Groups, selection, and membership locks. |
| [Emote menu](../verification/social_emotes.png) | Grid, categories, and table positioning. |
| [Chat drawer](../verification/social_chat.png) | Conversation scrolling and hand placement. |
| [Narrow-screen chat](../verification/social_mobile.png) | Chat panel reference before the entry point adjustment. Use the mobile Settings screenshot for the entry point reference. |

Other feature screenshots preserve the state at each verification run. Use the current desktop and Profile screenshot as the reference for social entry points.

## Known Scope

The interactive prototype is complete but is not connected to production chat or player services.
Online membership permissions, server limits, and the complete ring priority order remain research gaps.
Poker HUD, payments, the 42 animations outside the menus, and real gameplay logic are not included.

Local behavior has been verified for the three interactions. This does not establish a complete comparison with CoinPoker's online services.
