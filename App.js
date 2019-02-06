////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ENVIRONMENT module

var environment = (function environmentModule() {
  'use strict';
 
  /**
   * @fileoverview Provides access to variables about the current workflow.
   */

  /**
   * @return {string} Description of the current workflow.
   */
  function detectWorkflow() {
    const header = ー({
      name: 'Header',
      select: 'h1',
      pick: [0],
    })[0];
    const headerText = header && header.textContent;

    switch (true) {
      case /telinks/.test(headerText):
        return 'sl';
      case /ppets/.test(headerText):
        return 'ss';
      case headerText === 'TwoTwentyOne Dutch':
        return 'sl';
      default:
        return 'home';
    }
  }

  /**
   * Checks DOM for locale indicators.
   * @return {string}
   */
  function detectLocale() {
    const header = ー({
      name: 'Header',
      select: 'h1',
      pick: [0],
    })[0];
    const headerText = header && header.textContent;
    if (!headerText) {
      return;
    }
    return headerText.trim().split(/\s+/).pop();
  }

  function detectTaskId() {
    if (util.isDev()) {
      return {
      encoded: 'fffff',
      decoded: '555' + Math.round(Math.random() * 1e11),
    };;
    }
    const currentTask =
        Object.entries(JSON.parse(localStorage.acquiredTask))[0];
    return {
      encoded: currentTask[0],
      decoded: currentTask[1],
    };
  }

  return {
    flowName: detectWorkflow,
    locale: detectLocale,
    taskId: detectTaskId,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// WORKFLOW METHODS module

var shared = (function workflowMethodsModule() {
  'use strict';
 
  /**
   * @fileoverview Exports an object packed with methods
   * designed to add reactions to HTMLElement proxies.
   */

  const ALERT_LEVELS = ['red', 'orange', 'yellow'];

  /**
   * Convenience function. Conditionally set a new value to a proxy.
   *
   * @param {Object} o
   * @param {string} o.to - The new value.
   * @param {function} o.when - A function that returns an object containing
   * a hit property, a proxy property and optionally a message property.
   * If the hit property is true, the proxy value is changed.
   * The message property is ignored.
   * @param {boolean} o.is - Should the change be made if the hit property is
   * true?
   *
   * @example
   * const conditional = () => ({hit: true, proxy: {value: 'originalValue'}});
   * changeValue({
   *   to: 'newValue',
   *   when: conditional,
   *   is: true,
   * })
   * This would change the value of the object returned by the conditional
   * function.
   */
  function changeValue({to, when, is = true}) {
    if (typeof to !== 'string') {
      throw new TypeError('ChangeValue requires a new string value');
    }
    if (typeof when !== 'function') {
      throw new TypeError('ChangeValue requires a function');
    }
    return function (...params) {
      const {hit, proxy} = when(...params);
      if (hit === is && proxy.value !== to) {
        user.log.low(
          `Set to ${(to) ? to : 'blank'}`,
          {print: false, toast: true},
        );
        proxy.value = to;
      }
    }
  }
  test.group('changeValue', () => {
    const proxy = {value: 'z'};
    const tester = (proxy) => ({hit: true, proxy}); 
    changeValue({to: 'x', when: tester})(proxy);
    test.ok(proxy.value === 'x', 'Changed value');
  });

  /**
   * Convenience function. Report a new issue or update the status of an issue.
   *
   * @param {Object} o
   * @param {string} o.issueLevel - The potential issueLevel of the issue.
   * @param {string} o.issueType - The type of the issue.
   * @param {function} o.when - A function that returns an object containing
   * a hit property, a proxy property and optionally a message property.
   * If the hit property is true, the issue is flagged according to the color
   * parameter, else it is flagged as 'ok'.
   * The message property is attached to the issue.
   *
   * @example
   * const conditional = () => ({hit: true, proxy: {value: 'originalValue'}});
   * issueUpdate({
   *   issueType: 'Description of issue',
   *   when: conditional,
   *   is: true,
   * })
   * This would dispatch an event that means that this proxy has an issue.
   */
  function issueUpdate({issueLevel, issueType, when, is = true}) {
    if (!ALERT_LEVELS.includes(issueLevel)) {
      throw new RangeError(
        issueLevel + ' is not a known issueLevel. Please use:' +
        util.mapToBulletedList(ALERT_LEVELS),
      );
    }
    if (typeof when !== 'function') {
      throw new TypeError('IssueUpdate requires a function');
    }
    if (typeof issueType !== 'string') {
      throw new TypeError('IssueUpdate requires a new string value');
    }
    function flagThis(...params) {
      const {proxy, hit, message} = when(...params);
      const packet = {proxy, issueType};
      if (hit === is) {
        packet.issueLevel = issueLevel;
        packet.message = message;
        if (ref.editButton && ref.editButton[0]) {
          ref.editButton.click();
        }
      }
      util.dispatch('issueUpdate', packet);
    };
    return util.delay(flagThis, 20);
  }

  /**
   * A function that returns an object containing a hit property, a proxy
   * property and a message property.
   *
   * @param {RegExp} regex - Regular expression that will be matched with the
   * proxy value.
   * @param {boolean} shouldMatch - Is a match between regex and proxy
   * value considered a successful hit?
   * @return {Object} o
   * @return {Object} o.proxy - The matched proxy
   * @return {Object} o.hit - Was the match successful?
   * @return {Object} o.message - 
   * @example - Using testRegex(/x/, true) on a proxy with a value of 'x'
   * would return an object with hit = true, message = 'x did match /x/'
   */
  function testRegex(regex, shouldMatch = true) {
    return (proxy) => {
      const hit = regex.test(proxy.value) === shouldMatch;
      const didOrShouldNot = shouldMatch ? 'did' : 'should not';
      const message = `'${proxy.value}' ${didOrShouldNot} match ${regex}`;
      return {proxy, hit, message};
    }
  };
  test.group('textRegex', () => {
    const proxy = {value: 'x'};
    const one = testRegex(/x/, true)(proxy);
    test.ok(one.hit === true, 'one: hit');
    test.ok(one.message === 'x did match /x/', 'one: message');
    const two = testRegex(/x/, false)(proxy);
    test.ok(two.hit === false, 'two: no hit');
    test.ok(two.message === 'x should not match /x/', 'two: message');
    const three = testRegex(/c/, false)(proxy);
    test.ok(three.hit === true, 'three: hit');
    test.ok(three.message === 'x should not match /c/', 'three: message');
  });

  /**
   * A function that returns an object containing a hit property, a proxy
   * property and a message property.
   *
   * @param {RegExp} regex - Regular expression that will be matched with the
   * proxy value.
   * @param {boolean} shouldMatch - Is a match between regex and proxy
   * value considered a successful hit?
   * @return {Object} o
   * @return {Object} o.proxy - The matched proxy
   * @return {Object} o.hit - Was the match successful?
   * @return {Object} o.message - 
   * @example - Using testRegex(/x/, true) on a proxy with a value of 'x'
   * would return an object with hit = true, message = 'x did match /x/'
   */
  function testLength ({min, max}) {
    return (proxy) => {
      const length = proxy.value.length;
      let hit = false;
      if (min && min > length) {
        const message = proxy.value + ' is too short';
        return {proxy, hit: true, message};
      }
      if (max && max < length) {
        const message = proxy.value.slice(0, max) + '... is too long';
        return {proxy, hit: true, message};
      }
      return {proxy, hit: false};
    }
  };
  test.group('textLength', () => {
    const one = testLength({min: 2})({value: 'x'});
    test.ok(one.hit === true, 'one: hit');
    test.ok(one.message === 'Value is too short', 'one: message');
    const two = testLength({max: 3})({value: 'x'});
    test.ok(two.hit === false, 'two: no hit');
    test.ok(two.message === undefined, 'two: message');
    const three = testLength({min: 2, max: 5})({value: 'x x x'});
    test.ok(three.hit === false, 'one: no hit');
    test.ok(three.message === undefined, 'two: message');
  }, true);

  /**
   * For developers, this function is an example of a tester function.
   * Implement the actual testing logic, then hook the function into either:
   * 1) The issueUpdate function:
   * issueUpdate{
   *   issueType: 'Description of the issue',
   *   when: exampleTester // Your tester function.
   * }
   * 2) The changeValue function:
   * changeValue{
   *   to: 'newValue',
   *   when: exampleTester // Your tester function.
   * }
   * issueUpdate and changeValue will be triggered when your function returns
   * an object with a property hit = true.
   * 
   * Note that you can also create a function that acts directly on the object.
   * You don't need to use the convenience functions.
   */
  function exampleTester(params) {
    return (proxy, idx, group) => {
      // Your code goes here
      const hit = true
      const message = 'This message describes the issue';
      return {proxy, hit, message};
    }
  }

  function forbiddenPhrase(proxy) {
    const phrases = user.storeAccess({
      feature: 'ForbiddenPhrases',
      locale: environment.locale(),
    }) || [];
    const packet = {proxy, issueType: 'Forbidden phrase'};
    for (let rule of phrases) {
      const [phrase, message] = rule;
      if (util.toRegex(phrase).test(proxy.value)) {
        const clearValue = proxy.value.replace(/\s/, '░');
        const clearPhrase = phrase.replace(/\s/, '░');
        packet.issueLevel = 'orange';
        packet.message = (message)
            ? `${message} (${clearValue})`
            : `'${clearValue}' matches '${clearPhrase}'`;
        break;
      }
    }
    util.dispatch('issueUpdate', packet);
  }

  /**
   * Cycle a select HTMLElement through a series of options.
   *
   * @param {string[]} options - Options to cycle through.
   */
  function cycleSelect(options) {
    /**
     * @param {Object} proxy - Select HTMLElement proxy.
     */
    function cycle(proxy) {
      if (!options.includes(proxy.value)) {
        throw new RangeError('Element does not have a matching value.');
      }
      const idx = options.findIndex((option) => option === proxy.value);
      const nextIdx = (idx + 1) % options.length;
      proxy.value = options[nextIdx];
      proxy.blur();
    }
    return cycle;
  }
  test.group('cycleSelect', () => {
    const toggleSelectYesNo = cycleSelect(['YES', 'NO']);
    const proxy = {value: 'NO', blur: () => {}};
    toggleSelectYesNo(proxy);
    test.ok(proxy.value === 'YES', 'Changed to yes');
    toggleSelectYesNo(proxy);
    test.ok(proxy.value === 'NO', 'Changed back');
  });



////////////////////////////////////////////////////////////////////////////////
  // Exported functions

  /**
   * Simplifies common changes to the comment box.
   *
   * @param {string} mode - Either 'addInitials' or 'removeInitials'.
   * @ref {ref.finalCommentBox}
   */
  function editComment(mode) {
    const commentBox = ref.finalCommentBox && ref.finalCommentBox[0];
    if (!commentBox || !commentBox.click) {
      throw new Error('EditComment requires a valid textarea proxy');
    }
    if (mode === 'addInitials') {
      commentBox.focus();
      commentBox.scrollIntoView();
      const initials = user.config.get('initials') || '';
      if (new RegExp('^' + initials).test(commentBox.value)) {
        return;
      }
      commentBox.value = initials + '\n' + commentBox.value;
    } else if (mode === 'removeInitials') {
       const initials = user.config.get('initials') || '';
       commentBox.value =
           commentBox.value.replace(RegExp('^' + initials + '\n'), '');
    }
  }

  /**
   * Opens/closes tabs based on urls on the page. Opens new tabs based on unique
   * link values in ref.openInTabs. Order of tabs is determined by ref.openInTabs.
   *
   * #close Close all currently opened tabs.
   * #open Opens all unique links.
   * #refresh Closes all currently opened tabs, then opens all unique links.
   * @ref {ref.openInTabs}
   */
  const tabs = (function tabsMiniModule() {
    /** Window[] - Stores open tabs */
    const openTabs = [];
    async function close() {
      const currentTabs = openTabs.slice();
      openTabs.length = 0;
      await util.wait(100);
      currentTabs.forEach(tab => tab.close());
    }
    async function open() {
      await util.wait(100);
      const urls = ref.openInTabs
          .map(el => el.value)
          .filter(val => /^http/.test(val));
      const uniqueLinks = [...new Set(urls)];
      for (let link of uniqueLinks) {
        openTabs.push(window.open(link, link));
      };
      if (openTabs.length !== uniqueLinks.length) {
        user.log.warn(
          `Could not open all tabs. Check the Chrome popup blocker.`,
        );
      }
    }
    return {
      open,
      close,
      refresh: () => { close(); open(); },
    }
  })();

  function commonReplacements(value) {
    const replacementStore = user.storeAccess({
      feature: 'CommonReplacements',
      locale: environment.locale(),
    }) || [];
    let tmpValue = (/^http/.test(value))
        ? decodeURIComponent(
            value
                .replace(/\/index/i, '')
                .match(/[^\/]*[\/]?$/)[0]
                .replace(/(\.\w+)$/i, ''),
          )
        : value;
    tmpValue = tmpValue.replace(/[\s+/_-]+/g, ' ')
          .replace(/[#?­*]/g, '')
          .replace(/’/, `'`)
          .trim().toLowerCase();
    for (let rule of replacementStore) {
      const [regex, replaceWith] = rule;
      tmpValue = tmpValue.replace(util.toRegex(regex), replaceWith);
    }
    return util.capitalize('first letter', tmpValue);
  }
  switch (environment.locale()) {
    case 'Dutch':
      atest.group('commonReplacements', {
        'About us': () => commonReplacements('overons') === 'Over ons',
        'Read our blog': () => commonReplacements('blog') === 'Lees onze blog',
      });
      break;
    default:
      break;
  }
  

  function brandCapitalisation(value) {
    const brands = user.storeAccess({
      feature: 'BrandCapitalisation',
    }) || [];
    let tmpValue = value;
    for (let brand of brands) {
      tmpValue = tmpValue.replace(new RegExp(brand, 'gi'), brand);
    }
    return tmpValue;
  }
  atest.group('brandCapitalisation', {
    'iPhone': () => brandCapitalisation('Iphone') === 'iPhone',
  });

  /**
   * When pasting a url, it is moved from one box to another. The url is also
   * analysed and reduced to a descriptive string.
   * E.g. pasting 'http://www.example.com/hats' into the first box, it moves
   * the url to the second box and writes 'Hats' to the first box.
   *
   * @param {Object} _ - Unused parameter. The triggering proxy.
   * @param {number} idx - Index of the proxy in the group.
   * @param {Object[]} group - Array of two proxies.
   */
  function fallThrough (_, idx, group) {
    const LOG_ENTRY_MAX_LENGTH = 100;
    if (group.length !== 2) {
      throw new RangeError('fallThrough requires two proxies.')
    }
    if (idx > 0) {
      return;
    }
    const pastedValue = group[0].value;
    if (/plex/.test(pastedValue)) {
      group[0].value = '';
      user.log.warn('Cannot paste a screenshot here');
      util.wait().then(() => group[0].click());
      return;
    }
    if (/^https?:/.test(pastedValue)) {
      group[1].value = pastedValue;
    }
    let value = brandCapitalisation(commonReplacements(group[0].value));
    group[0].value = value;
    if (value.length > LOG_ENTRY_MAX_LENGTH) {
      value = value.slice(0,LOG_ENTRY_MAX_LENGTH - 3) + '...';
    }
    if (pastedValue === value) {
      user.log.low(
        `No change to '${pastedValue}'`,
        {print: false, toast: false},
      );
      return;
    }
    user.log.notice(
      `'${value}' from '${pastedValue}'`,
    );
  };
  test.group('fallThrough', () => {
    const a = {value: 'a'};
    const b = {value: 'b'};
    fallThrough(1, 0, [a, b]);
    test.ok(a.value === 'Moved', 'a.value = Moved');
    test.ok(b.value === 'a', 'b.value = a');
  }, true);
  fallThrough = util.delay(fallThrough, 0);

  /**
   *
   */
  function guiUpdate(message) {
    util.dispatch('guiUpdate', {toast: message, stage: message});
  };

  /**
   * Touches HTMLElements to keep the current task alive.
   * Function is called on a group of elements, but only runs once.
   * Periodically picks a random element from the group, and touches it.
   *
   * @param {Object} _ - Proxy object. Ignored.
   * @param {number} __ - Element idx. Ignored.
   * @param {Object[]} group - Array of proxies to touch.
   */
  async function keepAlive(_, __, group) {
    const MINUTES = 6;
    const INTERVAL = 10000; // ms
    const times = (MINUTES * 60000) / INTERVAL;
    for (let i = 0; i < times; i++) {
      await util.wait(INTERVAL);
      const idx = Math.floor(Math.random() * group.length);
      group[idx].touch();
    }
  }
  keepAlive = util.debounce(keepAlive);

  /**
   * Based on an extraction value, attempts to find matching data to
   * automatically fill in.
   * @param {Object} proxy - The proxy containing the extraction url.
   * @todo Combine with Save feature
   */
  function prefill(proxy) {
    const flowName = util.capitalize('first letter', environment.flowName());
    const values = user.storeAccess({
      feature: `${flowName}Prefill`,
      locale: environment.locale(),
      get: util.getDomain(proxy.value),
    });
    if (!values) {
      return;
    }
    const targets = ref.prefillTarget;
    if (targets.some(t => t.value)) {
      return user.log.warn('Found prefill values, but did not override');
    }
    user.log.notice('Found prefill values');
    for (let idx in values) {
      targets[idx].value = values[idx];
    }
  }

    /**
   * Tests whether any proxies in a group have the same value, and flags
   * proxies that repeat previous values.
   *
   * @param {Object} _ - Unused parameter. The triggering proxy.
   * @param {number} __ - Unused parameter. The index of the triggering proxy.
   * @param {Object[]} group - Array of proxies to check for duplicate values.
   */
  function noDuplicateValues(_, __, group, testing) {
    const values = [];
    const dupes = [];
    const packets = [];
    for (let proxy of group) {
      const value = proxy.value;
      if (values.includes(value)) {
        dupes.push(value);
      }
      if (value !== '') {
        values.push(value);
      }
    }
    for (let proxy of group) {
      const value = proxy.value;
      let packet = {proxy, issueType: 'Dupes'};
      if (dupes.includes(value)) {
        packet.issueLevel = 'red';
        packet.message = `Duplicate values '${value}' in ${proxy.name}`;
      }
      packets.push(packet);
      if (value) {
        values.push(value);
      }
    }
    for (let packet of packets) {
      if (!testing) {     
        util.dispatch('issueUpdate', packet);
      }
    }
    return packets;
  };
  test.group('noDuplicateValues', () => {
    const run = (group) => {
      return noDuplicateValues(0, 0, group, true)
          .filter(issue => issue.message);
    }
    const a = {};
    const b = {value: ''};
    const c = {value: ''};
    const d = {value: 'x'};
    const e = {value: 'x'};
    test.ok(run([a]).length === 0, 'Single proxy, no issue');
    test.ok(run([a, d]).length === 0, 'Two proxies, no issues');
    test.ok(run([b, c]).length === 0, 'Two proxies, no issues, still');
    test.ok(run([a, b, c, c, d]).length === 0, 'Five proxies, no issue');
    test.ok(run([a, b, c, d, e]).length === 2, 'Five proxies, two issues');
    test.todo('Async test');
  });
  noDuplicateValues = util.delay(noDuplicateValues, 100);

  /**
   * Pops up a confirmation dialog. On confirmation, will reset all counters.
   */
  async function resetCounter() {
    const question =
        'Please confirm.\nAre you sure you want to reset all counters?' +
        util.mapToBulletedList(user.counter.get());
    user.log.counter(question, {toast: true});
    await util.wait();
    if (confirm(question)) {
      user.counter.reset();      
    } else {
      user.log.low('Canceled');
    }
  }

  /**
   * Save the values from the current extraction.
   * Logs the values, and adds them to the prefill data store.
   */
  function saveExtraction() {
    const values = ref.saveExtraction.map(element => element.value);
    const domain = util.getDomain(values[0]);
    if (!domain) {
      return user.log.warn('Not enough data to save.');
    }
    const extractionData = {[domain]: values.slice(1)};
    const flowName = util.capitalize('first letter', environment.flowName());
    user.storeAccess({
      feature: `${flowName}Prefill`,
      locale: environment.locale(),
      set: {[domain]: values.slice(1)},
      value: values.slice(1),
    });
    user.log.ok(
      'Saving new default extraction for ' + domain +
      util.mapToBulletedList(values.slice(1), 2),
    );
  }

  /**
   * Skip the current task.
   * Currently takes no parameters but could be rewritten to override the
   * locations of the buttons in the DOM.
   */
  async function skipTask() {
    const RETRIES = 20;
    const DELAY = 25; // ms

    const confirmButtonSelector = {
      name: 'Confirm Skip',
      select: '.gwt-SubmitButton',
      pick: [0],
    };

    function clickConfirm() {
      const button = ー(confirmButtonSelector)[0];
      if (button) {
        button.click();
        user.log.notice('Skipping task ' + environment.taskId().decoded);
        user.counter.add('Skipped');
        return true;
      }
      return false;
    }

    const skipButton = ref.fresh('skipButton');
    if (!skipButton) {
      user.log.warn('Skip button not found.');
      return;
    }
    skipButton.click();
    await util.retry(clickConfirm, RETRIES, DELAY)();
    util.dispatch('issueUpdate', {issueType: 'reset'});
    shared.tabs.close();
  }

  /**
   * Attempt to submit the task.
   */
  async function submit() {
    const button = ref.submitButton && ref.submitButton[0];
    if (!button) {
      throw new TypeError('Submit requires a valid submit button proxy');
    }
    if (button.disabled) {
      user.log.warn('Not ready to submit');
      return false;
    }
    user.log.notice('Submitting ' + environment.taskId().decoded);
    await util.wait(100);
    button.click();
    util.dispatch('issueUpdate', {issueType: 'reset'});
    user.counter.add('Submitted');
    return true;
  }
  submit = util.debounce(submit, 100);

  function setTabOrder(_, __, group) {
    for (let idx in group) {
      group[idx].tabIndex = idx + 1;
    }
    group[0].focus();
  }

  function removeTabIndex(proxy) {
    proxy.tabIndex = -1;
  }

  return {
    editComment,
    tabs,
    fallThrough,
    guiUpdate,
    keepAlive,
    forbiddenPhrase,
    prefill,
    noDuplicateValues,
    removeTabIndex,
    resetCounter,
    saveExtraction,
    setTabOrder,
    skipTask,
    submit,

    addDashes: changeValue({
      to: '---',
      when: testRegex(/^$/),
      is: true,
    }),

    redAlertExceed25Chars: issueUpdate({
      issueLevel: 'red',
      issueType: 'More than 25 characters long',
      when: testLength({max: 25}),
    }),

    removeDashes: changeValue({
      to: '',
      when: testRegex(/---/),
      is: true,
    }),

    requireUrl: changeValue({
      to: '',
      when: testRegex(/^http/),
      is: false,
    }),

    requireScreenshot: changeValue({
      to: '',
      when: testRegex(/gleplex/),
      is: false,
    }),

    removePorg: changeValue({
      to: '',
      when: testRegex(/le.com\/eva/),
      is: true,
    }),

    removeScreenshot: changeValue({
      to: '',
      when: testRegex(/gleplex/),
      is: true,
    }),

    toggleSelectYesNo: cycleSelect(['YES', 'NO']),
  }
}
)();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// WORKFLOW module

var flows = (function workflowModule() {
  'use strict';
 
  /**
   * @fileoverview Exports an object for each supported workflow.
   */

  const home = (function homeModule() {

    function init() {

      shared.guiUpdate('Ready');

      /**
       * Click the 'Acquire next task' button.
       */
      async function clickAcquire() {
        const button = ref.firstButton[0];
        button.click();
        try {
          await util.retry(clickContinue, 20, 100)();
        } catch (e) {
          user.log.warn('Continue button did not appear.', {print: false});
        }
        main();
      }

      /**
       * Click the 'Continue to Task' button if it exists.
       */
      function clickContinue() {
        const continueButton = ref.fresh('firstButton');
        if (continueButton && /Continue/.test(continueButton.textContent)) {
          continueButton.click();
          return true;
        }
        return false;
      }

      /**
       * Trigger the onClick toggle of yes/no select HTMLElements with the
       * keyboard.
       *
       * @param {number} key - Number representing the number key pressed.
       */
      function toggleSelectWithKey(key) {
        return function toggle() {
          const idx = key - 1;
          ref.select && ref.select[idx] && ref.select[idx].click();
        }
      }

      ー({
        name: 'Select',
        select: 'select',
        pick: [0, 1, 2],
        onClick: shared.toggleSelectYesNo,
        ref: 'select',
      });

      ー({
        name: 'First Button',
        select: 'button',
        pick: [0],
        ref: 'firstButton',
      });

      eventReactions.setGlobal({
        onKeydown_Digit1: toggleSelectWithKey(1),
        onKeydown_Digit2: toggleSelectWithKey(2),
        onKeydown_Digit3: toggleSelectWithKey(3),
        onKeydown_Digit4: toggleSelectWithKey(4),
        onKeydown_Digit5: toggleSelectWithKey(5),
        onKeydown_Enter: clickAcquire,
        onKeydown_NumpadEnter: clickAcquire,
        onKeydown_Space: clickAcquire,
        onKeydown_BracketLeft: shared.resetCounter,
      });

    }
    return {init};
  })();

  const sl = (function slModule() {

    /** string - Describes the current stage */
    let stage;
    let taskId;

    function init() {
      if (taskId === environment.taskId()) {
        return;
      } else {
        taskId = environment.taskId();
      }
      setupReactions();
      toStage('start');
    }

    const clickApproveYesOrNo = (which) => {
      if (ref.approvalButtons.length) {
        const [yes, no] = ref.approvalButtons;
        (which === 'yes') ? yes.click() : no.click();
      }
    }

    const stages = {
      async start() {
        clickApproveYesOrNo('no');
        shared.editComment('removeInitials');
        shared.guiUpdate('Ready to edit');
      },

      async approve() {
        clickApproveYesOrNo('yes');
        completeScreenshots();
        shared.tabs.close();
        shared.editComment('addInitials');
        shared.guiUpdate('Approved');
      },

      async submit() {
        if (ref.submitButton[0].disabled) {
          user.log.warn('Task is not ready');
          toStage('approve');
          return;
        }
        const submitted = await shared.submit();
        if (submitted) {
          shared.guiUpdate('Submitting');
          await util.wait(200);
          shared.guiUpdate('Press Start');
        }
      },
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('approve') && toStage('submit');
    const start = () => stageIs('approve') && toStage('start');

    function setStatus(type) {
      const keys = {
        'canExtract':    [0, 2, 0],
        'insufficient':  [1, 2, 1],
        'pageError':     [1, 2, 2],
        'dynamic':       [1, 2, 4],
        'geo':           [1, 2, 3],
        'nonLocale':     [1, 2, 5],
        'supernatural':  [1, 2, 10],
        'pII':           [1, 2, 12],
        'other':         [1, 2, 0],
        'drugDomain':    [4, 1, 3],
        'alcoholDomain': [4, 1, 4],
        'adultDomain':   [4, 1, 6],
        'gambling':      [4, 1, 5],
      };
      if (!ref.statusDropdown) {
        throw new Error('No status dropdown menus selected.');
      }
      function canExtract(type) {
        if (!ref.canOrCannotExtractButtons) {
          user.log.warn('canOrCannotExtractButtons not found');
          return;
        }
        const n = (type === 'canExtract') ? 0 : 1;
        const button = ref.canOrCannotExtractButtons[n];
        button.click();
        button.focus();
      }
      async function setTo() {
        const [b, c, d] = keys[type];
        const dropdowns = ref.statusDropdown;
        dropdowns[0].value = b;
        dropdowns[c].value = d;
        canExtract(type);
      }
      return setTo;
    }

    function completeScreenshots() {
      const screenshots = ref.screenshots;
      const link = screenshots[0].value || screenshots[1].value;
      if (!link) {
        return;
      }
      for (let screenshot of screenshots) {
        if (!screenshot.value && !screenshot.disabled) {
          screenshot.value = link;
        }
      }
    }

    function focusOnAddDataOrEdit() {
      if (ref.addDataButton && ref.addDataButton[0]) {
        ref.addDataButton[0].focus();
      }
      if (ref.editButton && ref.editButton[0]) {
        ref.editButton[0].focus();
      }
    }
    
    function clickAddItem() {
      for (let button of ref.addItem) {
        button.click();
      }
    }

    /**
     * Set up event handlers.
     */
    function setupReactions() {

      ー({
        name: 'Text',
        select: 'textarea',
        pick: [2, 6, 10, 14, 18],
        onInteract: [
          shared.redAlertExceed25Chars,
          shared.noDuplicateValues,
          shared.forbiddenPhrase,
        ],
        onLoad: [
          shared.redAlertExceed25Chars,
          shared.noDuplicateValues,
          shared.forbiddenPhrase,
        ],
        css: {backgroundColor: 'PapayaWhip'},
      });

      ー({
        name: 'Link',
        select: 'textarea',
        pick: [3, 7, 11, 15, 19],
        onFocusout: [
          shared.requireUrl,
          shared.removeScreenshot,
        ],
        onPaste: [
          shared.requireUrl,
          shared.removePorg,
          shared.removeScreenshot,
        ],
        onKeydown_AltArrowLeft: () => console.log('dd'),
        css: {backgroundColor: 'Cornsilk'},
      });

      ー({
        name: 'Screenshot',
        select: 'textarea',
        pick: [4, 8, 12, 16, 20],
        onFocusout: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        onPaste: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        ref: 'screenshots',
        css: {backgroundColor: 'AliceBlue'},
      });

      ー({
        name: 'Dashes',
        select: 'textarea',
        pick: [5, 9, 13, 17, 21],
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.keepAlive,
          shared.removeTabIndex,
        ],
        ref: 'dashes',
        css: {backgroundColor: 'LightCyan'},
      });

      ー({
        name: 'Landing Page Url',
        select: 'textarea',
        pick: [1],
        onLoad: shared.prefill,
      });  

      ー({
        name: 'LinksAndLP',
        select: 'textarea',
        pick: [1, 3, 7, 11, 15, 19],
        onInteract: shared.noDuplicateValues,
        onPaste: shared.noDuplicateValues,
      });


      ー({
        name: 'AllUrls',
        select: 'textarea',
        pick: [3, 7, 11, 15, 19, 4, 8, 12, 16, 20, 65],
        ref: 'openInTabs',
      });

      ー({
        name: 'Prefill',
        select: 'textarea',
        pick: [2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        ref: 'prefillTarget',
      });

      [[2, 3],[6, 7],[10, 11],[14, 15],[18, 19]].forEach(pair => {
        ー({
          name: 'Fall',
          select: 'textarea',
          pick: pair,
          onPaste: shared.fallThrough,
        });
      });

      ー({
        name: 'StatusDropdown',
        select: 'select',
        pick: [0, 1, 2],
        ref: 'statusDropdown',
      });

      ー({
        name: 'Add Data',
        select: 'label',
        pick: [2],
        onKeydown: clickAddItem,
        ref: 'addDataButton',
      });

      ー({
        name: 'Edit',
        select: 'label',
        pick: [3],
        ref: 'editButton',
      });

      ー({
        name: 'Add Item',
        select: 'label',
        pick: [5, 7, 9],
        ref: 'addItem',
      });

      ー({
        name: 'ApprovalButtons',
        select: 'label',
        pick: [32, 33],
        ref: 'approvalButtons',
      });

      ー({
        name: 'Comment Box',
        select: 'textarea',
        pick: [(util.isDev()) ? 0 : 64],
        onFocusout: start,
        ref: 'finalCommentBox',
      });

      ー({
        name: 'CanOrCannotExtract',
        select: 'label',
        pick: [0, 1],
        ref: 'canOrCannotExtractButtons',
      });

      ー({
        name: 'SubmitButton',
        select: '.submitTaskButton',
        pick: [0],
        css: {opacity: 0.2},
        ref: 'submitButton',
      });

      ー({
        name: 'Skip Button',
        select: '.taskIssueButton',
        pick: [0],
        ref: 'skipButton'
      });

      ー({
        name: 'Save',
        select: 'textarea',
        pick: [1, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        ref: 'saveExtraction',
      });

      ー({
        name: 'TabOrder',
        select: 'textarea',
        pick: [1, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19, 4, 8, 12, 16, 20],
        onLoad: shared.setTabOrder,
      });

      eventReactions.setGlobal({
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onKeydown_Backslash: approve,
        onKeydown_NumpadAdd: approve,
        onKeydown_BracketLeft: shared.resetCounter,
        onKeydown_BracketRight: shared.skipTask,
        onKeydown_NumpadSubtract: shared.skipTask,
        onKeydown_CtrlAltS: shared.saveExtraction,
        onKeydown_NumpadDivide: shared.saveExtraction,
        onKeydown_Backquote: [
          shared.tabs.refresh,
          focusOnAddDataOrEdit,
        ],
        onKeydown_CtrlBackquote: main,
        onKeydown_CtrlAltDigit0: setStatus('canExtract'),
        onKeydown_CtrlAltDigit1: setStatus('insufficient'),
        onKeydown_CtrlAltDigit2: setStatus('pageError'),
        onKeydown_CtrlAltDigit3: setStatus('dynamic'),
        onKeydown_CtrlAltDigit4: setStatus('nonLocale'),
        onKeydown_CtrlAltDigit5: setStatus('other'),
        onKeydown_CtrlAltDigit6: setStatus('pII'),
        onKeydown_CtrlAltDigit7: setStatus('drugDomain'),
        onKeydown_CtrlAltDigit8: setStatus('alcoholDomain'),
        onKeydown_CtrlAltDigit9: setStatus('adultDomain'),
      });
    }

    return {init};
  })();

  const ss = (function ssModule() {

    /** string - Describes the current stage */
    let stage;

    function init() {
      setupReactions();
      toStage('start');
    }

    const stages = {
      'start': () => {
        shared.editComment('removeInitials');
        shared.guiUpdate('Ready to edit');

      },
      'approve': () => {
        shared.tabs.close();
        shared.editComment('addInitials');
        shared.guiUpdate('Approved');

      },
      'submit': async () => {
        if (ref.submitButton[0].disabled) {
          user.log.warn('Task is not ready');
          toStage('approve');
          return;
        }
        const submitted = await shared.submit();
        if (!submitted) {
          toStage('start');
          return false;
        }
      },
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('approve') && toStage('submit');
    const start = () => stageIs('approve') && toStage('start');

    /**
     * Set up event handlers.
     */
    function setupReactions() {

      ー({
        name: 'Text',
        select: 'textarea',
        pick: [3, 6, 9, 12, 15],
        onInteract: [
          shared.noDuplicateValues,
          shared.forbiddenPhrase,
        ],
        onLoad: [
          shared.noDuplicateValues,
          shared.forbiddenPhrase,
        ],
        css: {backgroundColor: 'PapayaWhip'},
      });

      ー({
        name: 'Screenshot',
        select: 'textarea',
        pick: [4, 7, 10, 13, 16],
        onFocusout: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        onPaste: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        css: {backgroundColor: 'AliceBlue'},
      });

      ー({
        name: 'Dashes',
        select: 'textarea',
        pick: [5, 8, 11, 14, 17],
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.keepAlive,
        ],
        css: {backgroundColor: 'LightCyan'},
      });

      ー({
        name: 'AllUrls',
        select: 'textarea',
        pick: [4, 7, 10, 13, 16],
        ref: 'openInTabs',
      });

      ー({ // @todo Confirm position
        name: 'Comment Box',
        select: 'textarea',
        pick: [(util.isDev()) ? 0 : 52],
        onFocusout: () => start,
        ref: 'finalCommentBox',
      });

      ー({
        name: 'SubmitButton',
        select: '.submitTaskButton',
        pick: [0],
        css: {opacity: 0.2},
        ref: 'submitButton',
      });

      ー({
        name: 'Skip Button',
        select: '.taskIssueButton',
        pick: [0],
        ref: 'skipButton',
      });

      eventReactions.setGlobal({
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onKeydown_Backslash: approve,
        onKeydown_BracketLeft: shared.resetCounter,
        onKeydown_BracketRight: shared.skipTask,
        onKeydown_CtrlAltS: shared.saveExtraction,
        onKeydown_Backquote: shared.tabs.refresh,
        onKeydown_CtrlBackquote: main,
      });
    }

    return {init};
  })();

  return {
    home,
    sl,
    ss,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// APP module

function main() {
  const detectedFlowName = environment.flowName();
  if (!detectedFlowName) {
    const warning = 'No workflow identified';
    shared.guiUpdate(warning)
    return user.log.warn(warning);
  }

  eventReactions.reset();
  eventReactions.setGlobal({
    onKeydown_Backquote: main,
  });
  util.dispatch('issueUpdate', {issueType: 'reset'});
  const flow = flows[detectedFlowName];
  flow.init();
};

util.wait(100).then(() => user.log.ok('TwoTwentyOne loaded'));
main();


/**
 * @todo Build dev tool that marks elements on the page
 * @todo Improve fresh implementation
 * @todo Remove mode system
 * @todo Mutation listener
 */
