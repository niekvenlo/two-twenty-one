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
      case headerText === 'TwoTwentyOne':
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

  function orangeAlertOnForbiddenPhrase(proxy) {
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
        packet.message =
            (message) ? message : `'${clearValue}' matches '${clearPhrase}'`;
        break;
      }
    }
    util.dispatch('issueUpdate', packet);
  }
  orangeAlertOnForbiddenPhrase = util.debounce(orangeAlertOnForbiddenPhrase, 50);

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
   * Returns a promise that repeatedly checks whether the taskId changes.
   * Promise resolves successfully if the taskId changes, or throws an error
   * if it doesn't change.
   *
   * @return {Promise}
   */
  async function awaitNewPage() {
    await util.wait(500);
  }

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

  /** Window[] - Stores open tabs */
  const tabs = [];

  /**
   * Opens/closes tabs based on urls on the page. Always closes all currently
   * open tabs before continuing. Optionally opens new tabs, based on unique
   * link values in ref.openInTabs. Order of tabs is determined by
   * ref.openInTabs.
   *
   * @param {Object} o
   * @param {boolean} o.closeOnly - Should the tabs only be closed?
   * @ref {ref.openInTabs}
   */
  async function handleTabs({closeOnly = false} = {}) {
    const currentTabs = tabs.slice();
    tabs.length = 0;
    await util.wait(100);
    currentTabs.forEach(tab => tab.close());
    if (closeOnly) {
      return;
    }
    const urls = ref.openInTabs
        .map(el => el.value)
        .filter(val => /^http/.test(val));
    const uniqueLinks = [...new Set(urls)];
    for (let link of uniqueLinks) {
      tabs.push(window.open(link, link));
    };
    if (tabs.length !== uniqueLinks.length) {
      user.log.warn(
        `Could not open all tabs. Check the Chrome popup blocker.`,
      );
    }
  }

  function commonReplacements(value) {
    const replacementStore = user.storeAccess({
      feature: 'CommonReplacements',
      locale: 'Dutch',
    });
    let tmpValue = (/^http/.test(value))
        ? decodeURIComponent(
            value
                .replace(/\/index/i, '')
                .match(/[^\/]*[\/]?$/)[0]
                .replace(/(\.\w+)$/i, ''),
          )
        : value;
    tmpValue = tmpValue.trim().toLowerCase()
    for (let rule of replacementStore) {
      const [regex, replaceWith] = rule;
      tmpValue = tmpValue.replace(util.toRegex(regex), replaceWith);
    }

    tmpValue = tmpValue.replace(/[\s++-/]+/g, ' ')
          .replace(/[#?­*]/g, '')
          .replace(/’/, `'`)
          .trim();
    return util.capitalize('first letter', tmpValue);
  }

  function brandCapitalisation(value) {
    const brands = user.storeAccess({
      feature: 'BrandCapitalisation',
    });
    let tmpValue = value;
    for (let brand of brands) {
      tmpValue = tmpValue.replace(new RegExp(brand, 'gi'), brand);
    }
    return tmpValue;
  }

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
  function redAlertOnDuplicateValues(_, __, group, testing) {
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
  test.group('redAlertOnDuplicateValues', () => {
    const run = (group) => {
      return redAlertOnDuplicateValues(0, 0, group, true)
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
  redAlertOnDuplicateValues = util.delay(redAlertOnDuplicateValues, 100);

  /**
   * Pops up a confirmation dialog. On confirmation, will reset all counters.
   */
  async function resetCounter() {
    const question =
        'Please confirm.\nAre you sure you want to reset all counters?' +
        util.mapToBulletedList(user.counter.get());
    user.log.notice(question, {toast: true});
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
    shared.handleTabs({closeOnly: true});
    await awaitNewPage();
    main();
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
    user.counter.add('Submitted');
    return true;
  }
  submit = util.debounce(submit, 100);

  return {
    awaitNewPage,
    editComment,
    handleTabs,
    fallThrough,
    guiUpdate,
    keepAlive,
    orangeAlertOnForbiddenPhrase,
    prefill,
    redAlertOnDuplicateValues,
    resetCounter,
    saveExtraction,
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
          user.log.warn('Continue button did not appear.', {print: true});
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

    function init() {
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
        shared.handleTabs({closeOnly: true});
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
        if (!submitted) {
          toStage('start');
          return false;
        }
        shared.awaitNewPage().then(main);
      },
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('approve') && toStage('submit');
    const start = () => stageIs('approve', 'submit') && toStage('start');

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
          shared.redAlertOnDuplicateValues,
          shared.orangeAlertOnForbiddenPhrase,
        ],
        onLoad: [
          shared.redAlertExceed25Chars,
          shared.redAlertOnDuplicateValues,
        ],
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
          shared.removeScreenshot,
        ],
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
        ],
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
        onInteract: shared.redAlertOnDuplicateValues,
        onPaste: shared.redAlertOnDuplicateValues,
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
        name: 'Comment Box',
        select: 'textarea',
        pick: [(util.isDev()) ? 0 : 64],
        onFocusout: start,
        ref: 'finalCommentBox',
      });

      ー({
        name: 'ApprovalButtons',
        select: 'label',
        pick: [32, 33],
        ref: 'approvalButtons',
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

      eventReactions.setGlobal({
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onKeydown_Backslash: approve,
        onKeydown_BracketLeft: shared.resetCounter,
        onKeydown_BracketRight: shared.skipTask,
        onKeydown_CtrlAltS: shared.saveExtraction,
        onKeydown_Backquote: shared.handleTabs,
        onKeydown_CtrlBackquote: main,
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
        shared.handleTabs({closeOnly: true});
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
        shared.awaitNewPage().then(main);
      },
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('approve') && toStage('submit');
    const start = () => stageIs('approve', 'submit') && toStage('start');

    /**
     * Set up event handlers.
     */
    function setupReactions() {

      ー({
        name: 'Text',
        select: 'textarea',
        pick: [3, 6, 9, 12, 15],
        onInteract: [
          shared.redAlertOnDuplicateValues,
          shared.orangeAlertOnForbiddenPhrase,
        ],
        onLoad: [
          shared.redAlertOnDuplicateValues,
          shared.orangeAlertOnForbiddenPhrase,
        ],
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
        ],
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
        onFocusout: backToStart,
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
        ref: 'skipButton'
      });

      eventReactions.setGlobal({
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onKeydown_Backslash: approve,
        onKeydown_BracketLeft: shared.resetCounter,
        onKeydown_BracketRight: shared.skipTask,
        onKeydown_CtrlAltS: shared.saveExtraction,
        onKeydown_Backquote: shared.handleTabs,
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
  const flow = flows[detectedFlowName];
  util.dispatch('issueUpdate', {issueType: 'reset'});
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
