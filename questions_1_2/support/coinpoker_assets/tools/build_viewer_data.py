"""Build script-tag data wrappers so the gallery also opens directly from disk."""
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
data={name:json.loads((root/'catalog'/f'{name}.json').read_text())
      for name in ['avatars','animations','rings','chat_assets','manifest']}
data['usage']=json.loads((root/'catalog/usage_research.json').read_text())
data['chat_behavior']={
    'source':'Assembly-CSharp.dll / ChatPanelComponent, ChatContent, PredefinedMsgComponent, OtherOptionsComponent',
    'verified_in_client_code':[
        '聊天面板可開啟與收起，開啟時聚焦輸入欄位。',
        '聊天歷史使用 ScrollRect，可捲動。',
        '送出時略過空白訊息，請求類型為 TEXT。',
        '訊息包含頭像、名稱、文字與時間，提供回覆和複製操作。',
        '快速用語來自 ChatConfig.ChatPhrases。',
        '選項包括靜音觀戰者、隱藏聊天泡泡、靜音所有聊天。'
    ],
    'source_phrases':['GG 👍','Fishy AF 🐠🐡'],
    'phrase_note':'英文語系內找到這兩個字串。預設設定有八個翻譯鍵，尚未確認線上設定的完整用語清單。',
    'emote_notes':['最近使用清單上限為 10 個。','投擲移動時間在 PlayableThrowable 設為 0.25 秒。','播放次數和縮放覆寫記錄於 animation_mapping.json。'],
    'preview_note':'瀏覽頁的聊天介面是本地重建示範。原始圖片與原始動畫另有來源記錄。示範不連接 CoinPoker 聊天服務。'
}
(root/'chat/behavior.json').write_text(json.dumps(data['chat_behavior'],ensure_ascii=False,indent=2))
(root/'viewer/asset_data.js').write_text('window.CP_ASSETS = '+json.dumps(data,ensure_ascii=False)+';\n')
folder=root/'viewer/animation_data'
folder.mkdir(exist_ok=True)
for item in data['animations']:
    raw=(root/item['path']).read_text()
    (folder/f"{item['id']}.js").write_text(f"window.CP_ANIMATIONS[{item['id']}] = "+raw+';\n')
print(f"Gallery data: {len(data['avatars'])} avatars, {len(data['animations'])} animations")
