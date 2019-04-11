(function guiModule() {
  'use strict';

  /**
   * @fileoverview Maintains the graphical interface and
   * associated data, and exposes an update method to send
   * updates to the data and trigger an update.
   * A custom event listener may replace or supplement the
   * update function.
   * @todo Implement proper UX.
   */

  const BASE_ID = 'tto';
  const BUBBLE_RADIUS = 80;
  const BUBBLE_TIME = 750;
  const BUBBLE_COLORS = {
    high: '#dd4b39',
    medium: '#4b0082',
    low: '#575777',
  };
  const TOAST_MAX_LENGTH = 30;
  const GUI_TEXT_MAX_LENGTH = 150;

  const guiState = Object.seal({
    stage: 'Loading...',
    counters: {},
    issues: [],
  });

  function setState(packet) {
    for (let prop in packet) {
      const incoming = packet[prop];
      const state = guiState[prop];
      if (state === undefined) {
        continue;
      }
      guiState[prop] = incoming;
    }
    return true;
  }

  /**
   * Sets a listener on the document for gui updates.
   */
  (function addGuiUpdateListener() {
    document.addEventListener('guiUpdate', ({detail}) => {
      detail.toast && toast(detail.toast);
      setState(detail);
    }, {passive: true});
  })();

  (function addStylesheet () {
    const style = document.createElement('style');
    document.head.append(style);
    const addRule = (p) => style.sheet.insertRule(p, 0);
    const rules = [
      `.${BASE_ID}container { background-color: #f4f4f4 }`,
      `.${BASE_ID}container { font-size: 1.2em }`,
      `.${BASE_ID}container { opacity: 0.8 }`,
      `.${BASE_ID}container { overflow: hidden }`,
      `.${BASE_ID}container { pointer-events: none }`,
      `.${BASE_ID}container { padding: 10px }`,
      `.${BASE_ID}container { position: absolute }`,
      `.${BASE_ID}container { right: 3px }`,
      `.${BASE_ID}container { top: 30px }`,
      `.${BASE_ID}container { width: 16em }`,
      `.${BASE_ID}container { z-index: 2000 }`,
      `.${BASE_ID}container p { margin: 4px }`,
      `.${BASE_ID}container em { font-weight: bold }`,
      `.${BASE_ID}container em { font-style: normal }`,
      `.${BASE_ID}container .high { color: #dd4b39 }`,
      `.${BASE_ID}container .medium { color: #4b0082 }`,
      `.${BASE_ID}container .low { color: #303077 }`,
      `.${BASE_ID}bubble { border-radius: 50% }`,
      `.${BASE_ID}bubble { opacity: 0.25 }`,
      `.${BASE_ID}bubble { pointer-events: none }`,
      `.${BASE_ID}bubble { z-index: 1999 }`,
      `.${BASE_ID}bubble { transition-duration: ${2 * BUBBLE_TIME / 1000}s;}`,
      `.lpButton button { cursor: not-allowed }`,
      `.lpButton button { opacity: 0 }`,
      `.submitTaskButton { cursor: not-allowed }`,
      `.submitTaskButton { opacity: 0 }`,
      `#gwt-debug-application-one-bar { transition-property: background-color }`,
      `#gwt-debug-application-one-bar { transition-duration: 3s;}`,
    ];
    rules.forEach(addRule);
  })();

  var toast = (function toastMiniModule() {
    const toast = document.createElement('div');
    toast.classList = 'toast';
    toast.style.backgroundColor = 'black';
    toast.style.bottom = '30px';
    toast.style.boxShadow = '0 0.2em 0.5em #aaa';
    toast.style.color = 'white';
    toast.style.right = '30px';
    toast.style.padding = '0.8em 1.2em';
    toast.style.pointerEvents = 'none';
    toast.style.position = 'fixed';
    toast.style.zIndex = '2001';
    document.body.append(toast);
    toast.hidden = true;
    let timer;
    const hide = () => {
      toast.innerText = '';
      toast.hidden = true;
    }
    return (message) => {
      clearTimeout(timer);
      timer = setTimeout(hide , 1000);
      toast.hidden = false;
      toast.innerText = message
          .toString()
          .slice(0, TOAST_MAX_LENGTH)
          .split('\n')[0]
          .replace(/[:*.,]$/, '');
    }
  })();

  const container = (function createContainer() {
    const div = document.createElement('div');
    div.classList = BASE_ID + 'container';
    div.innerHTML = 'Loading ...';
    document.body.append(div);
    async function setContent(html) {
      await util.wait();
      div.innerHTML = html;
    }
    return {div, setContent};
  })();

  async function bubble({proxy, issueLevel}) {
    if (!proxy || !proxy.getCoords) {
      return;
    }
    const coords = proxy.getCoords();
    let top;
    let left;
    let radius;
    if (coords.top === 0 && coords.left === 0) {
      radius = BUBBLE_RADIUS * 4;
      top = 0 - radius;
      left = window.innerWidth - radius;
    } else if (coords.top > window.innerHeight) {
      radius = BUBBLE_RADIUS * 2;
      top = window.innerHeight - BUBBLE_RADIUS * (2/3);
      left = coords.left + (coords.width / 2) - radius;
    } else if (coords.top > 0) {
      radius = BUBBLE_RADIUS;
      top = coords.top + (coords.height / 2) - radius;
      left = coords.left + (coords.width / 2) - radius;
    } else {
      radius = BUBBLE_RADIUS * 2;
      top = 0 - BUBBLE_RADIUS * 3;
      left = coords.left + (coords.width / 2) - radius;
    }

    const div = document.createElement('div');
    div.classList = BASE_ID + 'bubble';
    div.style.top = top + 'px';
    div.style.left = left + 'px';
    div.style.padding = radius + 'px';
    div.style.position = 'fixed';
    document.body.append(div);
    div.style.backgroundColor = BUBBLE_COLORS[issueLevel] || BUBBLE_COLORS.high;
    await util.wait();
    div.style.opacity = 0;
    await util.wait(BUBBLE_TIME * 2);
    document.body.removeChild(div);
  }

  function update() {
    let html = [];
    const p = (type, text, title = '') => {
      const slicedText = text.slice(0, GUI_TEXT_MAX_LENGTH);
      html.push(`<p class="${type}"><em>${title}</em><br>${slicedText}</p>`);
    };
    const x = [];
    for (let counter in guiState.counters) {
      x.push(counter + ': ' + guiState.counters[counter]);
    }
    p('stage', util.cap.firstLetter(guiState.stage), 'Stage');
    p('counter', x.join(' | ') || 'No tasks counted', 'Task counter');
    for (let issue of guiState.issues) {
      p(issue.issueLevel, issue.message, issue.issueType);
      if (user.config.get('play beeps on error') && issue.issueLevel !== 'low') {
        util.beep();
      }
      bubble(issue);
    }
    container.setContent(html.join('\n'));
  }
  let ts;
  setInterval(update, BUBBLE_TIME);
})();