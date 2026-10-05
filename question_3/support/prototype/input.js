/* Question 3 input routing. Text is inserted by the browser, never rebuilt from key names. */
(() => {
  'use strict';
  window.createMahjongInput = ({ input, ready, isChatOpen, openChat, closeChat,
    closeMenu, hasModal, requestAction, selectTarget, clearTarget, targetModifier }) => {
    let composing = false, compositionEndedAt = -Infinity, target = null, commandInput = false;
    const editable = node => node instanceof Element && !!node.closest(
      'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]');
    const cancelTarget = () => { target = null; clearTarget(); };
    const compositionKey = event => composing || event.isComposing || event.keyCode === 229;
    const targetHeld = event => targetModifier() === 'alt-shift'
      ? event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey
      : event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey;
    const consume = event => { event.preventDefault(); event.stopImmediatePropagation(); };
    const editing = event => [event.target,document.activeElement].some(node => editable(node) && (node !== input || isChatOpen()));

    document.addEventListener('compositionstart', event => {
      if (event.target !== input) return;
      composing = true;
      cancelTarget();
      openChat();
    }, true);
    input.addEventListener('compositionend', () => {
      composing = false;
      compositionEndedAt = performance.now();
    });
    input.addEventListener('beforeinput', event => {
      if (!isChatOpen() && commandInput) { event.preventDefault(); return; }
      if (event.inputType.startsWith('insert') && !isChatOpen()) openChat();
    });
    input.addEventListener('keydown', event => {
      // Some IMEs end composition before their confirming Enter keydown.
      if (event.key === 'Enter' && (!isChatOpen() || compositionKey(event) || performance.now() - compositionEndedAt < 60 || event.repeat)) {
        event.preventDefault();
      }
    });

    document.addEventListener('keydown', event => {
      if (!ready() || event.defaultPrevented) return;
      commandInput = event.ctrlKey || event.altKey || event.metaKey;
      if (hasModal()) { cancelTarget(); return; }
      // Focus before the browser begins composition. Do not consume this event.
      if (!editing(event) && !event.ctrlKey && !event.altKey && !event.metaKey &&
          (event.key === 'Process' || event.key === 'Dead' || event.keyCode === 229)) {
        openChat();
        return;
      }
      if (compositionKey(event)) return;
      if (event.key === 'Escape') {
        if (target !== null) { consume(event); cancelTarget(); return; }
        if (closeMenu()) { consume(event); return; }
        if (isChatOpen()) { consume(event); closeChat(); }
        return;
      }
      if (editing(event)) { cancelTarget(); return; }
      if (event.repeat) {
        if (targetHeld(event) || event.altKey || event.ctrlKey || event.metaKey || /^Digit[123]$/.test(event.code) && event.shiftKey) consume(event);
        return;
      }
      const digit = /^Digit([1-6])$/.exec(event.code)?.[1];
      if (targetHeld(event)) {
        if (digit && Number(digit) <= 4) {
          consume(event);
          cancelTarget();
          const id = Number(digit) - 1;
          if (selectTarget(id)) target = id;
        } else if (/^Key[QW]$/.test(event.code)) {
          consume(event);
          if (target !== null) {
            const id = target;
            cancelTarget();
            requestAction({ kind:'throwable', action:event.code === 'KeyQ' ? 'A' : 'B', target:id });
          }
        }
        return;
      }
      if (target !== null) cancelTarget();
      if (digit && Number(digit) <= (event.altKey ? 6 : 3) && !event.ctrlKey && !event.metaKey && event.shiftKey !== event.altKey) {
        consume(event);
        requestAction({ kind:event.altKey ? 'quick-message' : 'emote', slot:Number(digit) });
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      // Space retains native activation on buttons, links and summary controls.
      if (event.key === ' ' && event.target.closest?.('button,a,summary,[role="button"]')) return;
      if ([...event.key].length === 1) openChat();
    }, true);
    document.addEventListener('keyup', event => { if (target !== null && !targetHeld(event)) cancelTarget(); }, true);
    document.addEventListener('pointerdown', cancelTarget, true);
    document.addEventListener('focusin', event => { if (editable(event.target) || hasModal()) cancelTarget(); });
    window.addEventListener('blur', () => { cancelTarget(); composing = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelTarget(); composing = false; } });
    return Object.freeze({ cancelTarget, canSubmit:() => !composing && performance.now() - compositionEndedAt >= 60 });
  };
})();
