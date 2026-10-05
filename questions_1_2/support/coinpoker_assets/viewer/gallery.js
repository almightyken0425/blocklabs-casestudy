'use strict';
(() => {
  const data = window.CP_ASSETS;
  window.CP_ANIMATIONS = {};
  const $ = id => document.getElementById(id);
  const tabs = [['avatars','頭像'],['rings','頭像外框'],['emote','動畫表情'],['throwable','投擲效果'],['chat','聊天'],['archive','其他內建動畫']];
  const labels = {ANIMAL:'動物',ANIME:'動漫',HALLOWEEN:'萬聖節',NOBLE:'貴族',ROYAL:'皇室','World Cup':'世界盃',Dogs:'狗',Penguin:'企鵝',Donkey:'驢子',Chips:'籌碼',Skull:'骷髏',Pepe:'Pepe',Throwables:'投擲效果','Other packaged':'其他內建'};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tab = 'avatars', selected = null, player = null, requestId = 0;
  const loading = new Map();
  const name = item => item.source_name || item.name || `Avatar ${item.id}`;
  const group = item => item.kind === 'archive' ? (item.id >= 2000 ? 'unlisted_aic' : item.id >= 100 ? 'unlisted_100' : 'unlisted_general') : item.category || item.group || (item.source === 'data.unity3d' ? 'Unity' : 'Electron');
  const groupLabel = value => value === '3-Bet Club configuration' ? '3-Bet Club 專屬' : labels[value] || value;
  const isAnimation = item => 'frame_rate' in item;
  const count = key => key === 'avatars' ? data.avatars.length : key === 'rings' ? data.rings.length : key === 'chat' ? data.chat_assets.length : data.animations.filter(a => a.kind === key).length;
  const sourceStatus = item => isAnimation(item) ? (item.in_bundled_default_config ? '列於預設設定' : '程式內建，啟用狀態未確認') : item.id >= 2001 && tab === 'avatars' ? '專屬頭像設定，資格未確認' : '';
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function loadAnimationData(item) {
    if (window.CP_ANIMATIONS[item.id]) return Promise.resolve(window.CP_ANIMATIONS[item.id]);
    if (loading.has(item.id)) return loading.get(item.id);
    const promise = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = `viewer/animation_data/${item.id}.js`;
      script.onload = () => resolve(window.CP_ANIMATIONS[item.id]);
      script.onerror = () => { loading.delete(item.id); reject(new Error('動畫檔載入失敗')); };
      document.head.append(script);
    });
    loading.set(item.id,promise);
    return promise;
  }
  function destroyPlayer() {
    if (player) { player.destroy(); player = null; }
    $('audio_wrap').querySelectorAll('audio').forEach(a => { a.pause(); a.removeAttribute('src'); a.load(); });
    $('audio_wrap').replaceChildren();
  }
  async function select(item, card) {
    selected = item;
    const ownRequest = ++requestId;
    document.querySelectorAll('.card').forEach(c => c.setAttribute('aria-pressed',String(c === card)));
    destroyPlayer();
    $('preview').replaceChildren();
    $('preview_name').textContent = name(item);
    $('preview_kind').textContent = tabs.find(t => t[0] === tab)[1];
    $('preview_id').textContent = item.id === undefined ? '' : `#${item.id}`;
    $('original').href = item.path;
    $('original').hidden = false;
    $('source_note').textContent = item.source_url || (item.serialized_file ? `${item.serialized_file} · Path ID ${item.path_id}` : item.source);
    $('playback').hidden = !isAnimation(item);
    $('preview_status').textContent = '';
    $('item_usage').hidden = !['rings','emote','throwable','archive'].includes(tab);
    $('item_usage').textContent = tab === 'rings' ? data.usage.ring_policy.mode : tab === 'archive' ? '未找到目前選單入口。已確認這個 ID 可交由共用表情／投擲播放器載入，尚未確認伺服器何時使用。' : tab === 'throwable' ? '指定對手的座位為目標，效果從發送者移向對方。需入座後使用對手座位旁的投擲按鈕。' : '顯示在發送者的座位附近，由自己的表情按鈕選取。';
    if (!isAnimation(item)) {
      const img = el('img'); img.src = item.path; img.alt = name(item);
      img.onerror = () => { $('preview_status').textContent = '圖片無法載入，請確認素材資料夾完整。'; };
      $('preview').append(img);
      $('preview_info').textContent = [item.width ? `${item.width} × ${item.height}` : '原始素材',sourceStatus(item)].filter(Boolean).join(' · ');
      return;
    }
    $('preview_info').textContent = `${item.duration_seconds.toFixed(2)} 秒 · ${item.frame_rate} fps · ${item.width} × ${item.height}。${sourceStatus(item)}`;
    $('preview_status').textContent = '載入動畫…';
    try {
      const animationData = await loadAnimationData(item);
      if (ownRequest !== requestId) return;
      player = lottie.loadAnimation({container:$('preview'),renderer:'svg',loop:$('loop').checked,autoplay:!reduced,animationData:structuredClone(animationData)});
      const current = player;
      player.addEventListener('DOMLoaded',() => {
        if (current !== player) return;
        if (reduced) { current.goToAndStop(current.totalFrames * .3,true); $('pause').textContent = '播放'; }
        else $('pause').textContent = '暫停';
        $('preview_status').textContent = reduced ? '已暫停，按下播放可查看動畫。' : '播放中';
      });
      player.addEventListener('enterFrame',() => { if (current === player) $('scrub').value = String(current.currentFrame/current.totalFrames*100); });
      player.addEventListener('complete',() => { if (current === player) { $('pause').textContent = '播放'; $('preview_status').textContent = '播放完畢'; } });
      player.addEventListener('data_failed',() => { $('preview_status').textContent = '動畫無法載入'; });
      for (const entry of item.audio || []) {
        const audio = el('audio'); audio.controls = true; audio.preload = 'metadata'; audio.src = entry.path;
        audio.setAttribute('aria-label',`${name(item)} 原始音效`);
        $('audio_wrap').append(el('p','對應原始音效，可獨立試聽。','muted'),audio);
      }
    } catch (error) { $('preview_status').textContent = error.message; }
  }
  function records() {
    const items = tab === 'avatars' ? data.avatars : tab === 'rings' ? data.rings : tab === 'chat' ? data.chat_assets : data.animations.filter(a => a.kind === tab);
    const order = groupDefinitions().map(g => g.key);
    return order.length ? [...items].sort((a,b) => order.indexOf(group(a))-order.indexOf(group(b)) || (a.id ?? 0)-(b.id ?? 0)) : items;
  }
  function groupDefinitions() {
    return tab === 'avatars' ? data.usage.avatar_groups : tab === 'emote' ? data.usage.emote_groups : tab === 'archive' ? data.usage.archive.groups : [];
  }
  function renderContext() {
    const box = $('context'); box.replaceChildren(); box.hidden = !['rings','emote','throwable','archive'].includes(tab);
    if (tab === 'rings') {
      box.append(el('h2','外框由平台資料決定'),el('p',data.usage.ring_policy.mode),el('p',data.usage.ring_policy.unknown,'muted'));
    } else if (tab === 'emote') {
      box.append(el('p',data.usage.recents_note));
    } else if (tab === 'throwable') {
      box.append(el('h2','從自己的座位，向對手發送互動效果'),el('p',data.usage.throwables.meaning));
      const steps=el('ol'); data.usage.throwables.steps.forEach(step => steps.append(el('li',step))); box.append(steps);
      box.append(el('p','觀戰時不顯示這個操作入口。設定位置：Settings → Game Settings。'));
      const list=el('ul'); data.usage.throwables.settings_help.forEach(help => list.append(el('li',help))); box.append(list);
      box.append(el('p','本次畫面確認：Show throwables on hover 已開啟，Disables throwables entirely 已關閉。','muted'));
      const link=el('a','查看原始設定畫面 ↗'); link.href=data.usage.throwables.current_settings.evidence; link.target='_blank'; link.rel='noopener'; box.append(link);
    } else if (tab === 'archive') {
      box.append(el('h2','42 份有播放對照，但未確認目前選單入口'),el('p',data.usage.archive.conclusion));
      const details=el('details'); details.append(el('summary','已追到哪裡，還有哪些未知'));
      const list=el('ul'); data.usage.archive.confirmed.forEach(fact => list.append(el('li',fact))); details.append(list,el('p',data.usage.archive.unknown));
      const link=el('a','查看用途查核與來源'); link.href='catalog/usage_research.json'; details.append(link); box.append(details,el('p',data.usage.archive.case_study_guidance,'muted'));
    }
  }
  function renderGrid() {
    const search = $('search').value.trim().toLowerCase();
    const category = $('group').value;
    const definitions = groupDefinitions();
    const items = records().filter(item => (!category || group(item) === category) && `${name(item)} ${item.id ?? ''} ${group(item)} ${groupLabel(group(item))} ${definitions.find(g=>g.key===group(item))?.label || ''} ${item.composition_name || ''}`.toLowerCase().includes(search));
    $('grid').replaceChildren();
    $('grid').className = definitions.length ? 'groups' : 'grid';
    $('empty').hidden = items.length > 0;
    const prefix = tab === 'avatars' ? '依 CoinPoker 設定頁的分類與順序排列。較長的分類列可左右捲動。' : tab === 'emote' ? '依原始表情分類排列。36 個列於預設設定，Pepe 的 5 個表情另有平台啟用條件。' : tab === 'throwable' ? '17 個列於預設設定，另有 4 個投擲效果包在程式內。' : tab === 'rings' ? '原型依 CoinPoker API 與玩家狀態呈現外框。此處展示素材供對照。' : tab === 'chat' ? '原始聊天圖像與本地互動示範。' : '以下依原始編號範圍整理，這些分組不代表 CoinPoker 的選單分類。';
    $('scope').textContent = `${items.length} 項。${prefix}`;
    const targets = new Map();
    for (const definition of definitions) {
      const groupItems=items.filter(item=>group(item)===definition.key);
      if (!groupItems.length) continue;
      const section=el('section',undefined,'asset_group'); section.dataset.group=definition.key;
      const head=el('div',undefined,'group_heading');
      const title=el('h2',definition.title); title.append(el('span',` ${definition.label === definition.title ? '' : definition.label+' · '}${groupItems.length} 項`)); head.append(title);
      const grid=el('div',undefined,'grid'+(tab==='avatars' ? ' avatar_row' : ''));
      if (tab==='avatars' && groupItems.length>5) {
        const controls=el('div',undefined,'row_controls');
        for (const [symbol,direction,label] of [['←',-1,'向左瀏覽'],['→',1,'向右瀏覽']]) {
          const button=el('button',symbol); button.setAttribute('aria-label',`${label} ${definition.title}`);
          button.onclick=()=>grid.scrollBy({left:direction*grid.clientWidth*.8,behavior:reduced?'auto':'smooth'}); controls.append(button);
        }
        head.append(controls);
      }
      section.append(head,el('p',definition.note,'group_note'),grid); $('grid').append(section); targets.set(definition.key,grid);
    }
    for (const item of items) {
      const card = el('button',undefined,'card' + (tab === 'avatars' ? ' avatar_card' : ''));
      card.type = 'button'; card.setAttribute('aria-label',`${name(item)}${isAnimation(item) ? ' 播放動畫' : ''}`); card.setAttribute('aria-pressed',String(selected === item));
      const thumb = el('div',undefined,'thumb');
      const path = item.thumbnail?.path || (!isAnimation(item) ? item.path : null);
      if (path) { const img = el('img'); img.src = path; img.alt = ''; img.loading = 'lazy'; thumb.append(img); }
      else thumb.append(el('span',`#${item.id}`,'archive_thumb'));
      const caption = el('div',undefined,'caption');
      caption.append(el('strong',name(item)),el('small',isAnimation(item) ? `#${item.id} · ${item.duration_seconds.toFixed(1)} 秒` : groupLabel(group(item))));
      card.append(thumb,caption); card.onclick = () => select(item,card); (targets.get(group(item)) || $('grid')).append(card);
    }
  }
  function setTab(key) {
    tab = key; $('search').value = ''; $('group').replaceChildren(new Option('全部分類',''));
    for (const value of [...new Set(records().map(group))]) {
      const definition=groupDefinitions().find(g=>g.key===value);
      $('group').append(new Option(definition ? `${definition.title} · ${definition.label}` : groupLabel(value),value));
    }
    document.querySelectorAll('#tabs button').forEach(b => b.setAttribute('aria-current',String(b.dataset.tab === key)));
    $('chat_demo').hidden = key !== 'chat';
    renderContext();
    renderGrid();
    if (records().length) select(records()[0],$('grid').querySelector('.card'));
  }
  for (const [key,label] of tabs) {
    const button = el('button',`${label} ${count(key)}`); button.dataset.tab = key; button.onclick = () => setTab(key); $('tabs').append(button);
  }
  for (const [value,label] of [[data.avatars.length,'張頭像'],[data.animations.length,'份動畫'],[data.manifest.audio_count,'段音效'],[data.chat_assets.length,'個聊天圖像']]) {
    const stat = el('div',undefined,'stat'); stat.append(el('strong',String(value)),el('span',label)); $('stats').append(stat);
  }
  $('search').oninput = renderGrid; $('group').onchange = renderGrid;
  $('replay').onclick = () => { if (player) { player.goToAndPlay(0,true); $('pause').textContent = '暫停'; $('preview_status').textContent = '播放中'; } };
  $('pause').onclick = () => { if (!player) return; if (player.isPaused) { if (player.currentFrame >= player.totalFrames-1) player.goToAndPlay(0,true); else player.play(); $('pause').textContent = '暫停'; } else { player.pause(); $('pause').textContent = '播放'; } };
  $('loop').onchange = () => { if (player) player.loop = $('loop').checked; };
  $('scrub').oninput = () => { if (player) { player.goToAndStop(Number($('scrub').value) / 100 * (player.totalFrames-1),true); $('pause').textContent = '播放'; $('preview_status').textContent = '已暫停'; } };

  let reply = null;
  const messages = Array.from({length:12},(_,i) => ({user:i % 2 ? 'Mina' : 'Sam',text:i % 2 ? 'GG 👍' : 'Nice hand!',avatar:i % 2 ? 3 : 4,time:`14:${String(20+i).padStart(2,'0')}`}));
  function renderMessages() {
    $('chat_history').replaceChildren();
    for (const message of messages) {
      const row = el('article',undefined,`message ${message.user === 'You' ? 'self' : ''}`);
      const avatar = el('img'); avatar.src = `avatars/avatar-${message.avatar}.webp`; avatar.alt = '';
      const content = el('div',undefined,'message_content'); content.append(el('small',`${message.user} · ${message.time}`));
      if (message.reply) content.append(el('div',`${message.reply.user}: ${message.reply.text}`,'reply_quote'));
      content.append(el('p',message.text));
      const controls = el('div',undefined,'msg_tools');
      const replyButton = el('button','回覆'); replyButton.setAttribute('aria-label',`回覆 ${message.user}：${message.text}`);
      replyButton.onclick = () => { reply = message; renderReply(); $('chat_input').focus(); };
      const copyButton = el('button','複製'); copyButton.setAttribute('aria-label',`複製 ${message.user}：${message.text}`);
      copyButton.onclick = async () => { try { await navigator.clipboard.writeText(message.text); $('chat_status').textContent = '已複製訊息'; } catch { $('chat_status').textContent = '瀏覽器未提供剪貼簿存取，可選取文字複製。'; } };
      controls.append(replyButton,copyButton); content.append(controls); row.append(avatar,content); $('chat_history').append(row);
    }
    $('chat_history').scrollTop = $('chat_history').scrollHeight;
  }
  function renderReply() {
    $('reply_preview').replaceChildren(); $('reply_preview').hidden = !reply;
    if (!reply) return;
    $('reply_preview').append(el('span',`回覆 ${reply.user}：${reply.text}`));
    const close = el('button','×'); close.setAttribute('aria-label','取消回覆'); close.onclick = () => { reply = null; renderReply(); }; $('reply_preview').append(close);
  }
  function send(text) {
    if (!text.trim()) return;
    messages.push({user:'You',text:text.trim(),avatar:1,time:new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false}),reply:reply ? {user:reply.user,text:reply.text} : null});
    reply = null; renderReply(); renderMessages(); $('chat_input').value = ''; $('send_chat').disabled = true;
    $('chat_status').textContent = '已加入本地聊天示範'; $('chat_input').focus();
  }
  $('chat_form').onsubmit = event => { event.preventDefault(); send($('chat_input').value); };
  $('chat_input').oninput = () => { $('send_chat').disabled = !$('chat_input').value.trim(); };
  $('toggle_chat').onclick = () => { const isOpen = !$('chat_panel').hidden; $('chat_panel').hidden = isOpen; $('toggle_chat').textContent = isOpen ? '開啟聊天' : '收起聊天'; $('toggle_chat').setAttribute('aria-expanded',String(!isOpen)); if (!isOpen) { $('chat_input').focus(); $('chat_history').scrollTop = $('chat_history').scrollHeight; } };
  for (const phrase of data.chat_behavior.source_phrases) { const button = el('button',phrase); button.onclick = () => send(phrase); $('quick_phrases').append(button); }
  for (const fact of [...data.chat_behavior.verified_in_client_code,data.chat_behavior.phrase_note]) $('chat_facts').append(el('li',fact));
  renderMessages();

  const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
  function validateImage(entry) {
    return new Promise(resolve => { const image = new Image(); image.onload = () => resolve({path:entry.path,ok:image.naturalWidth > 0,width:image.naturalWidth,height:image.naturalHeight}); image.onerror = () => resolve({path:entry.path,ok:false}); image.src = entry.path; });
  }
  async function validateAnimation(entry, renderer = 'canvas') {
    const holder = el('div'); holder.style.cssText = 'width:256px;height:256px'; $('testbed').append(holder);
    let animation;
    try {
      const raw = await loadAnimationData(entry);
      animation = lottie.loadAnimation({container:holder,renderer,loop:false,autoplay:false,animationData:structuredClone(raw),rendererSettings:{dpr:1}});
      await new Promise((resolve,reject) => {
        const timeout = setTimeout(() => reject(new Error('render timeout')),10000);
        const done = () => { clearTimeout(timeout); resolve(); };
        if (animation.isLoaded) done(); else animation.addEventListener('DOMLoaded',done);
        animation.addEventListener('data_failed',() => { clearTimeout(timeout); reject(new Error('data failed')); });
      });
      // Give the player its initial animation ticks before testing random seeks.
      animation.play(); await frame(); await frame(); animation.pause();
      const canvas = renderer === 'canvas' ? holder.querySelector('canvas') : document.createElement('canvas');
      if (renderer === 'svg') { canvas.width = 256; canvas.height = 256; }
      const context = canvas.getContext('2d',{willReadFrequently:true}); const samples = [];
      for (const fraction of [0,.25,.5,.75,.99]) {
        animation.goToAndStop((animation.totalFrames-1)*fraction,true); await frame();
        if (renderer === 'svg') {
          const svg = holder.querySelector('svg').cloneNode(true);
          svg.setAttribute('width','256'); svg.setAttribute('height','256');
          const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
          try {
            const image = new Image();
            await new Promise((resolve,reject) => { image.onload = resolve; image.onerror = () => reject(new Error('SVG rasterization failed')); image.src = url; });
            context.clearRect(0,0,256,256); context.drawImage(image,0,0,256,256);
          } finally { URL.revokeObjectURL(url); }
        }
        const pixels = context.getImageData(0,0,canvas.width,canvas.height).data;
        let visible = 0, hash = 2166136261;
        for (let n=0;n<pixels.length;n+=4) { if (pixels[n+3]) visible++; for (let j=0;j<4;j++) hash = Math.imul(hash ^ pixels[n+j],16777619) >>> 0; }
        samples.push({fraction,visible_pixels:visible,hash});
      }
      const ok = samples.some(s => s.visible_pixels > 0) && new Set(samples.map(s => s.hash)).size > 1;
      if (!ok && renderer === 'canvas') return await validateAnimation(entry,'svg');
      return {id:entry.id,name:entry.source_name,renderer,ok,frames:animation.totalFrames,samples};
    } catch (error) { return {id:entry.id,name:entry.source_name,ok:false,error:error.message}; }
    finally { if (animation) animation.destroy(); holder.remove(); }
  }
  $('validate').onclick = async () => {
    $('validate').disabled = true; $('validation_download').hidden = true;
    if (player) { player.pause(); $('pause').textContent = '播放'; }
    const report = {checked_at:new Date().toISOString(),renderer:'lottie-web 5.13.0 canvas, SVG fallback',animations:[],images:[],audio:[]};
    try {
      const images = [...data.avatars,...data.rings,...data.chat_assets,...data.animations.filter(a => a.thumbnail).map(a => a.thumbnail)];
      report.images = await Promise.all(images.map(validateImage));
      for (const entry of data.animations) {
        $('validation_status').textContent = `動畫 ${report.animations.length + 1} / ${data.animations.length}：${entry.source_name}`;
        report.animations.push(await validateAnimation(entry));
      }
      for (const entry of data.animations.flatMap(a => a.audio || [])) {
        const audio = new Audio(); audio.preload = 'metadata';
        report.audio.push(await new Promise(resolve => {
          const timer = setTimeout(() => resolve({path:entry.path,ok:false,error:'metadata timeout'}),5000);
          audio.onloadedmetadata = () => { clearTimeout(timer); resolve({path:entry.path,ok:audio.duration > 0,duration:audio.duration}); };
          audio.onerror = () => { clearTimeout(timer); resolve({path:entry.path,ok:false,error:'decode failed'}); };
          audio.src = entry.path;
        }));
        audio.removeAttribute('src'); audio.load();
      }
      report.summary = {animations:report.animations.length,animation_passes:report.animations.filter(x => x.ok).length,images:report.images.length,image_passes:report.images.filter(x => x.ok).length,audio:report.audio.length,audio_passes:report.audio.filter(x => x.ok).length};
      $('validation_status').textContent = `檢查完成。動畫 ${report.summary.animation_passes}/${report.summary.animations}，圖片 ${report.summary.image_passes}/${report.summary.images}，音效 ${report.summary.audio_passes}/${report.summary.audio}。`;
      const json = JSON.stringify(report,null,2); $('validation_json').textContent = json;
      const link = $('validation_download'); if (link.href.startsWith('blob:')) URL.revokeObjectURL(link.href); link.href = URL.createObjectURL(new Blob([json],{type:'application/json'})); link.hidden = false;
    } catch (error) { $('validation_status').textContent = `檢查未完成：${error.message}`; }
    finally { $('validate').disabled = false; }
  };
  setTab('avatars');
})();
