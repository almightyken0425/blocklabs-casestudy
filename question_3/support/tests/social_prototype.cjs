const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const prototypeRoot = path.resolve(__dirname, '../..');
const prototypeFolder = path.basename(prototypeRoot);

const base = process.env.PROTOTYPE_URL || `http://127.0.0.1:8767/${prototypeFolder}/mahjong-game-standalone.html`;
const results = [];
async function test(name, run) {
  if (process.env.TEST_FILTER && !name.includes(process.env.TEST_FILTER)) return;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
  const page = await context.newPage();
  page.setDefaultTimeout(3000);
  page.setDefaultNavigationTimeout(15000);
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(base);
    await run(page, context);
    assert.deepEqual(errors, [], "No uncaught browser errors");
    results.push({ name, passed: true });
    console.log('PASS', name);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.log('FAIL', name, error.message.split('\n')[0]);
  } finally { await browser.close(); }
}

async function characterMotion(page, name) {
  const button=page.getByRole('button',{name,exact:true});
  if(!await button.isVisible())await page.locator('.cms-movement-preview summary').click();
  await button.click();
}
async function useStaticAvatar(page) {
  await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('button',{name:'Select ANIMAL avatar 2',exact:true}).click();
  await page.getByRole('button',{name:'Close settings',exact:true}).click();
}

