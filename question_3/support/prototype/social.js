/* Local interaction prototype. Source behaviors: support/research/coinpoker_prototype_research.md. */
(() => {
  'use strict';
  const stage = document.getElementById('mjg-stage');
  const assetRoot = 'support/coinpoker_assets/';
  const storageKey = 'coinmahjong.question3.social.v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const icon = path => `<img class="cms-icon" src="${path}" alt="">`;
  const icons = {
    chat: assetRoot + 'chat/sprites/cp_chatbticon_1490.png',
    lock: 'support/research/ui_assets/3bet_lock_983.png',
    club: 'support/research/ui_assets/3_bet_logo_1175.png',
    recent: 'support/research/ui_assets/emojirecentscategoryicon_1110.png',
    copy: assetRoot + 'chat/sprites/copy_1447.png',
    reply: assetRoot + 'chat/sprites/reply_987.png',
    quick: assetRoot + 'chat/sprites/predefinedmsgicon_942.png',
  };
  const settingsIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 3-.6 2.5-2 .9-2.3-.7-2 3.5 1.7 1.8v2l-1.7 1.8 2 3.5 2.3-.7 2 .9L9 21h4l.6-2.5 2-.9 2.3.7 2-3.5-1.7-1.8v-2l1.7-1.8-2-3.5-2.3.7-2-.9L13 3Z"/><circle cx="11" cy="12" r="3"/></svg>';
  const profileIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
  const rings = { normal: assetRoot+'rings/unity/avatarcircle_1513.png', member: assetRoot+'rings/unity/3bet_border_1439.png' };
  // Preview-only allocation, independent of membership and stable until reload.
  const demoRings = [
    { name:'Silver', path:'rings/unity/ring_skill_score_silver_897.png', faceSize:'92%' },
    { name:'Gold', path:'rings/unity/ring_skill_score_golden_1328.png', faceSize:'92%' },
    { name:'3-Bet', path:'rings/unity/3bet_border_1439.png', faceSize:'92%' },
    { name:'Live', path:'rings/unity/livering_1107.png', faceSize:'84%' },
    { name:'AIC', path:'rings/electron/aic-avatar-ring.0989b1e4.webp', faceSize:'92%' },
  ];
  function shuffledRings() {
    const choices=[...demoRings];
    for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
    return choices;
  }
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Start with defaults if storage is unavailable or corrupt. */ }
  const defaults = { throwables:true, sound:true, muteSpectators:false, hideBubbles:false, muteAll:false };
  const prefs = Object.fromEntries(Object.entries(defaults).map(([key,value]) => [key, typeof saved.prefs?.[key] === 'boolean' ? saved.prefs[key] : value]));
  const state = { avatars:[], assets:[], member:saved.member === true, avatar:Number(saved.avatar)||1, recents:[], players:[], prefs };
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify({ avatar:state.avatar, member:state.member, recents:state.recents, prefs })); } catch { /* Session interaction remains available without persistence. */ } };
  const ui = document.createElement('div'); ui.className='cms-ui'; ui.id='cms-ui'; document.body.append(ui);
  function syncTableBounds() {
    const rect=stage.getBoundingClientRect();
    Object.assign(ui.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});
    ui.style.setProperty('--cms-table-width',rect.width+'px');
    ui.style.setProperty('--cms-table-height',rect.height+'px');
    ui.style.setProperty('--cms-control-scale',Math.min(1,rect.width/1440));
    ui.style.setProperty('--cms-table-center-x',(rect.left+rect.width/2)+'px');
    ui.style.setProperty('--cms-table-center-y',(rect.top+rect.height/2)+'px');
  }
  syncTableBounds();
  window.addEventListener('resize',syncTableBounds);
  ui.innerHTML = `
    <header class="cms-window-header cms-mobile" aria-label="Window settings"><button class="cms-toolbar-button" id="cms-mobile-settings" aria-label="Settings" title="Settings" aria-haspopup="dialog" aria-controls="cms-settings" aria-expanded="false">${settingsIcon}</button></header>
    <nav class="cms-toolbar" aria-label="Table social controls">
      <button class="cms-toolbar-button" id="cms-chat-toggle" aria-label="Open table chat" aria-expanded="false" aria-controls="cms-chat">${icon(icons.chat)}<span class="cms-toolbar-label">Chat</span><span class="cms-unread" hidden></span></button>
      <button class="cms-toolbar-button cms-mobile" id="cms-mobile-players" aria-label="Players">♙</button>
      <button class="cms-toolbar-button cms-mobile" id="cms-mobile-demo" aria-label="Prototype controls">⋯</button>
    </nav>
    <dialog class="cms-dialog" id="cms-settings" aria-labelledby="cms-settings-title">
      <header class="cms-dialog-header"><h2 class="cms-title" id="cms-settings-title">Settings</h2><button class="cms-icon-button" data-close="cms-settings" aria-label="Close settings">✕</button></header>
      <div class="cms-tabs" role="tablist" aria-label="Settings sections"><button class="cms-tab" role="tab" id="cms-tab-avatars" aria-selected="true" aria-controls="cms-avatars-content">Avatars</button><button class="cms-tab" role="tab" id="cms-tab-interactions" aria-selected="false" aria-controls="cms-interactions-content">Interactions</button></div>
      <section class="cms-settings-content" id="cms-avatars-content" role="tabpanel" aria-labelledby="cms-tab-avatars"></section>
      <section class="cms-settings-content" id="cms-interactions-content" role="tabpanel" aria-labelledby="cms-tab-interactions" hidden></section>
    </dialog>
    <dialog class="cms-dialog cms-member-dialog" id="cms-member-dialog" aria-labelledby="cms-member-title"><img src="${icons.club}" alt="3-Bet Club"><h2 class="cms-title" id="cms-member-title">For 3-Bet Club members</h2><p>Unlock exclusive avatars, emotes and throwables with your membership.</p><button class="cms-text-button cms-primary" data-close="cms-member-dialog">Got it</button></dialog>
    <dialog class="cms-dialog cms-profile" id="cms-profile" aria-labelledby="cms-profile-title"><header class="cms-dialog-header"><h2 class="cms-title" id="cms-profile-title">Profile</h2><button class="cms-icon-button" data-close="cms-profile" aria-label="Close player profile">✕</button></header><div class="cms-profile-main"></div></dialog>
    <dialog class="cms-dialog cms-profile" id="cms-players" aria-labelledby="cms-players-title"><header class="cms-dialog-header"><h2 class="cms-title" id="cms-players-title">Players</h2><button class="cms-icon-button" data-close="cms-players" aria-label="Close players">✕</button></header><div id="cms-players-list"></div></dialog>
    <dialog class="cms-dialog cms-profile" id="cms-demo-dialog" aria-labelledby="cms-demo-title"><header class="cms-dialog-header"><h2 class="cms-title" id="cms-demo-title">Prototype controls</h2><button class="cms-icon-button" data-close="cms-demo-dialog" aria-label="Close prototype controls">✕</button></header><div class="cms-demo-panel"></div></dialog>
    <div id="cms-toast" class="cms-toast" role="status" hidden></div>`;
  let toastTimer;
  function toast(message) { const el=$('#cms-toast');el.textContent=message;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2800); }
  const showDialog = id => { closePicker(); const dialog=$('#'+id);if(!dialog.open)dialog.showModal(); };
  function locked() { showDialog('cms-member-dialog'); }
  ui.addEventListener('click', event => { const button=event.target.closest('[data-close]');if(button)$('#'+button.dataset.close).close(); });
  $$('.cms-dialog').forEach(dialog => dialog.addEventListener('click', event => { if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();} }));
  const avatarData = id => state.avatars.find(a=>a.id===id)||state.avatars[0];
  function avatarMarkup(player, extra='') {
    const a=avatarData(player.avatar), ring=player.demoRing;
    return `<span class="cms-avatar ${extra}" style="--cms-avatar-face-size:${ring?.faceSize||'84%'}"><img class="cms-avatar-face" src="${assetRoot+a.path}" alt=""><img class="cms-avatar-ring" src="${ring?assetRoot+ring.path:player.member?rings.member:rings.normal}" data-ring-name="${ring?ring.name:'Default'}" alt=""></span>`;
  }
  const me = () => state.players[0];
  const activePlayers = () => state.players.filter(p=>p.active);
  function profile(player) { $('#cms-profile .cms-profile-main').innerHTML=`${avatarMarkup(player)}<h3>${escape(player.name)}</h3><p class="cms-muted">${player.wind} seat${player.member?' · 3-Bet Club':''}</p>`;showDialog('cms-profile'); }
  const profileLabel = player => player.id===0?'View your profile':`View ${player.name}'s profile`;
  function socialAvatar(player) {
    const label=player.id===0?'Choose an emote':`Throw to ${player.name}`;
    return `<button type="button" class="cms-avatar-button" data-social-player="${player.id}" aria-label="${escape(label)}" aria-controls="cms-picker" aria-expanded="false">${avatarMarkup(player)}</button>`;
  }
  function profileButton(player) {
    return `<button type="button" class="cms-icon-button cms-profile-button" data-profile="${player.id}" aria-label="${escape(profileLabel(player))}" title="Profile" aria-haspopup="dialog" aria-controls="cms-profile">${profileIcon}</button>`;
  }
  function renderPlayers() {
    closePicker();
    state.players.forEach(player => {
      const row=$('#player-info-'+player.id),old=$('.cm-avatar, .cms-avatar-button',row);
      if(old)old.outerHTML=socialAvatar(player);
      $('.cms-profile-button',row)?.remove();
      $('.cm-wind-tile',row).insertAdjacentHTML('beforebegin',profileButton(player));
      row.classList.toggle('cm-player-row--hidden',!player.active);row.inert=!player.active;
      const centerAvatar=$('.cm-center-indicator__plate--'+['bottom','right','top','left'][player.id]+' .cm-center-indicator__plate-face img');
      if(centerAvatar)centerAvatar.src=assetRoot+avatarData(player.avatar).path;
    });
    let seats=$('#cms-seats');if(!seats){seats=document.createElement('div');seats.id='cms-seats';seats.className='cms-seats';stage.append(seats);}
    seats.innerHTML=activePlayers().map(p=>`<div class="cms-seat" data-player="${p.id}">${socialAvatar(p)}<span class="cms-seat-name">${escape(p.name)}${p.id===0?' · You':''}</span></div>`).join('');
    $('#cms-players-list').innerHTML=activePlayers().map(p=>`<div class="cms-player-mobile-row">${socialAvatar(p)}<span class="cms-player-mobile-name">${escape(p.name)}</span>${profileButton(p)}<span class="cm-wind-tile">${['東','南','西','北'][p.id]}</span></div>`).join('');
    $$('[data-profile]').forEach(b=>b.onclick=()=>{if($('#cms-players').open)$('#cms-players').close();profile(state.players[Number(b.dataset.profile)]);});
    $$('[data-social-player]').forEach(bindAvatarInteraction);
    renderChatAvatars();
  }
  function bindAvatarInteraction(button) {
    const target=Number(button.dataset.socialPlayer),kind=target===0?'emote':'throw';
    button.addEventListener('pointerenter',event=>{
      if(event.pointerType!=='mouse')return;
      clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);
      hoverOpenTimer=setTimeout(()=>{
        if(button.isConnected&&button.matches(':hover'))openPicker(kind,target,button,'hover');
      },180);
    });
    button.addEventListener('pointerleave',()=>{
      clearTimeout(hoverOpenTimer);
      if(pickerAnchor===button)schedulePickerClose();
    });
    button.onclick=()=>openPicker(kind,target,button,'click');
    button.addEventListener('keydown',event=>{
      if(event.key==='ArrowDown'){event.preventDefault();openPicker(kind,target,button,'keyboard');}
    });
  }
  function renderAvatars() {
    const content=$('#cms-avatars-content');const scroll=content.scrollTop;
    const groups=[['3-BET CLUB','3-Bet Club configuration'],['WORLD CUP','World Cup'],...['ANIMAL','ANIME','HALLOWEEN','NOBLE','ROYAL'].map(g=>[g,g])];
    content.innerHTML=`<div class="cms-avatar-preview">${avatarMarkup(me())}<div><strong>${escape(me().name)}</strong><span class="cms-muted">${state.member?'3-Bet Club member':'Choose your table avatar'}</span><p class="cms-muted" style="font-size:12px;margin:5px 0 0">Changes apply immediately.</p></div></div>`+groups.map(([label,group],index)=>`<section class="cms-avatar-group"><div class="cms-group-heading"><h3>${label}</h3>${index<2?`<div><button class="cms-icon-button" data-scroll="${index}" data-direction="-1" aria-label="Previous ${label} avatars">‹</button><button class="cms-icon-button" data-scroll="${index}" data-direction="1" aria-label="Next ${label} avatars">›</button></div>`:''}</div><div class="cms-avatar-list" data-group="${index}">${state.avatars.filter(a=>a.group===group).map(a=>`<button class="cms-avatar-option" data-avatar="${a.id}" data-locked="${a.id>=2000&&!state.member}" aria-label="Select ${label} avatar ${a.id}" aria-pressed="${state.avatar===a.id}"><img src="${assetRoot+a.path}" alt="">${a.id>=2000&&!state.member?`<img class="cms-lock" src="${icons.lock}" alt="Members only">`:''}</button>`).join('')}</div></section>`).join('');
    content.scrollTop=scroll;
    $$('[data-avatar]',content).forEach(b=>b.addEventListener('click',()=>{
      const id=Number(b.dataset.avatar);if(id>=2000&&!state.member){locked();return;}
      state.avatar=id;me().avatar=id;save();
      // Update in place so horizontal scroll and keyboard focus stay intact.
      $$('[data-avatar]',content).forEach(option=>option.setAttribute('aria-pressed',String(Number(option.dataset.avatar)===id)));
      $('.cms-avatar-preview .cms-avatar',content).outerHTML=avatarMarkup(me());renderPlayers();toast('Avatar updated');
    }));
    $$('[data-scroll]',content).forEach(b=>b.addEventListener('click',()=> $(`[data-group="${b.dataset.scroll}"]`,content).scrollBy({left:Number(b.dataset.direction)*240,behavior:'smooth'})));
  }
  function openSettings(tab='avatars') { if(!me())return;renderAvatars();selectTab(tab);showDialog('cms-settings');settingsButton.setAttribute('aria-expanded','true');$('#cms-mobile-settings').setAttribute('aria-expanded','true'); }
  function selectTab(tab) { ['avatars','interactions'].forEach(name=>{const selected=name===tab;$('#cms-tab-'+name).setAttribute('aria-selected',String(selected));$('#cms-tab-'+name).tabIndex=selected?0:-1;$('#cms-'+name+'-content').hidden=!selected;}); }
  $('#cms-tab-avatars').onclick=()=>selectTab('avatars');$('#cms-tab-interactions').onclick=()=>selectTab('interactions');
  $('.cms-tabs').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const next=e.target.id==='cms-tab-avatars'?'interactions':'avatars';selectTab(next);$('#cms-tab-'+next).focus();}});
  const settings=[['throwables','Enable throwables','Allow throwable effects at this table.'],['sound','Emoji Playing','Play the sound attached to an emote or throwable.']];
  function settingMarkup(key,title,detail='') { return `<label class="cms-setting-row"><span>${title}${detail?`<small>${detail}</small>`:''}</span><input type="checkbox" class="cms-switch" data-pref="${key}" ${prefs[key]?'checked':''}></label>`; }
  function syncPreferences() {$$('[data-pref]').forEach(input=>input.checked=prefs[input.dataset.pref]);save();}
  $('#cms-interactions-content').innerHTML=settings.map(s=>settingMarkup(...s)).join('');
  ui.addEventListener('change',event=>{const key=event.target.dataset.pref;if(!key)return;prefs[key]=event.target.checked;syncPreferences();preferencesChanged(key);});
  function demoMarkup() { return `<p>Local demo · No real players or purchases.</p><div class="cms-demo-actions"><a href="?table=japanese-full-b1">4 players</a><a href="?table=kansai-full-b1">3 players</a><a href="?table=japanese-east-b1">Waiting</a></div><label class="cms-setting-row"><span>3-Bet Club membership</span><input class="cms-switch" type="checkbox" data-demo-member ${state.member?'checked':''}></label><div class="cms-demo-actions"><button data-demo="chat">Incoming chat</button><button data-demo="emote">Emote</button><button data-demo="throw">Throw</button></div><div class="cms-demo-actions"><button data-demo="spectator">Spectator</button><button data-demo="history">Chat history</button><button data-demo="clear">Clear chat</button><button data-demo="error">Send error</button></div>`; }
  function renderDemo() {
    let demo=$('#cms-demo');if(!demo){demo=document.createElement('details');demo.id='cms-demo';demo.className='cms-demo';stage.append(demo);}
    const isOpen=demo.open;demo.innerHTML='<summary>Prototype <span>Demo controls</span></summary><div class="cms-demo-panel">'+demoMarkup()+'</div>';demo.open=isOpen;
    $('#cms-demo-dialog .cms-demo-panel').innerHTML=demoMarkup();
    $$('[data-demo-member]').forEach(input=>input.addEventListener('change',()=>{
      state.member=input.checked;me().member=state.member;
      if(!state.member&&state.avatar>=2000){state.avatar=1;me().avatar=1;}
      save();renderPlayers();renderAvatars();renderDemo();refreshPicker();
    }));
    $$('[data-demo]').forEach(b=>b.addEventListener('click',()=>demoAction(b.dataset.demo)));
  }
  $('#cms-mobile-settings').onclick=()=>openSettings();$('#cms-mobile-players').onclick=()=>showDialog('cms-players');$('#cms-mobile-demo').onclick=()=>showDialog('cms-demo-dialog');
  const settingsButton=$('.cm-settings-stack .cm-dropdown-field');
  settingsButton.id='cms-header-settings';settingsButton.className='cm-icon-button cms-header-settings';
  settingsButton.innerHTML=settingsIcon;settingsButton.setAttribute('aria-label','Settings');settingsButton.title='Settings';
  settingsButton.setAttribute('aria-haspopup','dialog');settingsButton.setAttribute('aria-controls','cms-settings');settingsButton.onclick=()=>openSettings();
  $('.cm-balance-pill__actions').prepend(settingsButton);
  $('#cms-settings').addEventListener('close',()=>{settingsButton.setAttribute('aria-expanded','false');$('#cms-mobile-settings').setAttribute('aria-expanded','false');});
  $$('.cm-settings-stack .cm-toggle-field').forEach(b=>{b.setAttribute('aria-pressed','false');b.onclick=()=>{const on=b.getAttribute('aria-pressed')!=='true';b.dataset.isSelected=String(on);b.setAttribute('aria-pressed',String(on));};});
  async function getJSON(path) {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    try {const response=await fetch(path,{signal:controller.signal});if(!response.ok)throw new Error('Could not load '+path);return await response.json();}
    finally {clearTimeout(timeout);}
  }
  // Feature modules share player identity and preferences, without a server connection.
  let pickerKind=null, pickerTarget=0, pickerAnchor=null, category='Dogs';
  let hoverOpenTimer,hoverCloseTimer,pickerByHover=false;
  const categories=['Recents','Dogs','Penguin','Donkey','Chips','Skull','Pepe'];
  const categoryIcons={Recents:icons.recent,Dogs:assetRoot+'emotes/thumbnails/emoji_lottie_58_1115.png',Penguin:assetRoot+'emotes/thumbnails/41_emoji_image_1319.png',Donkey:assetRoot+'emotes/thumbnails/23_emoji_image_979.png',Chips:assetRoot+'emotes/thumbnails/chip4_1196.png',Skull:'support/research/ui_assets/skull_category_icon_1104.png',Pepe:assetRoot+'emotes/thumbnails/pepe_ne_5001_1365.png'};
  const picker=document.createElement('section');picker.id='cms-picker';picker.className='cms-picker';picker.hidden=true;picker.setAttribute('aria-label','Emotes and throwables');
  picker.innerHTML=`<header class="cms-picker-header"><h2 id="cms-picker-title"></h2><button class="cms-icon-button" id="cms-picker-close" aria-label="Close emotes">✕</button></header><div class="cms-picker-grid" id="cms-picker-grid"></div><div class="cms-categories" id="cms-categories" role="tablist" aria-label="Emote categories"></div><img class="cms-picker-pointer" src="support/research/ui_assets/pointerarrow_1304.png" alt="">`;
  ui.append(picker);
  function clearTargets() {$$('.cms-target').forEach(el=>el.classList.remove('cms-target'));$$('[data-target="true"]').forEach(el=>delete el.dataset.target);}
  function closePicker(restoreFocus=false) {
    clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);
    picker.hidden=true;pickerKind=null;pickerByHover=false;clearTargets();
    pickerAnchor?.setAttribute('aria-expanded','false');
    if(restoreFocus&&pickerAnchor?.isConnected)pickerAnchor.focus({preventScroll:true});
  }
  function schedulePickerClose() {
    clearTimeout(hoverCloseTimer);
    if(pickerByHover)hoverCloseTimer=setTimeout(()=>closePicker(),300);
  }
  picker.addEventListener('pointerenter',()=>clearTimeout(hoverCloseTimer));
  picker.addEventListener('pointerleave',schedulePickerClose);
  picker.addEventListener('pointerdown',()=>{pickerByHover=false;clearTimeout(hoverCloseTimer);});
  picker.addEventListener('focusin',()=>{pickerByHover=false;clearTimeout(hoverCloseTimer);});
  $('#cms-picker-close').onclick=()=>closePicker(true);
  function openPicker(kind,target,anchor,source='click') {
    clearTimeout(hoverOpenTimer);clearTimeout(hoverCloseTimer);
    if(!me()?.active||!state.players[target]?.active)return;
    if(kind==='throw'&&!prefs.throwables){if(source!=='hover')toast('Throwables are off. Enable them in Settings.');return;}
    if(!picker.hidden&&pickerKind===kind&&pickerTarget===target&&pickerAnchor===anchor){
      if(source==='hover')return;
      if(!pickerByHover&&source==='click'){closePicker();return;}
      pickerByHover=false;$('#cms-picker-close').focus({preventScroll:true});return;
    }
    if($('#cms-players').contains(anchor)){$('#cms-players').close();anchor=$('#cms-mobile-players');}
    closePicker();closeChat(false);
    pickerKind=kind;pickerTarget=target;pickerAnchor=anchor;pickerByHover=source==='hover';
    picker.dataset.kind=kind;picker.hidden=false;anchor.setAttribute('aria-expanded','true');
    if(kind==='throw'){$('#player-info-'+target).classList.add('cms-target');$(`.cms-seat[data-player="${target}"]`).dataset.target='true';}
    refreshPicker();positionPicker();
    if(source!=='hover')$('#cms-picker-close').focus({preventScroll:true});
  }
  function positionPicker() {
    if(picker.hidden||!pickerAnchor?.isConnected)return;
    const r=pickerAnchor.getBoundingClientRect(),bounds=ui.getBoundingClientRect();
    const width=picker.offsetWidth,height=picker.offsetHeight,gap=12,margin=12;
    const x=r.left-bounds.left,y=r.top-bounds.top,cx=x+r.width/2,cy=y+r.height/2;
    const candidates={
      above:{left:cx-width/2,top:y-height-gap},below:{left:cx-width/2,top:y+r.height+gap},
      left:{left:x-width-gap,top:cy-height/2},right:{left:x+r.width+gap,top:cy-height/2}
    };
    const order=pickerAnchor.closest('.cm-player-row')?['left','right','above','below']:['above','below','right','left'];
    const positions=order.map(side=>{
      const raw=candidates[side],left=Math.max(margin,Math.min(raw.left,bounds.width-width-margin)),top=Math.max(margin,Math.min(raw.top,bounds.height-height-margin));
      const overlap=Math.max(0,Math.min(left+width,x+r.width)-Math.max(left,x))*Math.max(0,Math.min(top+height,y+r.height)-Math.max(top,y));
      return {side,left,top,overlap};
    });
    const best=positions.find(p=>p.overlap===0)||positions.sort((a,b)=>a.overlap-b.overlap)[0];
    picker.style.left=best.left+'px';picker.style.top=best.top+'px';picker.dataset.side=best.side;
    const pointer=$('.cms-picker-pointer',picker);
    pointer.style.left=['above','below'].includes(best.side)?Math.max(16,Math.min(width-32,cx-best.left-9))+'px':'';
    pointer.style.top=['left','right'].includes(best.side)?Math.max(16,Math.min(height-32,cy-best.top-6))+'px':'';
  }
  function refreshPicker() {
    if(picker.hidden)return;
    $('#cms-picker-title').textContent=pickerKind==='emote'?category:`Throw to ${state.players[pickerTarget].name}`;
    const items=pickerKind==='throw'?state.assets.filter(a=>a.kind==='throwable'):category==='Recents'?state.recents.map(id=>state.assets.find(a=>a.id===id)).filter(Boolean):state.assets.filter(a=>a.kind==='emote'&&a.category===category);
    $('#cms-picker-grid').innerHTML=items.length?items.map(a=>`<button class="cms-asset-button" data-asset="${a.id}" data-locked="${a.client_member_locked&&!state.member}" aria-label="Play ${escape(a.composition_name||a.source_name)}" title="${escape(a.composition_name||a.source_name)}"><img src="${a.thumbnail.path}" alt="">${a.client_member_locked&&!state.member?`<img class="cms-lock" src="${icons.lock}" alt="Members only">`:''}</button>`).join(''):'<p class="cms-picker-empty">Your recent emotes will appear here.</p>';
    const tabs=$('#cms-categories');tabs.hidden=pickerKind!=='emote';
    tabs.innerHTML=categories.map(name=>`<button class="cms-category" role="tab" aria-label="${name}" aria-selected="${category===name}" tabindex="${category===name?0:-1}" title="${name}">${icon(categoryIcons[name])}</button>`).join('');
    $$('[role="tab"]',tabs).forEach(b=>{b.onclick=()=>{category=b.getAttribute('aria-label');refreshPicker();$(`[aria-label="${category}"]`,tabs).focus();};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();category=categories[(categories.indexOf(category)+(e.key==='ArrowRight'?1:6))%7];refreshPicker();$(`[aria-label="${category}"]`,tabs).focus();};});
    $$('[data-asset]',$('#cms-picker-grid')).forEach(b=>b.onclick=()=>{
      const asset=state.assets.find(a=>a.id===Number(b.dataset.asset));
      if(asset.client_member_locked&&!state.member){locked();return;}
      const kind=pickerKind,target=pickerTarget;
      if(kind==='emote'){state.recents=[asset.id,...state.recents.filter(id=>id!==asset.id)].slice(0,10);save();}
      closePicker(true);playEffect(asset.id,0,kind==='throw'?target:0);
    });
  }
  const effects=document.createElement('div');effects.id='cms-effects';effects.className='cms-effects';effects.setAttribute('aria-hidden','true');stage.append(effects);
  const activeEffects=new Map(), animationCache=new Map();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function seatPoint(id) { const element=$(`.cms-seat[data-player="${id}"]`);if(!element)return null;return {x:element.offsetLeft,y:element.offsetTop-12}; }
  function destroyEffect(key) {const record=activeEffects.get(key);if(!record)return;clearTimeout(record.timer);clearTimeout(record.startTimer);record.animation?.destroy();record.travel?.cancel();record.audio?.pause();record.el.remove();activeEffects.delete(key);}
  async function playEffect(id,from=0,to=from) {
    const asset=state.assets.find(a=>a.id===id);if(!asset||!state.players[from]?.active||!state.players[to]?.active)return false;
    const thrown=asset.kind==='throwable';if(thrown&&!prefs.throwables)return false;
    const origin=seatPoint(from),target=seatPoint(to);if(!origin||!target)return false;
    const key=(thrown?'throw:':'emote:')+to;destroyEffect(key);
    const el=document.createElement('div');el.className='cms-effect';el.dataset.asset=id;el.dataset.target=to;el.dataset.from=from;
    const size=(thrown?180:160)*(asset.scale_override||1);el.style.width=size+'px';el.style.height=size+'px';el.style.left=(thrown?origin.x:target.x)+'px';el.style.top=(thrown?origin.y:target.y)+'px';effects.append(el);
    const record={el,animation:null,timer:null,audio:null};activeEffects.set(key,record);
    const stillCurrent=()=>activeEffects.get(key)===record&&state.players[from]?.active&&state.players[to]?.active;
    const fallback=()=>{if(!stillCurrent())return;el.style.left=target.x+'px';el.style.top=target.y+'px';el.innerHTML=`<img src="${asset.thumbnail.path}" alt="">`;record.timer=setTimeout(()=>destroyEffect(key),2200);};
    if(reducedMotion.matches){fallback();return true;}
    try {
      if(!window.lottie)throw new Error('Animation player is unavailable');
      if(!animationCache.has(asset.path))animationCache.set(asset.path,getJSON(asset.path).catch(error=>{animationCache.delete(asset.path);throw error;}));
      const data=await animationCache.get(asset.path);if(!stillCurrent())return false;
      record.animation=window.lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:structuredClone(data)});
      let remaining=asset.run_count_override||1;
      record.animation.addEventListener('complete',()=>{if(--remaining>0)record.animation.goToAndPlay(0,true);else destroyEffect(key);});
      record.animation.addEventListener('data_failed',()=>{record.animation?.destroy();fallback();toast('Animation unavailable. Showing its preview.');});
      record.animation.addEventListener('DOMLoaded',()=>{
        if(!stillCurrent())return;
        record.animation.goToAndStop(0,true);
        const start=()=>{
          if(!stillCurrent())return;
          record.animation.play();
          const audio=asset.audio?.[0];if(prefs.sound&&audio){record.audio=new Audio(audio.path);record.audio.volume=.35;record.audio.play().catch(()=>{});}
        };
        if(thrown){
          record.startTimer=setTimeout(()=>{
            if(!stillCurrent())return;
            record.travel=el.animate([{left:origin.x+'px',top:origin.y+'px'},{left:target.x+'px',top:target.y+'px'}],{duration:250,easing:'ease-in-out',fill:'forwards'});
            record.travel.onfinish=()=>{el.style.left=target.x+'px';el.style.top=target.y+'px';record.travel.cancel();start();};
          },300);
        } else start();
      });
      // A bounded lifetime also cleans up an interrupted renderer.
      record.timer=setTimeout(()=>destroyEffect(key),Math.min(30000,(asset.duration_seconds*(asset.run_count_override||1)+2)*1000));
    } catch {fallback();toast('Animation unavailable. Showing its preview.');}
    return true;
  }
  document.addEventListener('pointerdown',event=>{if(!picker.hidden&&!event.target.closest('#cms-picker,[data-social-player]'))closePicker();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!picker.hidden){event.preventDefault();closePicker(true);}});
  window.addEventListener('resize',positionPicker);

  let chatOpen=false, replyTo=null, pending=false, unread=0, chatCloseTimer, bubbleTimers=new Map(), messageSequence=0, failNextSend=false;
  const messages=[];
  const chat=document.createElement('section');chat.id='cms-chat';chat.className='cms-chat';chat.hidden=true;chat.dataset.open='false';chat.setAttribute('aria-label','Table chat');
  chat.innerHTML=`<header class="cms-chat-header"><div><h2>Table chat</h2><p>${escape($('#table-name').textContent)}</p></div><button id="cms-chat-options-button" class="cms-icon-button" aria-label="Chat options" aria-expanded="false">⋯</button><button id="cms-chat-close" class="cms-icon-button" aria-label="Close table chat">✕</button></header><div class="cms-messages" id="cms-messages" role="log" aria-label="Messages" aria-live="polite"></div><div id="cms-chat-options" class="cms-chat-popover cms-chat-options" hidden>${settingMarkup('muteSpectators','Mute spectator chat')}${settingMarkup('hideBubbles','Hide chat bubbles')}${settingMarkup('muteAll','Mute all chats')}</div><div class="cms-chat-popover cms-mentions" id="cms-mentions" hidden></div><div class="cms-chat-popover cms-quick-expanded" id="cms-quick-expanded" hidden><button data-quick="GG 👍">GG 👍</button><button data-quick="Fishy AF 🐠🐡">Fishy AF 🐠🐡</button></div><form class="cms-chat-footer" id="cms-chat-form"><div class="cms-reply-draft" id="cms-reply-draft" hidden><div><strong></strong><p></p></div><button type="button" class="cms-icon-button" id="cms-reply-cancel" aria-label="Cancel reply">✕</button></div><p class="cms-chat-error" id="cms-chat-error" role="alert" hidden></p><div class="cms-quick-row"><button type="button" data-quick="GG 👍">GG 👍</button><button type="button" data-quick="Fishy AF 🐠🐡">Fishy AF 🐠🐡</button><button type="button" class="cms-icon-button" id="cms-quick-toggle" aria-label="Quick messages" aria-expanded="false">${icon(icons.quick)}</button></div><div class="cms-input-row"><button type="button" class="cms-icon-button" id="cms-mention-toggle" aria-label="Mention a player" aria-expanded="false">@</button><input id="cms-chat-input" aria-label="Chat message" autocomplete="off" placeholder="Type here.."><button type="submit" class="cms-icon-button cms-send" id="cms-chat-send" aria-label="Send message" disabled>➤</button></div></form>`;
  ui.append(chat);
  const input=$('#cms-chat-input'), messageList=$('#cms-messages');
  function closeChatPopovers() {$('#cms-chat-options').hidden=true;$('#cms-mentions').hidden=true;$('#cms-quick-expanded').hidden=true;['cms-chat-options-button','cms-mention-toggle','cms-quick-toggle'].forEach(id=>$('#'+id).setAttribute('aria-expanded','false'));}
  function setReply(message) {replyTo=message;const draft=$('#cms-reply-draft');draft.hidden=!message;if(message){$('strong',draft).textContent='Replying to '+message.author.name;$('p',draft).textContent=message.text;} }
  function setChatExpanded(value) {const toggle=$('#cms-chat-toggle');toggle.setAttribute('aria-expanded',String(value));toggle.setAttribute('aria-label',value?'Close table chat':'Open table chat');}
  function openChat() {clearTimeout(chatCloseTimer);closePicker();closeChatPopovers();setReply(null);chatOpen=true;unread=0;updateUnread();chat.hidden=false;requestAnimationFrame(()=>chat.dataset.open='true');setChatExpanded(true);renderMessages();input.focus({preventScroll:true});scrollToLatest();}
  function closeChat(restoreFocus=true) {if(!chatOpen)return;chatOpen=false;chat.dataset.open='false';setChatExpanded(false);setReply(null);closeChatPopovers();chatCloseTimer=setTimeout(()=>chat.hidden=true,100);if(restoreFocus)$('#cms-chat-toggle').focus({preventScroll:true});}
  $('#cms-chat-toggle').onclick=()=>chatOpen?closeChat():openChat();$('#cms-chat-close').onclick=()=>closeChat();
  function updateUnread() {const badge=$('.cms-unread');badge.hidden=!unread;badge.textContent=unread>9?'9+':String(unread);}
  function scrollToLatest() {setTimeout(()=>{if(chatOpen)messageList.scrollTop=messageList.scrollHeight;},50);}
  function renderMessages() {
    if(!messages.length){messageList.innerHTML=`<div class="cms-empty-chat"><img src="${assetRoot}chat/sprites/nochat_1434.png" alt=""><strong>Start Chatting</strong><span>Say hello to the table.</span></div>`;return;}
    messageList.innerHTML=messages.map(m=>`<article class="cms-message" data-message="${m.id}" data-own="${m.author.id===0}"><span data-chat-avatar="${m.author.id}">${avatarMarkup(m.author)}</span><div class="cms-message-content"><div class="cms-message-meta"><strong>${escape(m.author.name)}${m.spectator?' · Spectator':''}</strong><time>${escape(m.time)}</time></div><div class="cms-message-body">${m.reply?`<blockquote class="cms-message-quote"><strong>${escape(m.reply.name)}</strong>${escape(m.reply.text)}</blockquote>`:''}<div class="cms-message-text">${escape(m.text)}</div><button class="cms-message-actions-trigger" aria-label="Message actions" aria-expanded="false">⋯</button></div><div class="cms-message-menu" hidden><button data-message-action="reply">${icon(icons.reply)}Reply</button><button data-message-action="copy">${icon(icons.copy)}Copy</button></div></div></article>`).join('');
    $$('.cms-message',messageList).forEach(el=>{
      const message=messages.find(m=>m.id===Number(el.dataset.message));const menu=$('.cms-message-menu',el);const toggle=$('.cms-message-actions-trigger',el);
      toggle.onclick=()=>{const open=menu.hidden;$$('.cms-message-menu',messageList).forEach(m=>m.hidden=true);$$('.cms-message-actions-trigger',messageList).forEach(b=>b.setAttribute('aria-expanded','false'));menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));};
      el.addEventListener('pointerleave',()=>{if(!el.contains(document.activeElement)){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}});
      $('[data-message-action="reply"]',el).onclick=()=>{setReply(message);menu.hidden=true;input.focus();};
      $('[data-message-action="copy"]',el).onclick=async()=>{try{await navigator.clipboard.writeText(message.text);toast('Message copied');}catch{toast('Copy is unavailable. Select the message text to copy.');}menu.hidden=true;};
    });
  }
  function renderChatAvatars() {$$('[data-chat-avatar]').forEach(el=>{const player=state.players[Number(el.dataset.chatAvatar)];if(player)el.innerHTML=avatarMarkup(player);});messages.forEach(m=>{if(m.author.id===0){m.author.avatar=state.avatar;m.author.member=state.member;}});}
  function showBubble(player,text) {if(!player?.active||prefs.hideBubbles)return;const seat=$(`.cms-seat[data-player="${player.id}"]`);if(!seat)return;clearTimeout(bubbleTimers.get(player.id));$('.cms-bubble',seat)?.remove();const bubble=document.createElement('div');bubble.className='cms-bubble';bubble.textContent=text;seat.append(bubble);bubbleTimers.set(player.id,setTimeout(()=>{bubble.remove();bubbleTimers.delete(player.id);},3000));}
  function receiveChat({from=1,text,reply=null,spectator=false,chatBubble=true}={}) {
    if(typeof text!=='string'||!text.trim())return false;
    const author=spectator?{id:-1,name:'TableGuest',avatar:3,member:false}:state.players[from];
    if(!author||(!spectator&&!author.active))return false;
    if((prefs.muteAll&&author.id!==0)||(prefs.muteSpectators&&spectator))return false;
    messages.push({id:++messageSequence,author:{...author},text,spectator,reply,time:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})});
    renderMessages();scrollToLatest();if(!chatOpen&&author.id!==0){unread++;updateUnread();}
    if(chatBubble&&!spectator)showBubble(author,text);
    return true;
  }
  const updateSend=()=>$('#cms-chat-send').disabled=pending||!input.value.trim();
  async function sendMessage(text=input.value) {
    if(pending||!text.trim())return;
    if(!me()?.active){$('#cms-chat-error').textContent='Take a seat before sending a message.';$('#cms-chat-error').hidden=false;return;}
    const draft=input.value, reply=replyTo?{name:replyTo.author.name,text:replyTo.text}:null;
    pending=true;updateSend();$('#cms-chat-error').hidden=true;closeChatPopovers();
    await new Promise(resolve=>setTimeout(resolve,80));
    if(failNextSend){failNextSend=false;$('#cms-chat-error').textContent='Message not sent. Please try again.';$('#cms-chat-error').hidden=false;}
    else {receiveChat({from:0,text,reply});if(input.value===draft)input.value='';setReply(null);}
    pending=false;updateSend();if(chatOpen)input.focus({preventScroll:true});
  }
  $('#cms-chat-form').onsubmit=e=>{e.preventDefault();sendMessage();};input.addEventListener('input',updateSend);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.isComposing)e.preventDefault();});
  $('#cms-reply-cancel').onclick=()=>{setReply(null);input.focus();};
  $$('[data-quick]',chat).forEach(b=>b.onclick=()=>sendMessage(b.dataset.quick));
  function toggleChatPopover(id,button) {const wasOpen=!$('#'+id).hidden;closeChatPopovers();$('#'+id).hidden=wasOpen;button.setAttribute('aria-expanded',String(!wasOpen));}
  $('#cms-chat-options-button').onclick=e=>toggleChatPopover('cms-chat-options',e.currentTarget);
  $('#cms-quick-toggle').onclick=e=>toggleChatPopover('cms-quick-expanded',e.currentTarget);
  $('#cms-mention-toggle').onclick=e=>{const list=$('#cms-mentions');list.innerHTML=activePlayers().filter(p=>p.id!==0).map(p=>`<button data-mention="${p.id}">${avatarMarkup(p)}@${escape(p.name)}</button>`).join('');$$('[data-mention]',list).forEach(b=>b.onclick=()=>{input.value='@'+state.players[Number(b.dataset.mention)].name+' ';updateSend();closeChatPopovers();input.focus();input.setSelectionRange(input.value.length,input.value.length);});toggleChatPopover('cms-mentions',e.currentTarget);};
  chat.addEventListener('pointerdown',event=>{if(!event.target.closest('.cms-chat-popover,#cms-chat-options-button,#cms-mention-toggle,#cms-quick-toggle'))closeChatPopovers();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&chatOpen&&!$$('dialog[open]').length){event.preventDefault();closeChat();}});
  document.addEventListener('pointerdown',event=>{if(chatOpen&&!event.target.closest('.cms-ui,.cms-demo,.cm-table-right-column,.cms-seats'))closeChat(false);});
  function preferencesChanged(key) {
    if(key==='throwables'&&!prefs.throwables){closePicker();for(const key of activeEffects.keys())if(key.startsWith('throw:'))destroyEffect(key);}
    if(key==='sound'&&!prefs.sound)for(const effect of activeEffects.values())effect.audio?.pause();
    if(key==='hideBubbles'&&prefs.hideBubbles){$$('.cms-bubble').forEach(b=>b.remove());for(const timer of bubbleTimers.values())clearTimeout(timer);bubbleTimers.clear();}
  }
  function demoAction(action) {
    const other=activePlayers().find(p=>p.id!==0);if(!other&&['chat','emote','throw'].includes(action)){toast('There are no opponents seated.');return;}
    if(action==='chat'){const accepted=receiveChat({from:other.id,text:'Good luck, everyone!'});if(!accepted)toast('Incoming chat was muted by your settings.');}
    if(action==='emote')playEffect(56,other.id,other.id);
    if(action==='throw'){if(!prefs.throwables)toast('Throwables are off.');else playEffect(119,other.id,0);}
    if(action==='spectator'){const accepted=receiveChat({text:'Enjoying this table!',spectator:true});if(!accepted)toast('Spectator chat was muted by your settings.');}
    if(action==='history'){for(let i=0;i<24;i++)receiveChat({from:activePlayers()[i%activePlayers().length].id,text:['Good luck!','Nice hand.','That was close.','GG 👍'][i%4],chatBubble:false});openChat();}
    if(action==='clear'){messages.length=0;renderMessages();unread=0;updateUnread();setReply(null);$$('.cms-bubble').forEach(b=>b.remove());}
    if(action==='error'){failNextSend=true;openChat();toast('The next message will show a send error.');}
  }
  // Public local event boundary for simulating remote participants.
  window.CoinMahjongSocial=Object.freeze({
    receiveChat,
    receiveEmote:({id,from})=>from===0?false:playEffect(id,from,from),
    receiveThrowable:({id,from,to})=>from===0?false:playEffect(id,from,to),
    setPlayerActive:(id,active)=>{
      const player=state.players[id];if(!player||id===0||id>=(Number(document.body.dataset.cap)||4))return false;
      player.active=Boolean(active);closePicker();for(const key of activeEffects.keys())destroyEffect(key);renderPlayers();
      const cap=Number(document.body.dataset.cap)||4,filled=activePlayers().length;
      if(filled<cap){document.body.dataset.state='waiting';$('#waiting-text').textContent=`${filled} of ${cap} seated — the game starts when the table is full.`;$('#round-info').textContent=`Waiting for players · ${filled} of ${cap} seated`;}
      else {delete document.body.dataset.state;$('#round-info').textContent='East 1 · Honba 0';}
      return true;
    }
  });
  $$('.cms-toolbar-button').forEach(button=>button.disabled=true);settingsButton.disabled=true;
  Promise.all([getJSON(assetRoot+'catalog/avatars.json'),getJSON('support/research/prototype_asset_map.json')]).then(([avatars,map])=>{
    state.avatars=avatars;state.assets=map.animation_assets;
    if(!avatars.some(a=>a.id===state.avatar)||(!state.member&&state.avatar>=2000))state.avatar=1;
    state.recents=[...new Set(Array.isArray(saved.recents)?saved.recents:[])].filter(id=>state.assets.some(a=>a.kind==='emote'&&a.id===id)).slice(0,10);
    const cap=Number(document.body.dataset.cap)||4;
    const ringChoices=shuffledRings();
    state.players=[0,1,2,3].map(id=>({id,name:$('.cm-player-row__name',$('#player-info-'+id)).textContent,wind:['East','South','West','North'][id],avatar:id===0?state.avatar:[1,2002,17,7][id],demoRing:ringChoices[id],member:id===0?state.member:id===1,active:id<cap&&!$('#player-info-'+id).classList.contains('cm-player-row--hidden')}));
    renderPlayers();renderDemo();syncPreferences();$$('.cms-toolbar-button').forEach(button=>button.disabled=false);settingsButton.disabled=false;ui.dataset.ready='true';
  }).catch(error=>{console.error(error);toast(location.protocol==='file:'?'Open the prototype through the local preview server.':'Social assets could not load. Reload to try again.');});
})();
