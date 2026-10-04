# CoinMahjong 社交互動原型

三項功能已整合到原有的[麻將草稿](../mahjong-game-standalone.html)。
頭像、表情、投擲與聊天均可操作。
牌局仍是原本的靜態畫面，社交事件使用本機資料。

相對原始 HTML 的功能差異見[修改規格](change_spec.md)。

## 開啟與操作

從 repository 根目錄啟動 HTTP 服務。
原型會讀取原始動畫 JSON，因此使用 HTTP 預覽。

```sh
python3 -m http.server 8767 --bind 127.0.0.1
```

開啟 [四人桌](http://127.0.0.1:8767/mahjong-game-standalone.html)。
也可直接查看[三人桌](http://127.0.0.1:8767/mahjong-game-standalone.html?table=kansai-full-b1)或[等待玩家](http://127.0.0.1:8767/mahjong-game-standalone.html?table=japanese-east-b1)。
需保留 `prototype`、`research` 與 `coinpoker_assets` 的相對位置。

| 操作 | 結果 |
| --- | --- |
| 點視窗 header 的 Settings 齒輪 | 開啟 Avatars 頭像設定。 |
| 點玩家列表中風位圖示左側的 Profile 按鈕 | 開啟該玩家的資料視窗。 |
| 點可用頭像 | 立即更新預覽、玩家列、座位及聊天頭像。 |
| 點鎖定素材 | 顯示 3-Bet Club 資格提示。 |
| 滑鼠移入牌桌座位區或玩家列表區的本人頭像 | 開啟 Emotes 分類與最近使用。 |
| 滑鼠移入任一區域的對手頭像 | 開啟該玩家的 Throwables 選單，選擇素材後從本人座位投向對方。 |
| 點頭像或聚焦後按 Enter | 開啟對應選單，支援觸控與鍵盤。 |
| 點牌桌內的 Chat | 開啟牌桌內的聊天抽屜。 |
| 在聊天輸入後按 Enter | 送出本機訊息。空白不送出。 |
| 點快速用語 | 直接送出該用語。 |
| 點訊息操作按鈕 | 顯示 Reply 與 Copy。 |
| 點輸入欄的 @ | 選取玩家，依原生行為覆寫輸入內容。 |
| 點聊天右上選項 | 設定觀戰者靜音、泡泡顯示及全部靜音。 |
| 開啟 Settings → Interactions | 設定投擲效果及表情音效。 |

Chat 與其他社交介面以牌桌邊界定位，外側留白不屬於操作區。
桌面 Chat 位於牌桌左下角。
窄螢幕的 Settings 位於牌桌右上角。
聊天、玩家及展示控制排列在牌桌右下角。
窄螢幕可開啟 Players，再點本人或對手頭像進入對應選單。
頭像旁的獨立 Emotes 與 Throwables 按鈕已由頭像入口取代。
原有牌桌仍採等比縮放，未重新設計手機麻將桌。

四方座位都以玩家面向牌桌的方向，將 avatar 放在牌組左側、手牌靠右排列。
南風頭像位於畫面右下，北風位於左上，東西風頭像移至手牌旁。
此配置保留右側主要操作空間，並讓頭像避開持續增長的棄牌區。
理由見[牌組安排決策](../decision_log.md#決策-2頭像放左側手牌靠右排列)。

玩家外框使用隨機展示配置。
每次載入從銀色、金色、3-Bet、Live 與 AIC 五種素材中分配，同桌不重複。
當次操作保持分配結果，更換頭像及切換會員不會重抽。
桌上座位、玩家列、Profile、聊天與設定預覽使用同一外框。
重新整理可比較其他組合。外框展示不代表玩家的會員或成就資格。

### 展示控制

右側 Prototype 的 Demo controls 可展開。
窄螢幕使用牌桌右下角的省略號入口。

- 4 players、3 players、Waiting：切換原始桌面情境。
- 3-Bet Club membership：模擬會員資格及素材權限。
- Incoming chat、Emote、Throw：模擬對手事件。
- Spectator：模擬觀戰者訊息。
- Chat history：建立可捲動的展示對話。
- Clear chat：清空本機對話。
- Send error：讓下一則送出失敗，驗證保留草稿及重試。

頭像、會員展示身分、最近使用及偏好會保存於本機瀏覽器。
訊息歷史只保留在當次頁面。
展示對話不是 CoinPoker 的原始快速用語。

## 移植決策

行為依據為 [CoinPoker 調查](../research/coinpoker_prototype_research.md)。
原始素材透過[素材索引](../research/prototype_asset_map.json)引用。
未使用素材瀏覽頁的動畫包裝。

| 決策 | 理由與取捨 |
| --- | --- |
| 保留麻將桌與右側玩家資訊 | 延續既有分數、風位及回合資訊。 |
| 在桌上增加小型玩家識別 | 讓表情、泡泡及投擲具備明確座位。捨棄只在右側列表移動的方案。 |
| 隨機分配展示外框 | 依使用者要求比較既有 rings 在麻將桌上的效果。正式外框資格仍由玩家狀態決定。 |
| 頭像設定由視窗 header 進入 | 依使用者確認的 CoinPoker 設定入口調整。玩家資料由列表中的 Profile 按鈕開啟。 |
| 頭像直接開啟社交選單 | 依本次使用者要求移除獨立表情與投擲按鈕。Profile 按鈕移至列表風位圖示左側，風位保持原有資訊用途。 |
| 頭像立即套用 | 沿用 CoinPoker 操作，不增加儲存步驟。 |
| 顯示會員素材及鎖定狀態 | 可展示權限差異。資格由本機開關模擬，不接訂閱流程。 |
| 會員展示到期時回到一般頭像 | 避免失去資格後仍選取專屬頭像。這是原型決定，非已確認的服務端規則。 |
| 聊天抽屜避開底部手牌 | 保留左側入口。開啟時暫時覆蓋部分左側桌面。 |
| 只採用兩個已確認快速用語 | 使用 GG 👍 與 Fishy AF 🐠🐡，不虛構其他原生用語。 |
| 窄螢幕在牌桌右下角放置操作按鈕 | 保持可點擊尺寸，讓操作留在牌桌內。這是麻將版適配。 |
| 使用可重播的本機事件 | 足以驗證三題互動，無需連接真實玩家。 |
| 減少動態效果時使用靜態縮圖 | 保留表達內容，停止飛行及動畫播放。 |
| 動畫載入失敗時顯示縮圖 | 維持回饋，並告知無法播放。後續選取會重試載入。 |

投擲先停留約 300 毫秒，再移動 250 毫秒。
表情依素材對照套用播放次數及尺寸。
同座位再次播放會清理前一個同類效果。

聊天提供可捲動歷史、引用、複製與座位泡泡。
泡泡約 3 秒後收起，同座位新訊息會重設計時。
靜音設定只影響之後收到的訊息，既有歷史保留。

原型的 Enable throwables 會同時停止本機發送與接收效果。
這是依停用投擲的功能意義採用的原型邊界。
研究只完整確認接收分支與原生設定文案。

## 實作與驗證

[互動程式](social.js)集中持有玩家身分、偏好與本機事件。
[介面樣式](social.css)沿用原麻將桌的暗色面板及橙色重點色。
原始 HTML 僅增加載入入口，原有牌面保留。

[瀏覽器測試](../tests/social_prototype.cjs)使用 Playwright 與本機 Chrome。
環境需提供 `playwright` 套件，且已啟動上述服務。

```sh
node tests/social_prototype.cjs
```

可用 `PROTOTYPE_URL` 指定另一個預覽位置。
`RESULT_PATH` 可指定 JSON 結果檔。
`TEST_FILTER` 可只執行名稱包含指定文字的案例。

測試涵蓋立即套用、會員鎖定、最近使用、指定投擲及離座清理。
聊天涵蓋空白防送、回覆、複製、標記、靜音及失敗重試。
版面驗證包含三人桌、等待狀態與 390 × 844 的操作入口。
也核對縮圖降級、音效載入及停用設定。

[目前驗證結果](../verification/avatar_hover_results.json)記錄目前版本的 15 組測試，全部通過。
新增驗證涵蓋兩區頭像選單、滑鼠移入與移出、風位保留、Profile、鍵盤與觸控操作。
本次已確認桌面 header 與手機頂部入口、頭像立即套用、會員鎖定及本人資料。
內建瀏覽器的畫面核對見[入口驗證紀錄](../verification/avatar_header_review.json)。
隨機外框的素材載入及跨畫面一致性見[外框驗證紀錄](../verification/rings_review.json)。
牌組排列已核對四方左右關係、四排棄牌間距、三人桌與手機縮放，見[排列驗證紀錄](../verification/seat_layout_review.json)。
目前操作區的邊界、縮放與聊天流程見[牌桌邊界驗證](../verification/table_bounds_review.json)。
[測試先行紀錄](../verification/test_first_evidence.json)保留增量失敗證據。
音效確認到檔案請求及開關路徑，未以實體喇叭核聽。

| 畫面 | 用途 |
| --- | --- |
| [目前桌面與 Profile 入口](../verification/avatar_hover_desktop.png) | 頭像旁的獨立按鈕已移除，Profile 位於列表風位圖示左側。 |
| [本人頭像選單](../verification/avatar_hover_emotes.png) | 滑鼠移入本人頭像後開啟 Emotes。 |
| [對手頭像選單](../verification/avatar_hover_throwables.png) | 滑鼠移入列表對手頭像後開啟 Throwables。 |
| [目前手機玩家列表](../verification/avatar_hover_mobile_players.png) | 頭像為社交入口，Profile 與風位分開呈現。 |
| [Chat 入口調整紀錄](../verification/table_bounds_desktop.png) | 按鈕位於牌桌內，兩側留白沒有操作入口。 |
| [目前聊天面板](../verification/table_bounds_chat.png) | 面板在牌桌內展開。 |
| [目前窄螢幕入口](../verification/table_bounds_mobile.png) | 社交按鈕移至牌桌右下角。 |
| [目前牌組排列](../verification/seat_layout_desktop.png) | 四方 avatar 在玩家左側，手牌靠右。 |
| [四排棄牌](../verification/seat_layout_discards.png) | 棄牌增加後與頭像之間的空間。 |
| [三人桌排列](../verification/seat_layout_three_players.png) | 缺席方隱藏後的版面。 |
| [目前手機排列](../verification/seat_layout_mobile.png) | 沿用桌面位置及等比縮放。 |
| [隨機外框桌面](../verification/rings_desktop.png) | 同桌玩家使用不同外框。 |
| [外框 Profile](../verification/rings_profile.png) | 外框在玩家資料視窗的呈現。 |
| [手機玩家外框](../verification/rings_mobile.png) | 固定大小的玩家清單與外框。 |
| [桌面設定入口](../verification/avatar_header_desktop.jpg) | Settings 位於右上角視窗控制區。 |
| [手機設定入口](../verification/avatar_header_mobile.jpg) | Settings 位於頂部，底部保留四個入口。 |
| [頭像設定](../verification/social_avatars.png) | 分組、選取與會員鎖定。 |
| [表情選單](../verification/social_emotes.png) | 網格、分類及桌面位置。 |
| [聊天抽屜](../verification/social_chat.png) | 對話捲動及手牌位置。 |
| [窄螢幕聊天](../verification/social_mobile.png) | 入口調整前的聊天面板參考。目前入口以手機設定入口圖為準。 |

其他功能截圖保留各次驗證時的狀態。社交入口以目前桌面與 Profile 入口圖為準。

## 已知範圍

本次完成可操作原型，尚未連接正式聊天或玩家服務。
線上會員權限、伺服器限制及完整外框優先順序仍沿用研究缺口。
未加入撲克 HUD、付款、未列入選單的 42 個動畫或真實牌局邏輯。

三項互動已驗證本機行為，不代表已完成與 CoinPoker 線上服務的逐項對照。