(async () => {
  await test('Quick slots send three bound emotes without opening chat or replacing a draft', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.type('Keep this draft');await page.keyboard.press('Escape');
    for(const [slot,text,emote] of [[1,'GG!','happy'],[2,'Ouch...','sad'],[3,'So close!','angry']]){
      await page.keyboard.press(`Alt+Digit${slot}`);
      await page.waitForSelector(`#cms-character-scene[data-expression="${emote}"]`);
      assert.equal(await page.locator('.cms-message-text').last().textContent(),text);
      assert.equal(await page.locator('[data-quick-bubble="0"]').textContent(),text);
      assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
      assert.equal(await page.locator('#cms-chat-input').inputValue(),'Keep this draft');
      await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    }
  });
  await test('Quick slots save six editable bindings and preview without sending', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.evaluate(()=>localStorage.setItem('coinmahjong.social.v1','{"preserved":true}'));
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('tab',{name:'Quick messages',exact:true}).click();
    assert.equal(await page.locator('[data-quick-text]').count(),6);
    await page.getByLabel('Message 2',{exact:true}).fill('Nice comeback!');
    await page.getByLabel('Emote 2',{exact:true}).selectOption('happy');
    await page.getByRole('button',{name:'Preview quick message 2',exact:true}).click();
    assert.equal(await page.locator('.cms-message').count(),0);
    await page.waitForSelector('#cms-character-scene[data-expression="happy"]');
    assert.equal(await page.locator('[data-quick-bubble="0"]').textContent(),'Nice comeback!');
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('tab',{name:'Quick messages',exact:true}).click();
    assert.equal(await page.getByLabel('Message 2',{exact:true}).inputValue(),'Nice comeback!');
    assert.equal(await page.getByLabel('Emote 2',{exact:true}).inputValue(),'happy');
    await page.getByLabel('Message 2',{exact:true}).fill('   ');
    assert.equal(await page.getByRole('button',{name:'Preview quick message 2',exact:true}).isEnabled(),false);
    assert.match(await page.locator('[data-quick-error="2"]').textContent(),/Enter a message/);
    await page.getByLabel('Message 2',{exact:true}).fill('Text only');
    await page.getByLabel('Emote 2',{exact:true}).selectOption('none');
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.locator('#cms-table-quick').click();
    assert.equal(await page.locator('#cms-quick-expanded [data-quick-slot]').count(),6);
    await page.locator('#cms-quick-expanded [data-quick-slot="2"]').click();
    await page.waitForFunction(()=>document.querySelector('.cms-message-text')?.textContent==='Text only');
    assert.equal(await page.locator('#cms-character-scene').count(),0);
    assert.equal(await page.evaluate(()=>localStorage.getItem('coinmahjong.social.v1')),'{"preserved":true}');
  });
  await test('Quick slots append text-only messages without replacing saved choices', async page => {
    const existing=[{text:'My happy message',emote:'happy'},{text:'My sad message',emote:'none'},{text:'My angry message',emote:'angry'}];
    await page.evaluate(quickMessages=>localStorage.setItem('coinmahjong.question3.social.v1',JSON.stringify({quickMessages})),existing);
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.locator('#cms-table-quick').click();await page.locator('#cms-edit-quick').click();
    for(let index=0;index<3;index++){
      assert.equal(await page.getByLabel(`Message ${index+1}`,{exact:true}).inputValue(),existing[index].text);
      assert.equal(await page.getByLabel(`Emote ${index+1}`,{exact:true}).inputValue(),existing[index].emote);
    }
    for(const slot of [4,5,6])assert.equal(await page.getByLabel(`Emote ${slot}`,{exact:true}).inputValue(),'none');
    await page.getByLabel('Message 6',{exact:true}).fill('One more hand.');
    await page.keyboard.press('Alt+Digit6');
    assert.equal(await page.locator('.cms-message').count(),0,'Settings editing does not send shortcuts');
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.type('Keep this draft');await page.keyboard.press('Escape');
    for(const [slot,text] of [[4,'Good luck, everyone!'],[5,'One moment, please.'],[6,'One more hand.']]){
      await page.keyboard.press(`Alt+Digit${slot}`);
      await page.waitForFunction(text=>document.querySelector('.cms-message:last-child .cms-message-text')?.textContent===text,text);
      assert.equal(await page.locator('#cms-character-scene').count(),0,'Text-only slots do not trigger an emote');
      assert.equal(await page.locator('#cms-chat-input').inputValue(),'Keep this draft');
      assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
    }
    await page.keyboard.down('Alt');await page.keyboard.down('Digit4');await page.keyboard.down('Digit4');await page.keyboard.up('Digit4');await page.keyboard.up('Alt');
    await page.waitForTimeout(150);
    assert.equal(await page.locator('.cms-message').count(),4,'Held keys send only once');
    await page.keyboard.press('Control+Digit5');
    assert.equal(await page.locator('#cms-target-hint').isVisible(),false,'Six message slots do not introduce extra seats');
    await page.keyboard.press('Shift+Digit6');
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'Keep this draft^','Shift + 6 stays ordinary text');
  });
  await test('Quick slots expose all six messages in narrow menus and the chat footer', async page => {
    await page.setViewportSize({width:390,height:844});
    await page.locator('#cms-table-quick').click();
    await page.locator('#cms-quick-expanded [data-quick-slot="6"]').click();
    await page.waitForFunction(()=>document.querySelector('.cms-message-text')?.textContent==='Last hand for me.');
    assert.equal(await page.locator('#cms-character-scene').count(),0);
    await page.locator('#cms-chat-toggle').click();
    assert.equal(await page.locator('#cms-quick-row [data-quick-slot]').count(),6);
    assert.ok(await page.locator('#cms-quick-row').evaluate(el=>el.scrollWidth<=el.clientWidth),'Six slots fit within the chat footer');
    assert.ok(await page.locator('.cms-input-row').evaluate(el=>el.getBoundingClientRect().bottom<=document.querySelector('#cms-chat').getBoundingClientRect().bottom),'The second quick-message row must not clip the message input or send button');
    await page.locator('#cms-quick-row [data-quick-slot="5"]').click();
    await page.waitForFunction(()=>document.querySelector('.cms-message:last-child .cms-message-text')?.textContent==='One moment, please.');
  });
  await test('Quick slots keep queued messages paired with emotes and cancel pending work', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.press('Shift+Digit1');await page.keyboard.press('Alt+Digit2');await page.keyboard.press('Alt+Digit3');
    assert.match(await page.locator('#cms-toast').innerText(),/already queued/);
    assert.equal(await page.locator('.cms-message').count(),0,'Queued text is not sent ahead of the emote');
    await page.waitForSelector('#cms-character-scene[data-expression="sad"]',{timeout:5000});
    assert.equal(await page.locator('.cms-message-text').textContent(),'Ouch...');
    await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    await page.keyboard.press('Shift+Digit1');await page.keyboard.press('Alt+Digit3');
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.waitForTimeout(2600);
    assert.equal(await page.locator('.cms-message').count(),1,'An interrupted queued quick message is not sent later');
    assert.equal(await page.locator('#cms-character-scene').count(),0);
  });
  await test('Quick slots offer retry on failure and play only after success', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.locator('#cms-demo summary').click();await page.locator('#cms-demo [data-demo="error"]').click();
    await page.getByRole('textbox',{name:'Chat message',exact:true}).fill('Keep the typed draft');await page.keyboard.press('Escape');
    await page.keyboard.press('Alt+Digit3');
    await page.waitForSelector('#cms-quick-error:not([hidden])');
    assert.equal(await page.locator('.cms-message,#cms-character-scene').count(),0);
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'Keep the typed draft');
    await page.getByRole('button',{name:'Retry quick message',exact:true}).click();
    await page.waitForSelector('#cms-character-scene[data-expression="angry"]');
    assert.equal(await page.locator('.cms-message-text').textContent(),'So close!');
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'Keep the typed draft');
    assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#cms-quick-error').isVisible(),false);
  });
  await test('Quick slots cancel an in-flight send before it can publish', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.evaluate(()=>{
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'1',code:'Digit1',altKey:true,bubbles:true,cancelable:true}));
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(150);
    assert.equal(await page.locator('.cms-message,#cms-character-scene').count(),0);
    await page.keyboard.press('Alt+Digit1');
    await page.waitForSelector('#cms-character-scene[data-phase="expression"]');
    const separate=await page.evaluate(()=>{
      const text=document.querySelector('[data-quick-bubble="0"]').getBoundingClientRect();
      const body=document.querySelector('#cms-character-scene [data-part="character"]').getBoundingClientRect();
      return text.left>=body.right||text.right<=body.left||text.bottom<=body.top||text.top>=body.bottom;
    });
    assert.ok(separate,'The quick-message bubble must not cover the performing character');
    assert.equal(await page.locator('.cms-message-text').textContent(),'GG!');
  });
  await test('Quick slots work by touch on narrow screens and retain text with a static avatar', async (page,context) => {
    await useStaticAvatar(page);
    await page.keyboard.press('Alt+Digit1');
    await page.waitForFunction(()=>document.querySelector('.cms-message-text')?.textContent==='GG!');
    assert.equal(await page.locator('#cms-character-scene').count(),0);
    const touchContext=await context.browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const touch=await touchContext.newPage();await touch.goto(base);
    await touch.locator('#cms-table-quick').tap();
    const fits=await touch.locator('#cms-quick-expanded').evaluate(el=>{const r=el.getBoundingClientRect(),b=document.querySelector('#cms-ui').getBoundingClientRect();return r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom;});
    assert.ok(fits);
    await touch.locator('#cms-quick-expanded [data-quick-slot="1"]').tap();
    await touch.waitForSelector('#cms-character-scene[data-expression="happy"]');
    assert.equal(await touch.locator('.cms-message-text').textContent(),'GG!');
    assert.equal(await touch.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
    await touchContext.close();
  });
  await test('Quick slots keep long custom messages readable inside the table', async page => {
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:844});
      await page.locator('#cms-table-quick').click();
      await page.locator('#cms-edit-quick').click();
      await page.locator('[data-quick-text="1"]').fill('W'.repeat(120));
      await page.locator('[data-preview-quick="1"]').click();
      const readable=await page.locator('[data-quick-bubble="0"]').evaluate(el=>{
        const r=el.getBoundingClientRect(),b=document.querySelector('#cms-ui').getBoundingClientRect();
        return el.scrollHeight<=el.clientHeight&&r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom;
      });
      assert.ok(readable,'All 120 characters fit in the bubble and within the table');
      assert.equal(await page.locator('.cms-message').count(),0,'Preview must not add history');
    }
  });
  await test('Character throwable leaves the window, enters from each opponent side, acts and returns', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    for(const [target,side,action] of [[1,'right','A'],[2,'top','A'],[3,'left','A'],[1,'right','B'],[2,'top','B'],[3,'left','B']]) {
      const original=await page.locator('.cms-seat[data-player="0"] .cms-avatar').boundingBox();
      await page.locator(`.cms-seat[data-player="${target}"] [data-social-player]`).click();
      assert.equal(await page.locator('[data-character-throw]').count(),2);
      assert.equal(await page.locator('#cms-picker-grid').isVisible(),false);
      await page.locator(`[data-character-throw="${action}"]`).click();
      await page.waitForSelector('#cms-character-scene[data-phase="offscreen"]',{timeout:4500});
      const exited=await page.locator('#cms-character-scene').evaluate(el=>{
        const body=el.querySelector('[data-character-motion]').getBoundingClientRect();
        const ui=document.querySelector('#cms-ui').getBoundingClientRect();
        return body.top>=ui.bottom;
      });
      assert.ok(exited,'The whole character leaves through the bottom edge before entering elsewhere');
      await page.waitForSelector('#cms-character-scene[data-phase="acting"]',{timeout:3500});
      assert.equal(await page.locator('#cms-character-scene').getAttribute('data-entry-side'),side);
      assert.equal(await page.locator('#cms-character-scene').getAttribute('data-target'),String(target));
      const ring=await page.locator('[data-character-ring]').boundingBox();
      assert.ok(Math.abs(ring.width-original.width)<1&&Math.abs(ring.x-original.x)<1&&Math.abs(ring.y-original.y)<1,'The source frame stays fixed throughout travel');
      const body=await page.locator('#cms-character-scene [data-character-motion]').boundingBox();
      const recipient=await page.locator(`.cms-seat[data-player="${target}"] .cms-avatar`).boundingBox();
      assert.ok(Math.abs(body.x+body.width/2-recipient.x-recipient.width/2)<150,'The same actor performs beside the selected opponent');
      await page.waitForSelector('[data-character-impact]');
      assert.equal(await page.locator('.cms-effect').count(),0,'No legacy sticker throw is substituted');
      await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
      assert.equal(await page.locator('.cms-character-performing').count(),0);
    }
  });
  await test('Character throwable supports reduced motion and cancels travel on departure or settings', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.down('Control');await page.keyboard.press('Digit4');await page.keyboard.press('w');await page.keyboard.up('Control');
    await page.waitForSelector('#cms-character-scene[data-phase="acting"]');
    assert.equal(await page.locator('#cms-character-scene').evaluate(el=>el.getAnimations({subtree:true}).length),0);
    const inside=await page.locator('#cms-character-scene').evaluate(el=>{
      const body=el.querySelector('[data-character-motion]').getBoundingClientRect();
      const ui=document.querySelector('#cms-ui').getBoundingClientRect();
      const target=document.querySelector('.cms-seat[data-player="3"] .cms-avatar').getBoundingClientRect();
      return {body:body.toJSON(),ui:ui.toJSON(),target:target.toJSON(),valid:body.left>=ui.left&&body.top>=ui.top&&body.right<=ui.right&&body.bottom<=ui.bottom&&Math.abs(body.left+body.width/2-target.left-target.width/2)>target.width/2+body.width/4};
    });
    assert.ok(inside.valid,'Reduced pose stays within the narrow table and beside the target: '+JSON.stringify(inside));
    await page.waitForSelector('#cms-character-scene',{state:'detached'});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.setViewportSize({width:1440,height:1024});
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    for(const interrupt of ['departure','settings']){
      await page.keyboard.down('Control');await page.keyboard.press('Digit3');await page.keyboard.press('q');await page.keyboard.up('Control');
      await page.waitForSelector('#cms-character-scene[data-phase="entering"]',{timeout:5000});
      if(interrupt==='departure')await page.evaluate(()=>CoinMahjongSocial.setPlayerActive(2,false));
      else await page.getByRole('button',{name:'Settings',exact:true}).click();
      await page.waitForSelector('#cms-character-scene',{state:'detached'});
      assert.equal(await page.locator('.cms-character-performing').count(),0);
      if(interrupt==='departure')await page.evaluate(()=>CoinMahjongSocial.setPlayerActive(2,true));
    }
  });
  await test('Character menu presents the selected avatar and its three expressions', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    assert.equal(await page.locator('#cms-picker-title').textContent(),'Emotes');
    assert.equal(await page.locator('[data-planned-slot]').count(),3);
    assert.equal(await page.locator('[data-planned-slot] svg').count(),3,'Each choice previews the same avatar');
    assert.equal(await page.locator('#cms-categories').isVisible(),false,'Character choices are not mixed into Dogs categories');
    assert.equal(await page.locator('#cms-picker-grid').isVisible(),false,'Independent sticker effects are not character expressions');
    await page.getByRole('button',{name:'Happy Shift + 1',exact:true}).click();
    await page.waitForSelector('#cms-character-scene[data-expression="happy"]');
    await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    assert.equal(await page.locator('.cms-seat[data-player="0"] .cms-avatar-face').isVisible(),true);
  });
  await test('Character emotes perform outside the circle in normal and reduced motion', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    for(const reduced of [false,true]){
      await page.emulateMedia({reducedMotion:reduced?'reduce':'no-preference'});
      for(const slot of [1,2,3]){
        await page.keyboard.press(`Shift+Digit${slot}`);
        await page.waitForSelector('#cms-character-scene[data-phase="expression"]');
        const outside=await page.locator('#cms-character-scene').evaluate(scene=>{
          const body=scene.querySelector('[data-part="character"]').getBoundingClientRect();
          const frame=scene.querySelector('[data-character-ring]').getBoundingClientRect();
          return {unclipped:!scene.querySelector('[data-character-window]').hasAttribute('clip-path'),bodyTop:body.top,bodyBottom:body.bottom,frameTop:frame.top,frameBottom:frame.bottom,frameWidth:frame.width,originalWidth:document.querySelector('.cms-seat[data-player="0"] .cms-avatar').getBoundingClientRect().width};
        });
        assert.equal(outside.unclipped,true,'The circular portrait mask must not crop an emote');
        assert.ok(Math.abs(outside.frameWidth-outside.originalWidth)<1,'The frame keeps its original size');
        assert.ok(Math.abs(outside.bodyBottom-outside.frameBottom)<12,'The character stands at the lower edge of the frame');
        assert.ok(outside.bodyTop<outside.frameTop-30,'The expression visibly extends past the rim');
        await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
        assert.equal(await page.locator('.cms-seat[data-player="0"] .cms-avatar-face').isVisible(),true);
      }
    }
  });
  await test('Character plays Happy outside its frame and returns to the same idle avatar', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    const avatar=page.locator('.cms-seat[data-player="0"] .cms-avatar-face');
    assert.match(await avatar.getAttribute('src'),/momo.svg/);
    await page.keyboard.press('Shift+Digit1');
    await page.waitForSelector('#cms-character-scene[data-expression="happy"]');
    assert.equal(await page.locator('#cms-character-scene [data-face="happy"]').isVisible(),true);
    assert.equal(await page.locator('#cms-character-scene').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
    await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    assert.equal(await avatar.isVisible(),true);
    assert.match(await avatar.getAttribute('src'),/momo.svg/);
  });
  await test('Character expressions share mouse and keyboard controls with one queued action', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    for(const [slot,name] of [[1,'happy'],[2,'sad'],[3,'angry']]) {
      await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
      await page.locator(`[data-planned-slot="${slot}"]`).click();
      await page.waitForSelector(`#cms-character-scene[data-expression="${name}"]`);
      assert.equal(await page.locator(`#cms-character-scene [data-face="${name}"]`).isVisible(),true);
      await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
      await page.keyboard.press(`Shift+Digit${slot}`);
      await page.waitForSelector(`#cms-character-scene[data-expression="${name}"]`);
      await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    }
    await page.keyboard.press('Shift+Digit1');
    await page.keyboard.press('Shift+Digit2');
    await page.keyboard.press('Shift+Digit3');
    assert.match(await page.locator('#cms-toast').innerText(),/already queued/);
    await page.waitForSelector('#cms-character-scene[data-expression="sad"]',{timeout:5000});
    await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    assert.equal(await page.locator('.cms-character-performing').count(),0);
  });
  await test('Character climbs fully out, returns through the frame, and leaves chat usable', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await characterMotion(page,'Climb out');
    await page.waitForSelector('#cms-character-scene[data-phase="outside"]');
    const geometry=await page.locator('#cms-character-scene').evaluate(scene=>{
      const body=scene.querySelector('[data-part="character"]').getBoundingClientRect();
      const frame=scene.querySelector('[data-character-ring]').getBoundingClientRect();
      return {bottom:body.bottom,frameBottom:frame.bottom};
    });
    assert.ok(Math.abs(geometry.bottom-geometry.frameBottom)<6,'Climbing ends at the lower edge of the frame');
    await page.keyboard.type('Still playing');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.cms-message');
    assert.equal(await page.locator('.cms-message-text').textContent(),'Still playing');
    await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:5000});
    await page.keyboard.press('Escape');
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await characterMotion(page,'Climb out');
    await page.waitForSelector('#cms-character-scene[data-phase="outside"]');
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await characterMotion(page,'Return to frame');
    await page.waitForFunction(()=>document.querySelector('#cms-character-scene [data-character-window]')?.getAttribute('clip-path')==='url(#cms-momo-portal)');
    await page.waitForSelector('#cms-character-scene',{state:'detached',timeout:2000});
    assert.equal(await page.locator('.cms-seat[data-player="0"] .cms-avatar-face').isVisible(),true);
  });
  await test('Character interruption restores idle and changing avatars persists', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    for(const interruption of ['reset','resize','blur','settings','departure']) {
      await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
      await characterMotion(page,'Climb out');
      if(interruption==='reset') {
        await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
        await characterMotion(page,'Reset');
      }
      if(interruption==='resize')await page.setViewportSize({width:1200,height:850});
      if(interruption==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
      if(interruption==='settings') {
        await page.getByRole('button',{name:'Settings',exact:true}).click();
        await page.getByRole('button',{name:'Close settings',exact:true}).click();
      }
      if(interruption==='departure')await page.evaluate(()=>CoinMahjongSocial.setPlayerActive(1,false));
      await page.waitForSelector('#cms-character-scene',{state:'detached'});
      assert.equal(await page.locator('.cms-character-performing').count(),0);
    }
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('button',{name:'Select ANIMAL avatar 2',exact:true}).click();
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.keyboard.press('Shift+Digit1');
    assert.equal(await page.locator('#cms-character-scene').count(),0);
    assert.match(await page.locator('#cms-toast').innerText(),/Select Momo/);
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.locator('#cms-use-character').click();
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    assert.match(await page.locator('.cms-seat[data-player="0"] .cms-avatar-face').getAttribute('src'),/momo.svg/);
    await page.keyboard.press('Shift+Digit3');
    await page.waitForSelector('#cms-character-scene[data-expression="angry"]');
  });
  await test('Character respects reduced motion and remains visible on narrow screens', async page => {
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.setViewportSize({width:390,height:844});
    await page.reload();
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.press('Shift+Digit2');
    await page.waitForSelector('#cms-character-scene[data-expression="sad"]');
    assert.equal(await page.locator('#cms-character-scene').evaluate(el=>el.getAnimations({subtree:true}).length),0);
    const frame=await page.locator('#cms-character-scene [data-character-ring]').boundingBox();
    assert.ok(frame.x>=0&&frame.x+frame.width<=390&&frame.y>=0&&frame.y+frame.height<=844);
    const original=await page.locator('.cms-seat[data-player="0"] .cms-avatar').boundingBox();
    assert.ok(Math.abs(frame.width-original.width)<1,'The frame never enlarges on a narrow screen');
    const name=await page.locator('.cms-seat[data-player="0"] .cms-seat-name').boundingBox();
    assert.ok(frame.y+frame.height<=name.y,'The frame leaves the player name visible');
    await page.waitForSelector('#cms-character-scene',{state:'detached'});
    await page.locator('#cms-mobile-players').click();
    await page.locator('#cms-players-list [data-social-player="0"]').click();
    await characterMotion(page,'Climb out');
    await page.waitForSelector('#cms-character-scene[data-phase="reduced"]');
    assert.equal(await page.locator('#cms-character-scene').evaluate(el=>el.getAnimations({subtree:true}).length),0);
    await page.waitForSelector('#cms-character-scene',{state:'detached'});
  });
  await test('Character asset failure preserves static avatars and chat', async page => {
    await page.route('**/momo.svg',route=>route.fulfill({status:503,body:'unavailable'}));
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    assert.doesNotMatch(await page.locator('.cms-seat[data-player="0"] .cms-avatar-face').getAttribute('src'),/momo.svg/);
    await page.keyboard.type('Still here');await page.keyboard.press('Enter');
    await page.waitForSelector('.cms-message');
    assert.equal(await page.locator('.cms-message-text').textContent(),'Still here');
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    assert.equal(await page.locator('#cms-use-character').isEnabled(),false);
  });
  await test('Typing opens chat with the first uppercase character and resumes an escaped draft', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.press('Shift+H');
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'H');
    await page.keyboard.type('ello');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.cms-message').count(),0);
    await page.keyboard.press('Alt+KeyX');
    assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'Hello');
    await page.keyboard.press('Shift+W');
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'HelloW');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.cms-message');
    assert.equal(await page.locator('.cms-message-text').textContent(),'HelloW');
    const field=await page.locator('#cms-chat-input').boundingBox(),slot=await page.locator('#cms-input-slot').boundingBox();
    assert.ok(Math.abs(field.x-slot.x)<1&&Math.abs(field.y-slot.y)<1&&Math.abs(field.width-slot.width)<1);
  });
  await test('IME composition opens chat, keeps composed text once and never sends the candidate Enter', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Process',code:'KeyN',windowsVirtualKeyCode:229});
    assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'true');
    await cdp.send('Input.imeSetComposition',{text:'你',selectionStart:1,selectionEnd:1});
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.cms-message').count(),0);
    await cdp.send('Input.insertText',{text:'你好'});
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'你好');
    // Simulate the compositionend-before-keydown order of another IME.
    await page.evaluate(()=>{
      const input=document.querySelector('#cms-chat-input');
      input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:'你好'}));
      const event=new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});
      input.dispatchEvent(event);
      if(!event.defaultPrevented)input.form.requestSubmit();
    });
    assert.equal(await page.locator('.cms-message').count(),0);
    await page.waitForTimeout(100);
    await page.keyboard.press('Enter');
    await page.waitForSelector('.cms-message');
    assert.equal(await page.locator('.cms-message-text').textContent(),'你好');
  });
  await test('Social shortcuts take priority and preserve normal text and settings editing', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.evaluate(()=>{window.requests=[];document.addEventListener('cms:action-request',e=>window.requests.push(e.detail));});
    for(const key of ['Shift+Digit1','Shift+Digit2','Shift+Digit3','Alt+Digit1','Alt+Digit2','Alt+Digit3'])await page.keyboard.press(key);
    assert.deepEqual(await page.evaluate(()=>requests.map(r=>[r.kind,r.slot,r.status])),[
      ['emote',1,'started'],['emote',2,'queued'],['emote',3,'busy'],
      ['quick-message',1,'busy'],['quick-message',2,'busy'],['quick-message',3,'busy']]);
    assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('.cms-message,.cms-effect').count(),0);
    await page.keyboard.press('Shift+H');
    await page.keyboard.press('Shift+Digit1');
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'H!');
    assert.equal(await page.evaluate(()=>requests.length),6);
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('tab',{name:'Interactions',exact:true}).click();
    await page.locator('#cms-target-modifier').focus();
    await page.keyboard.press('Shift+Digit2');
    assert.equal(await page.evaluate(()=>requests.length),6);
    assert.equal(await page.locator('#cms-chat-input').inputValue(),'H!');
    assert.equal(await page.locator('#cms-settings').isVisible(),true);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Control');
    await page.keyboard.press('Meta');
    assert.equal(await page.locator('#cms-chat-toggle').getAttribute('aria-expanded'),'false');
  });
  await test('Throwable sequences use stable opponents and cancel on release, Escape, blur, repeats and departure', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.evaluate(()=>{window.requests=[];document.addEventListener('cms:action-request',e=>requests.push(e.detail));});
    await page.locator('.cms-seat[data-player="1"] [data-social-player]').click();
    assert.equal(await page.locator('[data-character-throw="A"] kbd').textContent(),'Q');
    assert.equal(await page.locator('[data-character-throw="B"] kbd').textContent(),'W');
    await page.keyboard.press('Escape');
    for(const oldKey of ['a','b']){
      await page.keyboard.down('Control');await page.keyboard.press('Digit2');
      await page.keyboard.press(oldKey);await page.keyboard.up('Control');
    }
    assert.equal(await page.evaluate(()=>requests.length),0,'Old A/B keys no longer request throwables');
    for(const [seat,action] of [[2,'q'],[3,'w'],[4,'q']]){
      await page.keyboard.down('Control');await page.keyboard.press('Digit'+seat);
      assert.equal(await page.locator(`.cms-seat[data-player="${seat-1}"]`).getAttribute('data-keyboard-target'),'true');
      assert.match(await page.locator('#cms-target-hint').innerText(),/Q \/ W/);
      await page.keyboard.press(action);await page.keyboard.up('Control');
    }
    assert.deepEqual(await page.evaluate(()=>requests.map(r=>[r.target,r.action])),[[1,'A'],[2,'B'],[3,'A']]);
    assert.equal(await page.locator('.cms-effect').count(),0);
    for(const cancel of ['release','escape','blur','departure']){
      await page.keyboard.down('Control');await page.keyboard.press('Digit2');
      if(cancel==='release')await page.keyboard.up('Control');
      if(cancel==='escape')await page.keyboard.press('Escape');
      if(cancel==='blur')await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
      if(cancel==='departure')await page.evaluate(()=>CoinMahjongSocial.setPlayerActive(1,false));
      assert.equal(await page.locator('#cms-target-hint').isVisible(),false);
      await page.keyboard.down('Control');await page.keyboard.press('q');await page.keyboard.up('Control');
    }
    assert.equal(await page.evaluate(()=>requests.length),3);
    await page.keyboard.press('Control+Digit1');
    assert.match(await page.locator('#cms-toast').innerText(),/Seat 1 is you/);
    await page.keyboard.press('Control+Digit2');
    assert.match(await page.locator('#cms-toast').innerText(),/Seat 2 is empty/);
    assert.equal(await page.locator('.cms-seat[data-player="3"] .cms-seat-number').textContent(),'4');
    await page.keyboard.down('Shift');await page.keyboard.down('Digit1');await page.keyboard.down('Digit1');await page.keyboard.up('Digit1');await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(()=>requests.length),4);
  });
  await test('Configurable target modifier persists only for Question 3', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.evaluate(()=>localStorage.setItem('coinmahjong.social.v1','{"preserved":true}'));
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('tab',{name:'Interactions',exact:true}).click();
    await page.locator('#cms-target-modifier').selectOption('alt-shift');
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.reload();await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.keyboard.down('Alt');await page.keyboard.down('Shift');await page.keyboard.press('Digit4');
    assert.equal(await page.locator('.cms-seat[data-player="3"]').getAttribute('data-keyboard-target'),'true');
    await page.keyboard.up('Shift');
    assert.equal(await page.locator('#cms-target-hint').isVisible(),false);
    await page.keyboard.up('Alt');
    assert.equal(await page.evaluate(()=>localStorage.getItem('coinmahjong.social.v1')),'{"preserved":true}');
    await page.getByRole('button',{name:'Settings',exact:true}).click();await page.getByRole('tab',{name:'Interactions',exact:true}).click();
    await page.getByLabel('Enable throwables').uncheck();await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.keyboard.press('Alt+Shift+Digit2');assert.equal(await page.locator('#cms-target-hint').isVisible(),false);
    assert.match(await page.locator('#cms-toast').innerText(),/Throwables are off/);
  });
  await test('Avatar selection applies immediately and locked avatars preserve selection', async (page) => {
    await page.getByRole('button', { name: 'View your profile', exact: true }).first().click();
    assert.equal(await page.locator('#cms-profile').isVisible(), true);
    assert.equal(await page.locator('#cms-settings').isVisible(), false);
    await page.getByRole('button', { name: 'Close player profile', exact: true }).click();
    assert.equal(await page.locator('.cm-settings-stack .cm-dropdown-field').count(), 0);
    const headerSettings=page.locator('.cm-balance-pill__actions #cms-header-settings');
    assert.equal(await headerSettings.isVisible(), true);
    await headerSettings.click();
    await page.getByRole('button', { name: 'Select ANIMAL avatar 2', exact: true }).click();
    assert.equal(await page.locator('#player-info-0 .cms-avatar-face').getAttribute('src'), 'support/coinpoker_assets/avatars/avatar-2.webp');
    await page.getByRole('button', { name: 'Select 3-BET CLUB avatar 2001', exact: true }).click();
    assert.equal(await page.locator('#cms-member-dialog').isVisible(), true);
    assert.equal(await page.locator('#player-info-0 .cms-avatar-face').getAttribute('src'), 'support/coinpoker_assets/avatars/avatar-2.webp');
    await page.getByRole('button', { name: 'Got it', exact: true }).click();
    await page.getByRole('button', { name: 'Close settings', exact: true }).click();
    await page.reload();
    await page.waitForSelector('#player-info-0 .cms-avatar-face');
    assert.equal(await page.locator('#player-info-0 .cms-avatar-face').getAttribute('src'), 'support/coinpoker_assets/avatars/avatar-2.webp');
  });
  await test('Emotes update unique recents and throwables travel to the selected seat', async page => {
    await useStaticAvatar(page);
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.getByRole('button', { name: 'Play Dode to Moon', exact: true }).click();
    await page.waitForSelector('.cms-effect[data-asset="65"] svg');
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.getByRole('tab', { name: 'Recents', exact: true }).click();
    assert.equal(await page.locator('#cms-picker-grid [data-asset]').count(), 1);
    await page.getByRole('button', { name: 'Play Dode to Moon', exact: true }).click();
    await page.locator('#player-info-2 [data-social-player]').click();
    assert.match(await page.locator('#cms-picker-title').textContent(), /gdPdg/);
    await page.locator('#cms-picker-grid [data-asset="119"]').click();
    await page.waitForSelector('.cms-effect[data-asset="119"][data-target="2"] svg');
    assert.equal(await page.locator('#cms-picker').isVisible(), false);
  });
  await test('Chat rejects blank input, sends, replies, tags and respects bubble settings', async page => {
    await page.getByRole('button', { name: 'Open table chat', exact: true }).click();
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).fill('   ');
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).press('Enter');
    assert.equal(await page.locator('#cms-messages .cms-message').count(), 0);
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).fill('Hello table');
    await page.getByRole('button', { name: 'Send message', exact: true }).click();
    await page.waitForSelector('#cms-messages .cms-message');
    assert.equal(await page.locator('.cms-message-text').last().textContent(), 'Hello table');
    await page.getByRole('button', { name: 'Message actions', exact: true }).last().click();
    await page.getByRole('button', { name: 'Reply', exact: true }).last().click();
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).fill('Reply text');
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).press('Enter');
    await page.waitForSelector('.cms-message-quote');
    assert.match(await page.locator('.cms-message-quote').last().textContent(), /Hello table/);
    await page.getByRole('button', { name: 'Mention a player', exact: true }).click();
    await page.getByRole('button', { name: '@gdPdg', exact: true }).click();
    assert.equal(await page.getByRole('textbox', { name: 'Chat message', exact: true }).inputValue(), '@gdPdg ');
    await page.getByRole('button', { name: 'Chat options', exact: true }).click();
    await page.getByLabel('Hide chat bubbles', { exact:true }).check();
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).fill('No bubble');
    await page.getByRole('textbox', { name: 'Chat message', exact: true }).press('Enter');
    await page.waitForFunction(() => document.querySelector('#cms-messages').textContent.includes('No bubble'));
    assert.equal(await page.locator('.cms-bubble').count(), 0);
  });
  await test('Membership changes unlock assets and synchronize every own avatar', async page => {
    await page.waitForSelector('#player-info-0 .cms-avatar-ring');
    const previewRing=await page.locator('#player-info-0 .cms-avatar-ring').getAttribute('src');
    await page.locator('#cms-demo summary').click();
    await page.locator('#cms-demo [data-demo-member]').check();
    await page.getByRole('button', { name:'Settings',exact:true }).click();
    await page.getByRole('button', { name:'Select 3-BET CLUB avatar 2001',exact:true }).click();
    assert.equal(await page.locator('#cms-member-dialog').isVisible(),false);
    assert.equal(await page.locator('#player-info-0 .cms-avatar-ring').getAttribute('src'),previewRing);
    assert.match(await page.locator('.cms-avatar-preview').innerText(),/3-Bet Club member/);
    assert.match(await page.locator('.cm-center-indicator__plate--bottom img').getAttribute('src'),/2001/);
    await page.waitForFunction(()=>[...document.querySelectorAll('#cms-settings img')].every(i=>i.complete&&i.naturalWidth));
    assert.equal(await page.locator('[data-avatar]').count(),51);
    await page.getByRole('button', { name:'Close settings',exact:true }).click();
    await page.locator('#cms-demo [data-demo-member]').uncheck();
    assert.equal(await page.locator('#player-info-0 .cms-avatar-face').getAttribute('src'),'support/coinpoker_assets/avatars/avatar-1.webp');
  });
  await test('Recents keep ten unique emotes in last-used order', async page => {
    await useStaticAvatar(page);
    for(let id=56;id<=65;id++) {
      await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
      await page.locator(`#cms-picker-grid [data-asset="${id}"]`).click();
    }
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.getByRole('tab',{name:'Penguin',exact:true}).click();
    await page.locator('#cms-picker-grid [data-asset="41"]').click();
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.getByRole('tab',{name:'Recents',exact:true}).click();
    assert.deepEqual(await page.locator('#cms-picker-grid [data-asset]').evaluateAll(xs=>xs.map(x=>Number(x.dataset.asset))),[41,65,64,63,62,61,60,59,58,57]);
    await page.locator('#cms-picker-grid [data-asset="60"]').click();
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    assert.equal(await page.locator('#cms-picker-grid [data-asset]').count(),10);
    assert.equal(await page.locator('#cms-picker-grid [data-asset]').first().getAttribute('data-asset'),'60');
  });
  await test('Chat mute options filter incoming events but preserve own messages', async page => {
    await page.getByRole('button',{name:'Open table chat',exact:true}).click();
    await page.getByRole('button',{name:'Chat options',exact:true}).click();
    await page.getByLabel('Mute spectator chat',{exact:true}).check();
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.receiveChat({text:'Spectator text',spectator:true})),false);
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.receiveChat({from:1,text:'Seated player'})),true);
    await page.getByLabel('Mute all chats',{exact:true}).check();
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.receiveChat({from:1,text:'Muted text'})),false);
    await page.getByRole('textbox',{name:'Chat message',exact:true}).fill('My message still works');
    await page.getByRole('textbox',{name:'Chat message',exact:true}).press('Enter');
    await page.waitForFunction(()=>document.querySelectorAll('.cms-message').length===2);
    assert.equal(await page.locator('.cms-message-text').last().textContent(),'My message still works');
  });
  await test('Quick messages send directly, copy works, errors preserve the draft', async (page,context) => {
    await context.grantPermissions(['clipboard-read','clipboard-write']);
    await page.getByRole('button',{name:'Open table chat',exact:true}).click();
    await page.locator('.cms-quick-row [data-quick-slot="1"]').click();
    await page.waitForSelector('.cms-message');
    assert.equal(await page.locator('.cms-message-text').textContent(),'GG!');
    await page.locator('.cms-message').hover();
    await page.getByRole('button',{name:'Message actions',exact:true}).click();
    await page.getByRole('button',{name:'Copy',exact:true}).click();
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'GG!');
    await page.locator('#cms-demo summary').click();
    await page.locator('#cms-demo [data-demo="error"]').click();
    await page.getByRole('textbox',{name:'Chat message',exact:true}).fill('Keep my draft');
    await page.getByRole('textbox',{name:'Chat message',exact:true}).press('Enter');
    await page.waitForSelector('#cms-chat-error:not([hidden])');
    assert.equal(await page.getByRole('textbox',{name:'Chat message',exact:true}).inputValue(),'Keep my draft');
    await page.getByRole('textbox',{name:'Chat message',exact:true}).press('Enter');
    await page.waitForFunction(()=>document.querySelectorAll('.cms-message').length===2);
    assert.equal(await page.locator('#cms-chat-error').isVisible(),false);
  });
  await test('Four-seat scope rejects old three-player URLs and keeps waiting seats stable', async page => {
    await page.goto(base+'?table=kansai-full-b1');
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    assert.equal(await page.locator('.cms-seat').count(),4);
    assert.equal(await page.locator('body').getAttribute('data-cap'),'4');
    assert.equal(await page.locator('a[href*="kansai"]').count(),0);
    assert.equal(await page.locator('#table-name').textContent(),'Japanese Full');
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.setPlayerActive(3,true)),true);
    await page.goto(base+'?table=japanese-east-b1');
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    assert.equal(await page.locator('.cms-seat').count(),3);
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.receiveThrowable({id:119,from:1,to:3})),false);
    assert.equal(await page.locator('#player-info-3').evaluate(el=>el.inert),true);
    assert.equal(await page.locator('#waiting-text').isVisible(),true);
  });
  await test('Throwables reach the selected seat and stop when a participant leaves', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    await page.evaluate(()=>CoinMahjongSocial.receiveThrowable({id:119,from:1,to:2}));
    await page.waitForFunction(()=>{const e=document.querySelector('.cms-effect[data-target="2"]'),seat=document.querySelector('.cms-seat[data-player="2"]');return e&&Math.abs(parseFloat(e.style.left)-seat.offsetLeft)<1;});
    assert.equal(await page.locator('.cms-effect[data-target="2"] svg').count(),1);
    await page.evaluate(()=>CoinMahjongSocial.setPlayerActive(2,false));
    assert.equal(await page.locator('.cms-effect').count(),0);
    assert.equal(await page.locator('.cms-seat[data-player="2"]').count(),0);
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.receiveThrowable({id:119,from:1,to:2})),false);
  });
  await test('Reduced motion and failed animation loads retain a usable preview', async page => {
    await useStaticAvatar(page);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.locator('#cms-picker-grid [data-asset="56"]').click();
    await page.waitForSelector('.cms-effect img');
    assert.equal(await page.locator('.cms-effect svg').count(),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.route('**/emotes/animations/57_*.json',route=>route.abort());
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.locator('#cms-picker-grid [data-asset="57"]').click();
    await page.waitForSelector('.cms-effect[data-asset="57"] img');
    assert.match(await page.locator('#cms-toast').textContent(),/Animation unavailable/);
  });
  await test('Mobile controls stay inside the table and keep chat operable', async page => {
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const tableBounds=await page.locator('#mjg-stage').boundingBox();
    const insideTable=r=>r&&r.x>=tableBounds.x&&r.x+r.width<=tableBounds.x+tableBounds.width+1&&r.y>=tableBounds.y&&r.y+r.height<=tableBounds.y+tableBounds.height+1;
    const settingsEntry=page.locator('.cms-window-header #cms-mobile-settings');
    const entryBounds=await settingsEntry.boundingBox();
    assert.ok(insideTable(entryBounds)&&entryBounds.y<tableBounds.y+80);
    assert.ok(insideTable(await page.locator('#cms-chat-toggle').boundingBox()));
    assert.equal(await page.locator('#cms-header-settings').isVisible(), false);
    assert.equal(await page.locator('.cms-toolbar #cms-mobile-settings').count(), 0);
    await settingsEntry.click();
    let r=await page.locator('#cms-settings').boundingBox();
    assert.ok(insideTable(r));
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.locator('#cms-mobile-players').click();
    await page.locator('#cms-players-list [data-social-player="0"]').click();
    r=await page.locator('#cms-picker').boundingBox();
    assert.ok(insideTable(r));
    await page.getByRole('button',{name:'Close emotes',exact:true}).click();
    await page.getByRole('button',{name:'Open table chat',exact:true}).click();
    await page.getByRole('textbox',{name:'Chat message',exact:true}).fill('<img src=x onerror=alert(1)>');
    await page.getByRole('textbox',{name:'Chat message',exact:true}).press('Enter');
    await page.waitForSelector('.cms-message');
    assert.equal(await page.locator('.cms-message-text img').count(),0);
    assert.equal(await page.locator('.cms-message-text').textContent(),'<img src=x onerror=alert(1)>');
    r=await page.locator('#cms-chat').boundingBox();
    assert.ok(insideTable(r));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  });
  await test('Avatar hover cancels on exit and disabled throwables do not open or play', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    const avatar=page.locator('#player-info-1 [data-social-player]');
    await avatar.hover();await page.mouse.move(400,30);await page.waitForTimeout(240);
    assert.equal(await page.locator('#cms-picker').isVisible(),false);
    await avatar.hover();await page.waitForTimeout(240);
    assert.equal(await page.locator('#cms-picker').isVisible(),true);
    await page.mouse.move(400,30);await page.waitForTimeout(360);
    assert.equal(await page.locator('#cms-picker').isVisible(),false);
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('tab',{name:'Interactions',exact:true}).click();
    assert.equal(await page.getByLabel('Show throwables on hover').count(),0);
    await page.getByLabel('Enable throwables').uncheck();
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await avatar.hover();await page.waitForTimeout(240);
    assert.equal(await page.locator('#cms-picker').isVisible(),false);
    assert.equal(await page.evaluate(()=>CoinMahjongSocial.receiveThrowable({id:119,from:1,to:0})),false);
    assert.equal(await page.locator('.cms-effect').count(),0);
  });
  await test('Both avatar areas open the matching picker and list profile buttons preserve winds', async page => {
    await page.waitForSelector('#cms-ui[data-ready="true"]',{state:'attached'});
    assert.equal(await page.locator('.cms-seat-action,.cms-row-throw,#cms-self-emote,#cms-mobile-emote,[data-throw]').count(),0);
    for(const area of ['seat','list'])for(let id=0;id<4;id++){
      const scope=area==='seat'?`.cms-seat[data-player="${id}"]`:`#player-info-${id}`;
      const avatar=page.locator(scope+' [data-social-player]');
      await avatar.hover();
      await page.waitForFunction(()=>!document.querySelector('#cms-picker').hidden);
      assert.equal(await page.locator('#cms-picker').getAttribute('data-kind'),id===0?'emote':'throw');
      assert.equal(await page.locator('#cms-profile').isVisible(),false);
      assert.equal(await avatar.getAttribute('aria-expanded'),'true');
      if(id!==0)assert.match(await page.locator('#cms-picker').textContent(),new RegExp(await page.locator(`#player-info-${id} .cm-player-row__name`).textContent()));
      const inside=await page.evaluate(()=>{const a=document.querySelector('#mjg-stage').getBoundingClientRect(),b=document.querySelector('#cms-picker').getBoundingClientRect();return b.left>=a.left&&b.top>=a.top&&b.right<=a.right+1&&b.bottom<=a.bottom+1;});
      assert.equal(inside,true);
      await page.keyboard.press('Escape');
    }
    for(let id=0;id<4;id++){
      const row=page.locator(`#player-info-${id}`),button=row.locator('[data-profile]');
      assert.equal(await button.evaluate(el=>el.nextElementSibling.classList.contains('cm-wind-tile')),true);
      assert.equal(await row.locator('.cm-wind-tile').textContent(),['東','南','西','北'][id]);
      await button.click();
      assert.equal(await page.locator('#cms-profile-title').textContent(),'Profile');
      assert.equal(await page.locator('#cms-profile h3').textContent(),await row.locator('.cm-player-row__name').textContent());
      await page.getByRole('button',{name:'Close player profile',exact:true}).click();
    }
  });
  await test('Hover menus remain usable across the gap and support keyboard and touch entry', async (page,context) => {
    await useStaticAvatar(page);
    const avatar=page.locator('#player-info-0 [data-social-player]');
    await avatar.hover();await page.waitForTimeout(240);
    assert.equal(await page.locator('#cms-picker').isVisible(),true);
    await page.locator('#cms-picker-grid').hover();await page.waitForTimeout(360);
    assert.equal(await page.locator('#cms-picker').isVisible(),true);
    await page.locator('#cms-picker-grid [data-asset="56"]').click();
    await page.waitForSelector('.cms-effect[data-asset="56"]');
    assert.equal(await page.locator('#cms-picker').isVisible(),false);
    await avatar.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#cms-picker').isVisible(),true);
    await page.keyboard.press('Escape');
    assert.equal(await avatar.evaluate(el=>el===document.activeElement),true);
    const touchContext=await context.browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
    const touch=await touchContext.newPage();await touch.goto(base);
    await touch.locator('#cms-mobile-players').tap();
    await touch.locator('#cms-players-list [data-social-player="0"]').tap();
    assert.equal(await touch.locator('#cms-picker').getAttribute('data-kind'),'emote');
    await touch.locator('#cms-picker-close').tap();
    await touch.locator('#cms-mobile-players').tap();
    await touch.locator('#cms-players-list [data-social-player="2"]').tap();
    assert.equal(await touch.locator('#cms-picker').getAttribute('data-kind'),'throw');
    await touch.locator('[data-character-throw="A"]').tap();
    await touch.waitForSelector('#cms-character-scene[data-target="2"]');
    await touchContext.close();
  });
  await test('Emoji sound loads its mapped clip and stops requesting clips when muted', async page => {
    await useStaticAvatar(page);
    const audio=[];
    page.on('response',response=>{if(response.url().endsWith('.wav'))audio.push({url:response.url(),status:response.status()});});
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.getByRole('tab',{name:'Chips',exact:true}).click();
    const clipLoaded=page.waitForResponse(response=>response.url().endsWith('48_chip4.wav'));
    await page.locator('#cms-picker-grid [data-asset="48"]').click();
    await clipLoaded;
    assert.ok(audio.some(r=>r.status===200));
    await page.getByRole('button',{name:'Settings',exact:true}).click();
    await page.getByRole('tab',{name:'Interactions',exact:true}).click();
    await page.getByLabel('Emoji Playing').uncheck();
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.locator('.cms-seat[data-player="0"] [data-social-player]').click();
    await page.locator('#cms-picker-grid [data-asset="49"]').click();
    await page.waitForSelector('.cms-effect[data-asset="49"] svg');
    await page.waitForTimeout(150);
    assert.equal(audio.some(r=>r.url.endsWith('49_chip5.wav')),false);
  });
  if (process.env.RESULT_PATH) fs.writeFileSync(process.env.RESULT_PATH, JSON.stringify({checked_at:new Date().toISOString(),browser:'Chrome via Playwright',base,prototype_folder:prototypeFolder,source_sha256:Object.fromEntries(['support/prototype/input.js','support/prototype/character.js','support/prototype/character.css','support/prototype/assets/momo.svg','support/prototype/social.js','support/prototype/social.css','mahjong-game-standalone.html'].map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(prototypeRoot,file))).digest('hex')])),results}, null, 2)+'\n');
  if (results.some(result => !result.passed)) process.exitCode = 1;
})();
