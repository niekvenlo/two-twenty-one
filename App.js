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
   *
   * @example
   * changeValue({
   *   to: 'newValue',
   *   when: () => ({hit: true, proxy: {value: 'originalValue'}}),
   * })
   * This would change the value of the object returned by the 'when' function.
   */
  function changeValue({to, when}) {
    if (typeof to !== 'string') {
      throw new Error('ChangeValue requires a new string value');
    }
    if (typeof when !== 'function') {
      throw new Error('ChangeValue requires a function');
    }
    return function (...params) {
      const {hit, proxy} = when(...params);
      if (hit) {
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
   * flagIssue({
   *   issueType: 'Description of issue',
   *   when: () => ({hit: true, proxy: {value: 'originalValue'}, message: ''}),
   * })
   * This would dispatch an event that means that this proxy has an issue.
   */
  function flagIssue({issueLevel, issueType, when}) {
    if (!ALERT_LEVELS.includes(issueLevel)) {
      throw new Error(
        issueLevel + ' is not a known issueLevel. Please use:' +
        util.mapToBulletedList(ALERT_LEVELS),
      );
    }
    if (typeof when !== 'function') {
      throw new Error('ChangeValue requires a function');
    }
    if (typeof issueType !== 'string') {
      throw new Error('ChangeValue requires a new string value');
    }
    function flagThis(...params) {
      const {proxy, hit, message} = when(...params);
      const packet = {proxy, issueType};
      if (hit) {
        packet.issueLevel = issueLevel;
        packet.message = message;
      }
      util.dispatch({type: 'issueUpdate', payload: {detail: packet}});
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
  function testRegex(regex, shouldMatch) {
    return (proxy) => {
      const hit = regex.test(proxy.value) === shouldMatch;
      const didOrShouldNot = shouldMatch ? 'did' : 'should not';
      const message = `${proxy.value} ${didOrShouldNot} match ${regex}`;
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
   * 1) The flagIssue function:
   * flagIssue{
   *   issueType: 'Description of the issue',
   *   when: exampleTester // Your tester function.
   * }
   * 2) The changeValue function:
   * changeValue{
   *   to: 'newValue',
   *   when: exampleTester // Your tester function.
   * }
   * flagIssue and changeValue will be triggered when your function returns
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

  /**
   * Tests whether any proxies in a group have the same value, and flags
   * proxies that repeat previous values.
   *
   * @param {Object} _ - Unused parameter. The triggering proxy.
   * @param {number} __ - Unused parameter. The index of the triggering proxy.
   * @param {Object[]} group - Array of proxies to check for duplicate values.
   */
  function alertOnDuplicateValues(_, __, group, testing) {
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
        util.dispatch({type: 'issueUpdate', payload: {detail: packet}});
      }
    }
    return packets;
  };
  test.group('alertOnDuplicateValues', () => {
    const run = (group) => {
      return alertOnDuplicateValues(0, 0, group, true)
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
  alertOnDuplicateValues = util.delay(alertOnDuplicateValues, 100);

  function guessValueFromPastedValue(pastedValue) {
    const value = (/^http/.test(pastedValue))
        ? pastedValue.replace(/\/index/i, '').match(/[^\/]*[\/]?$/)[0]
        : pastedValue;
    return decodeURIComponent(value).toLowerCase().trim();
  }

  /**
   * @param {Object} _ - Unused parameter. The triggering proxy.
   * @param {number} idx - Index of the proxy in the group.
   * @param {Object[]} group - Array of two proxies.
   */
  function fallThrough (_, idx, group) {
    if (group.length !== 2) {
      throw new Error('fallThrough requires two proxies.')
    }
    if (idx > 0) {
      return;
    }
    if (/^https?:/.test(group[0].value)) {
      group[1].value = group[0].value;
    }
    group[0].value = guessValueFromPastedValue(group[0].value);
    log.notice(
      `Fallthrough: '${group[1].value}' became '${group[0].value}'`,
      true,
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
        throw new Error('Element does not have a matching value.');
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

  function editComment(commentBox, mode) {
    if (!commentBox || !commentBox.click) {
      throw new Error('EditComment requires a valid textarea proxy');
    }
    if (mode === 'addInitials') {
      commentBox.focus();
      const initials = config.get('initials') || '';
      commentBox.value = initials + '\n' + commentBox.value;
    } else if (mode === 'removeInitials') {
       const initials = config.get('initials') || '';
       commentBox.value =
           commentBox.value.replace(RegExp('^' + initials + '\n'), '');
    }
  }

  async function keepAlive(_, idx, group) {
    if (idx > 0) {
      return;
    }
    const MINUTES = 6;
    const INTERVAL = 10000; // ms
    const times = (MINUTES * 60000) / INTERVAL;
    for (let i = 0; i < times; i++) {
      await util.wait(INTERVAL);
      const idx = Math.floor(Math.random() * group.length);
      group[idx].touch();
    }
  }

  function resetCounter() {
    const question =
        'Please confirm.\nAre you sure you want to reset all counters?';
    log.notice(question, true)
    if (confirm(question)) {
      counter.reset();      
    } else {
      log.lowLevel('Canceled', true);
    }
  }

  /**
   * Skip the current task.
   * Currently takes no parameters but could be rewritten to override the
   * locations of the buttons in the DOM.
   */
  async function skipTask() {
    const RETRIES = 15;
    const DELAY = 25; // ms

    const skipButtonSelector = {
      name: 'Skip Button',
      select: '.taskIssueButton',
      pick: [0],
      mode: 'static',
    };
    const confirmButtonSelector = {
      name: 'Confirm Skip',
      select: '.gwt-SubmitButton',
      pick: [0],
      mode: 'static',
    };

    const skipButton = ー(skipButtonSelector)[0];
    if (!skipButton) {
      log.warn('Skip button not found.', true);
      return;
    }
    skipButton.click();

    let retries = RETRIES;
    while(retries-- > 0) {
      const confirmButton = ー(confirmButtonSelector)[0];
      if (confirmButton) {
        confirmButton.click();
        log.notice('Skipping task', true);
        counter.add('Skipping');
        return;
      }
      await util.wait(DELAY);
    }
    log.warn('Skip confirmation dialog did not appear.', true);
  }

  function saveExtraction(data) {
    log.saveExtraction(data, true);
  }

  function autoSaveExtraction(data) {
    log.saveExtraction(data, true);
  }

  async function submit() {
    const button = ref.submitButton[0];
    if (!button || !button.click) {
      throw new Error('Submit requires a valid submit button proxy');
    }
    log.notice('Submitting', true);
    await util.wait(100);
    button.click();
    counter.add('Submit');
  }
  submit = util.debounce(submit, 100);

  return {
    editComment,
    resetCounter,
    skipTask,
    saveExtraction,
    submit,
    keepAlive,

    fallThrough,
    redAlertOnDupe: alertOnDuplicateValues,

    addDashes: changeValue({
      to: '---',
      when: testRegex(/^$/, true),
    }),
    redAlertExceed25Chars: flagIssue({
      issueLevel: 'red',
      issueType: 'More than 25 characters long',
      when: testLength({max: 25}),
    }),

    removeDashes: changeValue({
      to: '',
      when: testRegex(/---/, true),
    }),
    requireUrl: changeValue({
      to: '',
      when: testRegex(/^http/, false),
    }),
    requireScreenshot: changeValue({
      to: '',
      when: testRegex(/gleplex/, false),
    }),
    removeScreenshot: changeValue({
      to: '',
      when: testRegex(/gleplex/, true),
    }),
    toggleSelectYesNo: cycleSelect(['YES', 'NO']),
  }
}
)();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// WORKFLOW module

var {detectWorkflow, flows} = (function workflowModule() {
  function detectWorkflow() {
    const header = ー({
      name: 'Header',
      select: 'h1',
      pick: [0],
      mode: 'static',
    })[0];
    const headerText = header && header.textContent;

    switch (true) {
      case /Sitelinks Dutch/.test(headerText):
        return 'slDutch';
      case headerText === 'TwoTwentyOne':
        return 'playground';
      default:
        return 'ratingHome';
    }
  }

  const ratingHome = (function ratingHomeModule() {

    function init(main) {

      const CONTINUE_RETRIES = 20;
      const CONTINUE_DELAY = 25; // ms

      function clickAcquire() {
        const button = ref.firstButton[0];
        button.click();
        clickContinue();
      }

      async function clickContinue() {
        let retries = CONTINUE_RETRIES;
        while(retries-- > 0) {
          const continueButton = ref.fresh('firstButton')[0];
          if (continueButton && /Continue/.test(continueButton.textContent)) {
            continueButton.click();
            await util.wait(500); // @todo
            main();
            return;
          }
          await util.wait(CONTINUE_DELAY);
        }
      }

      function toggleSelectWithKey(key) {
        if (key > ref.select.length) {
          throw new Error('Key too large');
        }
        return function toggle() {
          const idx = key - 1;
          ref.select[idx].click();
        }
      }

      ー({
        name: 'Select',
        select: 'select',
        pick: [0, 1, 2],
        mode: 'programmable',
        onClick: shared.toggleSelectYesNo,
        ref: 'select',
      });

      ー({
        name: 'First Button',
        select: 'button',
        pick: [0],
        mode: 'static',
        ref: 'firstButton',
      });

      setGlobalReactions({
        onKeydown_Digit1: toggleSelectWithKey(1),
        onKeydown_Digit2: toggleSelectWithKey(2),
        onKeydown_Digit3: toggleSelectWithKey(3),
        onKeydown_Space: clickAcquire,
      });

    }
    return {init};
  })();

  const slDutch = (function slDutchModule() {

    function markApproved() {
      shared.editComment(ref.finalCommentBox[0], 'addInitials');
      setStage(1);
    }

    function continueEditing() {
      setStage(0);
      shared.editComment(ref.finalCommentBox[0], 'removeInitials');
    }

    function prefill(proxy) {
      if (/../.test(proxy.value)) {
        ref.prefillTarget.forEach(element => element.value = 'Boo');
      }
    }

    function saveExtraction() {
      const values = ref.saveExtraction.map(element => element.value);
      const domain = util.getDomain(values[0]);
      if (!domain) {
        return log.warn('Not enough data to save.');
      }
      const data = {[domain]: values.slice(1)};
      shared.saveExtraction(data);
    }

    function autoSaveExtraction() {
      const values = ref.saveExtraction.map(element => element.value);
      const domain = util.getDomain(values[0]);
      if (!domain) {
        return;
      }
      const data = {[domain]: values.slice(1)};
      shared.autoSaveExtraction(data);
    }

    function submit() {
      stage = -1;
      autoSaveExtraction();
      shared.submit();
    }

    function editStage () {
      log.notice('Edit stage');

      ー({
        name: 'Landing Page Url',
        select: 'textarea',
        pick: [1],
        mode: 'programmable',
        onLoad: prefill,
      });

      ー({
        name: 'Prefill',
        select: 'textarea',
        pick: [2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        mode: 'programmable',
        ref: 'prefillTarget',
      });

      ー({
        name: 'Text',
        select: 'textarea',
        pick: [2, 6, 10, 14, 18],
        mode: 'programmable',
        onInteract: [
          shared.redAlertExceed25Chars,
          shared.redAlertOnDupe,
        ],
        onLoad: [
          shared.redAlertExceed25Chars,
          shared.redAlertOnDupe,
        ],
      });

      ー({
        name: 'Link',
        select: 'textarea',
        pick: [3, 7, 11, 15, 19],
        mode: 'programmable',
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
        name: 'Urls',
        select: 'textarea',
        pick: [1, 3, 7, 11, 15, 19],
        mode: 'programmable',
        onFocusout: shared.redAlertOnDupe,
        onPaste: shared.redAlertOnDupe,
      });


      ー({
        name: 'Screenshot',
        select: 'textarea',
        pick: [4, 8, 12, 16, 20],
        mode: 'programmable',
        onFocusout: shared.requireScreenshot,
        onPaste: shared.requireScreenshot,
      });

      ー({
        name: 'Dashes',
        select: 'textarea',
        pick: [5, 9, 13, 17, 21],
        mode: 'programmable',
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.keepAlive,
        ],
      });

      [[2, 3],[6, 7],[10, 11],[14, 15],[18, 19]].forEach(pair => {
        ー({
          name: 'Fall',
          select: 'textarea',
          pick: pair,
          mode: 'programmable',
          onPaste: shared.fallThrough,
        });
      });

      ー({
        name: 'Comment Box',
        select: 'textarea',
        pick: [1],
        mode: 'programmable',
        ref: 'finalCommentBox',
      });

      ー({
        name: 'SubmitButton',
        select: 'button',
        pick: [4],
        mode: 'user-editable',
        ref: 'submitButton',
      })[0].cssText = 'display: none';

      ー({
        name: 'Select',
        select: 'select',
        pick: [0, 1, 2],
        mode: 'programmable',
        onClick: shared.toggleSelectYesNo,
      });

      setGlobalReactions({
        onKeydown_CtrlEnter: markApproved,
        onKeydown_CtrlNumpadEnter: markApproved,
        onKeydown_BracketLeft: shared.resetCounter,
        onKeydown_CtrlAltS: () => log.warn('Please approve before saving'),
      });
    }

    function readyToSubmitStage() {
      log.notice('Ready to submit');

      ー({
        name: 'Save',
        select: 'textarea',
        pick: [0, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        mode: 'programmable',
        ref: 'saveExtraction',
      });

      ー({
        name: 'SubmitButton',
        select: 'button',
        pick: [4],
        mode: 'static',
        ref: 'submitButton',
      });

      setGlobalReactions({
        onKeydown_CtrlAltS: saveExtraction,
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onClick: continueEditing,
        onPaste: continueEditing,
      });
    }

    let reinitialise = () => {
      throw new Error('No access to the main function');
    };

    const stages = [
      editStage,
      readyToSubmitStage,
    ];

    function setStage(n) {
      stage = n;
      reinitialise();
    }

    function init(main) {
      reinitialise = main;
      stages[stage]();
    }
    return {init};
  })();

  const playground = (function playgroundModule() {

    function markApproved() {
      shared.editComment(ref.finalCommentBox[0], 'addInitials');
      setStage(1);
    }

    function continueEditing() {
      setStage(0);
      shared.editComment(ref.finalCommentBox[0], 'removeInitials');
    }

    function prefill(proxy) {
      if (/../.test(proxy.value)) {
        ref.prefillTarget.forEach(element => element.value = 'Boo');
      }
    }

    function saveExtraction() {
      const values = ref.saveExtraction.map(element => element.value);
      const domain = util.getDomain(values[0]);
      if (!domain) {
        return log.warn('Not enough data to save.');
      }
      const data = {[domain]: values.slice(1)};
      shared.saveExtraction(data);
    }

    function autoSaveExtraction() {
      const values = ref.saveExtraction.map(element => element.value);
      const domain = util.getDomain(values[0]);
      if (!domain) {
        return;
      }
      const data = {[domain]: values.slice(1)};
      shared.autoSaveExtraction(data);
    }

    function submit() {
      stage = -1;
      autoSaveExtraction();
      shared.submit();
    }

    function editStage () {
      log.notice('Edit stage');

      ー({
        name: 'Landing Page Url',
        select: 'textarea',
        pick: [1],
        mode: 'programmable',
        onLoad: prefill,
      });

      ー({
        name: 'Prefill',
        select: 'textarea',
        pick: [2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        mode: 'programmable',
        ref: 'prefillTarget',
      });

      ー({
        name: 'Text',
        select: 'textarea',
        pick: [2, 6, 10, 14, 18],
        mode: 'programmable',
        onInteract: [
          shared.redAlertExceed25Chars,
          shared.redAlertOnDupe,
        ],
        onLoad: [
          shared.redAlertExceed25Chars,
          shared.redAlertOnDupe,
        ],
      });

      ー({
        name: 'Link',
        select: 'textarea',
        pick: [3, 7, 11, 15, 19],
        mode: 'programmable',
        onFocusout: [
          shared.redAlertOnDupe,
          shared.requireUrl,
          shared.removeScreenshot,
        ],
        onPaste: [
          shared.redAlertOnDupe,
          shared.requireUrl,
          shared.removeScreenshot,
        ],
      });

      ー({
        name: 'Screenshot',
        select: 'textarea',
        pick: [4, 8, 12, 16, 20],
        mode: 'programmable',
        onFocusout: shared.requireScreenshot,
        onPaste: shared.requireScreenshot,
      });

      ー({
        name: 'Dashes',
        select: 'textarea',
        pick: [5, 9, 13, 17, 21],
        mode: 'programmable',
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.keepAlive,
        ],
      });

      [[2, 3],[6, 7],[10, 11], [14, 15]].forEach(pair => {
        ー({
          name: 'Fall',
          select: 'textarea',
          pick: pair,
          mode: 'programmable',
          onPaste: shared.fallThrough,
        });
      });

      ー({
        name: 'Comment Box',
        select: 'textarea',
        pick: [1],
        mode: 'programmable',
        ref: 'finalCommentBox',
      });

      ー({
        name: 'SubmitButton',
        select: 'button',
        pick: [4],
        mode: 'user-editable',
        ref: 'submitButton',
      })[0].cssText = 'display: none';

      ー({
        name: 'Select',
        select: 'select',
        pick: [0, 1, 2],
        mode: 'programmable',
        onClick: shared.toggleSelectYesNo,
      });

      setGlobalReactions({
        onKeydown_CtrlEnter: markApproved,
        onKeydown_CtrlNumpadEnter: markApproved,
        onKeydown_BracketLeft: shared.resetCounter,
        onKeydown_CtrlAltS: () => log.warn('Please approve before saving'),
      });
    }

    function readyToSubmitStage() {
      log.notice('Ready to submit');

      ー({
        name: 'Save',
        select: 'textarea',
        pick: [0, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        mode: 'programmable',
        ref: 'saveExtraction',
      });

      ー({
        name: 'SubmitButton',
        select: 'button',
        pick: [4],
        mode: 'static',
        ref: 'submitButton',
      });

      setGlobalReactions({
        onKeydown_CtrlAltS: saveExtraction,
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onClick: continueEditing,
        onPaste: continueEditing,
      });
    }

    let reinitialise = () => {
      throw new Error('No access to the main function');
    };

    const stages = [
      editStage,
      readyToSubmitStage,
    ];

    function setStage(n) {
      stage = n;
      reinitialise();
    }

    function init(main) {
      reinitialise = main;
      stages[stage]();
    }
    return {init};
  })();

  return {
    detectWorkflow,
    flows: {
      ratingHome,
      slDutch,
      playground,
    },
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// APP module

var stage = -1;

(function appModule() {
  function main() {
    const detectedFlowName = detectWorkflow();
    if (!detectedFlowName) {
      return log.warn('No workflow identified');
    }
    if (stage < 0) {
      log.notice(`${detectedFlowName} initialised`);
      stage = 0;
    }
    resetReactions();
    const flowInitializer = flows[detectedFlowName];
    flowInitializer.init(main);
  };

  main();
})();

/**
 * @todo Build out data store
 *
 * @todo Redesign wrap mode to create different level proxies each time
 * with context determined when wrapping.
 *
 * @todo Use taskId somehow
 */
