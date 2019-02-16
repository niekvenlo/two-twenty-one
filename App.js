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
    const firstButton = ー({
      name: 'First Button',
      select: 'button',
      pick: [0],
    })[0];
    const header = ー({
      name: 'Header',
      select: 'h1',
      pick: [0],
    })[0];
    const buttonText = firstButton && firstButton.textContent;
    const headerText = header && header.textContent;
    if (/Acquire/.test(buttonText)) {
      return 'home';
    }
    if (/Continue/.test(buttonText)) {
      return 'home';
    }
    if (/telinks/.test(headerText)) {
      return 'sl'
    }
    if (/ppets/.test(headerText)) {
      return 'ss'
    }
    if (/twentyone/.test(headerText)) {
      return 'sl';
    }
    if (/#activeevals\/subpage=labels/.test(document.location.href)) {
      return 'labels';
    }
    return '';
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
      };
    }
    const currentTask =
        Object.entries(JSON.parse(localStorage.acquiredTask))[0] ||
            [undefined, undefined];
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
          {print: false, toast: true}
        );
        proxy.value = to;
      }
    }
  }
  // test.group('changeValue', () => {
  //   const proxy = {value: 'z'};
  //   const tester = (proxy) => ({hit: true, proxy});
  //   changeValue({to: 'x', when: tester})(proxy);
  //   test.ok(proxy.value === 'x', 'Changed value');
  // });

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
   * @ref {editButton}
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
        util.mapToBulletedList(ALERT_LEVELS)
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
        util.attention({on: ref.editButton, n: 0, click: true});
      }
      util.dispatch('issueUpdate', packet);
    }
    return util.delay(flagThis, 40);
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
  }
  // test.group('textRegex', () => {
  //   const proxy = {value: 'x'};
  //   const one = testRegex(/x/, true)(proxy);
  //   test.ok(one.hit === true, 'one: hit');
  //   test.ok(one.message === `'x' did match /x/`, 'one: message');
  //   const two = testRegex(/x/, false)(proxy);
  //   test.ok(two.hit === false, 'two: no hit');
  //   test.ok(two.message === `'x' should not match /x/`, 'two: message');
  //   const three = testRegex(/c/, false)(proxy);
  //   test.ok(three.hit === true, 'three: hit');
  //   test.ok(three.message === `'x' should not match /c/`, 'three: message');
  // });

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
  }
  // test.group('textLength', () => {
  //   const one = testLength({min: 2})({value: 'x'});
  //   test.ok(one.hit === true, 'one: hit');
  //   test.ok(one.message === 'Value is too short', 'one: message');
  //   const two = testLength({max: 3})({value: 'x'});
  //   test.ok(two.hit === false, 'two: no hit');
  //   test.ok(two.message === undefined, 'two: message');
  //   const three = testLength({min: 2, max: 5})({value: 'x x x'});
  //   test.ok(three.hit === false, 'one: no hit');
  //   test.ok(three.message === undefined, 'two: message');
  // }, true);

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
                .replace(/(\.\w+)$/i, '')
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

  function noForbiddenPhrase(proxy) {
    const phrases = user.storeAccess({
      feature: 'ForbiddenPhrases',
      locale: environment.locale(),
    }) || [];
    if (!phrases.length) {
      user.log.warn('No forbidden phrases loaded.');
    }
    const packet = {proxy, issueType: 'Forbidden phrase'};
    for (let rule of phrases) {
      const [phrase, message] = rule;
      const regex = util.toRegex(phrase);
      if (regex && regex.test(proxy.value)) {
        const clearValue = proxy.value.replace(/\s/g, '░');
        const clearPhrase = phrase.replace(/\s/g, '░');
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
  atest.group('cycleSelect', {
    'Changed to Yes': () => {
      const toggleSelectYesNo = cycleSelect(['YES', 'NO']);
      const proxy = {value: 'NO', blur: () => {}};
      toggleSelectYesNo(proxy);
      return proxy.value === 'YES';
    },
    'Changed back to No': () => {
      const toggleSelectYesNo = cycleSelect(['YES', 'NO']);
      const proxy = {value: 'NO', blur: () => {}};
      toggleSelectYesNo(proxy);
      toggleSelectYesNo(proxy);
      return proxy.value === 'NO';
    },
  });



////////////////////////////////////////////////////////////////////////////////
  // Exported functions

  /**
   * Simplifies common changes to the comment box.
   *
   * #addInitials Adds initials and moves focus.
   * #removeInitials Removes initials.
   * @ref {finalCommentBox}
   */
  const comment = (function commentMiniModule() {
    function getCommentBox() {
      const commentBox = ref.finalCommentBox && ref.finalCommentBox[0];
      if (!commentBox || !commentBox.focus) {
        throw new Error('Comment box not found');
      }
      return commentBox;
    }
    function addInitials() {
      const commentBox = getCommentBox();
      commentBox.focus();
      commentBox.scrollIntoView();
      const initials = user.config.get('initials') || '';
      if (new RegExp('^' + initials).test(commentBox.value)) {
        return;
      }
      commentBox.value = initials + '\n' + commentBox.value;
    }
    function removeInitials() {
      const commentBox = getCommentBox();
       const initials = user.config.get('initials') || '';
       commentBox.value =
           commentBox.value.replace(new RegExp('^' + initials + '\n'), '');
    }
    return {
      addInitials,
      removeInitials,
    };
  })();
  atest.group('comment', {
    'Add and remove initials': () => {
      const tmp = ref.finalCommentBox;
      const userComment = 'user comment';
      const fakeBox = {
        value: userComment,
        focus: () => {},
        scrollIntoView: () => {},
      };
      const initials = user.config.get('initials');
      ref.finalCommentBox = [fakeBox];
      comment.addInitials();
      const initialsFound = new RegExp('^' + initials).test(fakeBox.value);
      comment.removeInitials();
      const initialsNotFound = !new RegExp('^' + initials).test(fakeBox.value);
      const commentFound = new RegExp(userComment).test(fakeBox.value);
      return initialsFound && initialsNotFound && commentFound;
    },
  }, true);

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
      throw new RangeError('fallThrough requires two proxies.');
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
        {print: false, toast: false}
      );
      return;
    }
    user.log.notice(
      `'${value}' from '${pastedValue}'`
    );
  }
  // test.group('fallThrough', () => {
  //   const a = {value: 'a'};
  //   const b = {value: 'b'};
  //   fallThrough(1, 0, [a, b]);
  //   test.ok(a.value === 'Moved', 'a.value = Moved');
  //   test.ok(b.value === 'a', 'b.value = a');
  // }, true);
  fallThrough = util.delay(fallThrough, 0);

  /**
   * Dispatch a guiUpdate.
   *
   * @param {string} message
   */
  function guiUpdate(message) {
    util.dispatch('guiUpdate', {toast: message, stage: message});
  }

  /**
   * Exposes methods that return booleans, reflecting something about
   * the state of the task.
   */
  const is = (function isModule() {
    function analystTask() {
      const taskTitle = ref.taskTitle && ref.taskTitle[0];
      if (!taskTitle) {
        return false;
      }
      if (/Analyst/.test(taskTitle.textContent)) {
        return true;
      }
      return false;
    }
    /**
     * Was this task analysed by a reviewer?
     *
     * @return {boolean} For a review task, are the initials of a known
     * reviewer the first characters in the analyst comment box?
     */
    function isTaskAnalysedByReviewer() {
      const proxy = ref.analystComment && ref.analystComment[0];
      if (!proxy || !proxy.textContent) {
        return false;
      }
      const comment = proxy.textContent.trim();
      const fishFor = user.config.get('fish');
      if (!fishFor) {
        return false;
      }
      for (let initials of fishFor.split(/, ?/)) {
        if (new RegExp('^' + initials, 'i').test(comment)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Was this task analysed by you?
     *
     * @return {boolean} For a review task, are the initials of the
     * current user the first characters in the analyst comment box?
     */
    function isOwnTask() {
      const proxy = ref.analystComment && ref.analystComment[0];
      if (!proxy || !proxy.textContent) {
        return false;
      }
      const comment = proxy.textContent.trim();
      const initials = user.config.get('initials');
      if (new RegExp('^' + initials, 'i').test(comment)) {
        return true;
      }
      return false;
    }
    return {
      analystTask,
      byReviewer: isTaskAnalysedByReviewer,
      ownTask: isOwnTask,
    }
  })();

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
    const MINUTES = 30;
    const INTERVAL = 30000; // ms
    const times = (MINUTES * 60000) / INTERVAL;
    for (let i = 0; i < times; i++) {
      await util.wait(INTERVAL);
      const idx = Math.floor(Math.random() * group.length);
      group[idx].touch();
    }
  }
  keepAlive = util.debounce(keepAlive);

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
  }
  // test.group('noDuplicateValues', () => {
  //   const run = (group) => {
  //     return noDuplicateValues(0, 0, group, true)
  //         .filter(issue => issue.message);
  //   }
  //   const a = {};
  //   const b = {value: ''};
  //   const c = {value: ''};
  //   const d = {value: 'x'};
  //   const e = {value: 'x'};
  //   test.ok(run([a]).length === 0, 'Single proxy, no issue');
  //   test.ok(run([a, d]).length === 0, 'Two proxies, no issues');
  //   test.ok(run([b, c]).length === 0, 'Two proxies, no issues, still');
  //   test.ok(run([a, b, c, c, d]).length === 0, 'Five proxies, no issue');
  //   test.ok(run([a, b, c, d, e]).length === 2, 'Five proxies, two issues');
  //   test.todo('Async test');
  // });
  noDuplicateValues = util.delay(noDuplicateValues, 100);

  /**
   * Based on an extraction value, attempts to find matching data to
   * automatically fill in.
   * @param {Object} proxy - The proxy containing the extraction url.
   * @todo Combine with Save feature
   */
  function prefill(proxy) {
    if (!user.config.get('enablePrefill')) {
      return;
    }
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
    if (targets.every((target, idx) => target.value === values[idx])) {
      return;
    }
    const numValues = values.filter(v => v).length
    if (!confirm(
      `Would you like to use ${numValues / 2} prefill values instead?` +
      util.mapToBulletedList(values)
    )) {
      user.log.notice('Rejected the prefill values');
      return;
    }
    user.log.notice('Found prefill values');
    for (let idx in values) {
      targets[idx].value = values[idx];
    }
    util.attention({on: ref.editButton, n: 0, click: true});
  }

  /**
   * Pops up a confirmation dialog. On confirmation, will reset all counters.
   */
  async function resetCounter() {
    const counterList = util.mapToBulletedList(user.counter.get());
    const question = (counterList)
        ? 'Please confirm.\nAre you sure you want to reset all counters?' +
        counterList
        : 'Nothing to reset. No counters set';
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
      util.mapToBulletedList(values.slice(1), 2)
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
        user.log.notice('Skipping task\n' + environment.taskId().decoded);
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
    user.log.notice('Submitting\n' + environment.taskId().decoded);
    guiUpdate('Submitting');
    await util.wait(100);
    if (button.disabled) {
      await util.wait(100);
      if (button.disabled) {
        user.log.warn('Not ready to submit any more');
        return false;
      }
    }
    button.click();
    util.dispatch('issueUpdate', {issueType: 'reset'});
    user.counter.add('Submitted');
    return true;
  }
  submit = util.debounce(submit, 100);

  const tabOrder = (function tabOrderMiniModule() {
    /**
     * Set the tabIndex of a proxy to 0, making it tabbable.
     *
     * @param {Object} proxy
     */
    function add(proxy) {
      proxy.tabIndex = 0;
    }
    /**
     * Set the tabIndex of a group of proxies, sequentially, making
     * them tabbable in order.
     *
     * @param {Object} proxy. Ignored
     * @param {number} idx. Ignored
     * @param {Object[]} group
     */
    function set(_, __, group) {
      for (let idx in group) {
        group[idx].tabIndex = idx + 1;
      }
    }
    set = util.debounce(set);

    /**
     * Set the tabIndex of a proxy to -1, making it untabbable.
     *
     * @param {Object} proxy
     */
    function remove(proxy) {
      proxy.tabIndex = -1;
    }
    return {
      add,
      set,
      remove,
    }
  })();

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
      const invalidScreenshot = ref.invalidScreenshot || [];
      const openInTabs = ref.openInTabs || [];
      const finalUrl = ref.finalUrl || [];
      await util.wait(100);
      const allLinks = (user.config.get('includeFinalUrl'))
          ? [...invalidScreenshot, ...openInTabs]
          : [...invalidScreenshot, ...openInTabs, ...finalUrl];
      const urls = allLinks
          .map(el => el.value)
          .filter(val => /^http/.test(val));
      const uniqueLinks = [...new Set(urls)];
      for (let link of uniqueLinks) {
        openTabs.push(window.open(link, link));
      }
      if (openTabs.length !== uniqueLinks.length) {
        user.log.warn(
          `Could not open all tabs. Check the Chrome popup blocker.`
        );
      }
    }
    return {
      open,
      close,
      refresh: () => { close(); open(); },
    }
  })();

  function updateCharacterCount(_, __, group) {
    const count = group[0].value.length;
    const characters = count === 1 ? 'character' : 'characters';
    group[1].textContent =
        `You have used ${count || 'no'} ${characters}`;
    if (count < 26) {
      group[1].css = {color: 'black'};
    } else if (count < 51) {
      group[1].css = {color: '#872b20'};
    } else {
      group[1].css = {color: '#dd4b39'};
    }
  }
  updateCharacterCount = util.delay(updateCharacterCount);

  return {
    comment,
    fallThrough,
    noForbiddenPhrase,
    guiUpdate,
    is,
    keepAlive,
    noDuplicateValues,
    prefill,
    resetCounter,
    saveExtraction,
    skipTask,
    submit,
    tabOrder,
    tabs,
    updateCharacterCount,

    addDashes: changeValue({
      to: '---',
      when: testRegex(/^$/),
      is: true,
    }),

    noMoreThan25Chars: issueUpdate({
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

      shared.guiUpdate('Loaded');
      user.log.ok('TwoTwentyOne loaded');

      /**
       * Click the 'Acquire next task' button.
       */
      async function clickAcquire() {
        util.attention({on: ref.firstButton, click: true});
        try {
          await util.retry(clickContinue, 20, 100)();
        } catch (e) {
          user.log.warn('Continue button did not appear.', {print: false});
        }
        main();
        await util.wait(400);
        shared.guiUpdate('Press Start');
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
          util.attention({on: ref.select, n: key - 1, click: true});
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
        onClick: clickAcquire,
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
  
  const labels = (function labelsModule() {
    function countTasks() {
      try {
        let dataLoaded = false;
        const counters = {
          'Active': 0,
          'Disagreement': 0,
          'Completed': 0,
          'Pending': 0,
          'Invalidated': 0,
        };
        const letters = Object.keys(counters);
        const nums = [...document.querySelectorAll('.IX2JW6B-k-a:nth-child(7)')]
            .map(e => e.textContent);
        for (let n of nums) {
          const b = n.split(' / ');
          for (let i in b) {
            const letter = letters[i];
            counters[letter] += Number(b[i]);
            if (Number(b[i]) > 0) {
              dataLoaded = true;
            }
          }
        }
        util.dispatch('guiUpdate', {stage: 'Currently visible', counters});
        return dataLoaded;
      } catch (e) {
        user.log.warn('Labels flow encountered an error.');
        return false;
      }
    }
    countTasks = util.retry(countTasks, 30, 1000);
    function init() {
      util.dispatch('guiUpdate', {stage: 'Trying to count'});
      countTasks();
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

    const stages = {
      async start() {
        util.attention({on: ref.approvalButtons, n: 1, click: true});
        shared.comment.removeInitials();
        shared.guiUpdate('Ready to edit');
      },

      async approve() {
        util.attention({on: ref.approvalButtons, n: 0, click: true});
        completeScreenshots();
        shared.tabs.close();
        shared.comment.addInitials();
        shared.guiUpdate('Approved');
      },

      async submit() {
        if (ref.submitButton[0].disabled) {
          toStage('start');
          user.log.warn('Task is not ready');
          return;
        }
        const submitted = await shared.submit();
        if (submitted) {
          await util.wait(1000);
          shared.guiUpdate('Press Start');
        }
      }
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('start', 'approve') && toStage('submit');
    const start = () => stageIs('approve') && toStage('start');

    /**
     * Exposes methods that try to find specific proxies and click on
     * them.
     */
    const click = (function clickMiniModule() {
      function addItem(n) {
        if (n < 2) {
          for (let button of ref.addItem) {
            button.click();
          }
        } else {
          util.attention({on: ref.addItem, n: n - 2, click: true});
        }
      }
      function leaveBlank(n) {
        const leaveBlankButtons = ref.leaveBlank.slice(-3);
        if (n < 2) {
          for (let button of leaveBlankButtons) {
            button.click();
          }
        } else {
          const button = leaveBlankButtons[n - 2];
          button.click();
        }
      }
      return {
        addItem,
        leaveBlank,
      }
    })();

    /**
     * Exposes methods that try to find specific proxies and move the focus
     * to them.
     */
    const focus = (function focusMiniModule() {
      function addDataButton() {
        util.attention({
          on: ref.addDataButton, n: 0, focus: true, scrollIntoView: true
        });
      }
      function editButton() {
        util.attention({
          on: ref.editButton, n: 0, focus: true, scrollIntoView: true
        });
      }
      function item1() {
        util.attention({
          on: ref.textAreas, n: 0, click: true, focus: true
        });
        util.attention({
          on: ref.editButton, n: 0, click: true, scrollIntoView: true
        });
      }
      function item(n) {
        if (!ref.textAreas) {
          return;
        }
        util.attention({
          on: ref.textAreas, n: n - 1, focus: true
        });
        util.attention({
          on: ref.editButton, n: n - 1, click: true, scrollIntoView: true
        });
      }
      return {
        addDataButton,
        editButton,
        item1,
        item,
      }
    })();

    /**
     * Before starting a task, decide whether to skip it or to open all
     * tabs.
     */
    function beginTask() {
      if (shared.is.ownTask()) {
        shared.skipTask();
        return;
      }
      shared.tabs.refresh();
    }

    /**
     * Set the current task status, by changing the values in the
     * dropdown menus.
     *
     * @param {string} type
     * @ref {statusDropdown}
     * @ref {canOrCannotExtractButtons}
     */
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
      function clickCanExtract(type) {
        if (!ref.canOrCannotExtractButtons) {
          user.log.warn('canOrCannotExtractButtons not found');
          return;
        }
        if (type !== 'canExtract' && ref.invalidScreenshot) {
          util.attention({on: ref.invalidScreenshot, focus: true});
        }
        const n = (type === 'canExtract') ? 0 : 1;
        util.attention({
          on: ref.canOrCannotExtractButtons, n, click: true, focus: true
        });
      }
      async function setTo() {
        const [b, c, d] = keys[type];
        const dropdowns = ref.statusDropdown;
        dropdowns[0].value = b;
        dropdowns[c].value = d;
        clickCanExtract(type);
      }
      return setTo;
    }

    /**
     * Ensure that all screenshot boxes are filled in. Fills in blank
     * boxes with the first screenshot link found, starting from the left.
     *
     * @ref {screenshots}
     */
    function completeScreenshots() {
      const screenshots = ref.screenshots;
      const link =
          screenshots[0].value ||
          screenshots[1].value ||
          screenshots[2].value ||
          screenshots[3].value ||
          screenshots[4].value;
      if (!link) {
        return;
      }
      for (let screenshot of screenshots) {
        if (!screenshot.value && !screenshot.disabled) {
          screenshot.value = link;
        }
      }
    }

    /**
     * Move the focus to the prior proxy in the group, if possible.
     * When moving out of an empty box, mark the corresponding item
     * as 'Leave Blank'.
     *
     * @param {Object} _
     * @param {number} idx
     * @param {Object[]} group
     */
    function moveLeft(_, idx, group) {
      if (idx < 1) {
        return;
      }
      group[idx - 1].focus();
      if (group[idx].value === '') {
        click.leaveBlank(idx);
      }
    }

    /**
     * Move the focus to the next proxy in the group, if possible.
     * When moving into an empty box, mark the corresponding item
     * as 'Add Item'.
     *
     * @param {Object} _
     * @param {number} idx
     * @param {Object[]} group
     */
    function moveRight(_, idx, group) {
      if (idx - 1 > group.length) {
        return;
      }
      if (group[idx + 1] && group[idx + 1].disabled) {
        click.addItem(idx + 1);
      }
      util.attention({on: group, n: idx + 1, focus: true});
    }

    /**
     * Swap the values of the currently selected item with the item to
     * the left, if possible.
     *
     * @param {Object} _
     * @param {number} idx
     * @param {Object[]} group
     * @ref {textAreas}
     * @ref {linkAreas}
     * @ref {screenshots}
     */
    function swapLeft(_, idx) {
      const text = ref.textAreas;
      const link = ref.linkAreas;
      const screenshot = ref.screenshots;
      if (idx < 1) {
        return;
      }
      [text[idx].value, text[idx - 1].value] =
          [text[idx - 1].value, text[idx].value];
      [link[idx].value, link[idx - 1].value] =
          [link[idx - 1].value, link[idx].value];
      [screenshot[idx].value, screenshot[idx - 1].value] =
          [screenshot[idx - 1].value, screenshot[idx].value];
      text[idx - 1].focus();
      user.log.ok('Swapped items', {print: false, save: false});
    }

    /**
     * Swap the values of the currently selected item with the item to
     * the right, if possible. Does not swap with disabled items.
     *
     * @param {Object} _
     * @param {number} idx
     * @ref {textAreas}
     * @ref {linkAreas}
     * @ref {screenshots}
     */
    function swapRight(_, idx) {
      const text = ref.textAreas;
      const link = ref.linkAreas;
      const screenshot = ref.screenshots;
      if (idx + 1 > text.length || text[idx + 1].disabled) {
        return;
      }
      [text[idx].value, text[idx + 1].value] =
          [text[idx + 1].value, text[idx].value];
      [link[idx].value, link[idx + 1].value] =
          [link[idx + 1].value, link[idx].value];
      [screenshot[idx].value, screenshot[idx + 1].value] =
          [screenshot[idx + 1].value, screenshot[idx].value];
      text[idx + 1].focus();
      user.log.ok('Swapped items', {print: false, save: false});
    }

    /**
     * Remove the values of the currently selected item.
     *
     * @param {Object} _
     * @param {number} idx
     * @ref {textAreas}
     * @ref {linkAreas}
     * @ref {screenshots}
     */
    function deleteItem(_, idx) {
      const text = ref.textAreas;
      const link = ref.linkAreas;
      const screenshot = ref.screenshots;

      text[idx].value = '';
      link[idx].value = '';
      screenshot[idx].value = '';
      text[idx].focus();
      user.log.ok('Deleted item', {print: false, save: false});
    }
    
    function deleteAllItems() {
      for (let idx in [0,1,2,3,4,5]) {
        deleteItem(null, idx);
      }
    }

    function moveFocusToText(_, idx) {
      util.attention({on: ref.textAreas, n: idx, focus: true});
    }
    
    function checkDomainMismatch() {
      const getTrimmedDomain = (url) => {
        return util.getDomain(url).split('.').slice(-2).join('.').toLowerCase();
      }
      const one = getTrimmedDomain('https://' + ref.creative[1].textContent);
      const two = getTrimmedDomain(ref.openInTabs.slice(-1)[0].value);
      const three = getTrimmedDomain(ref.finalUrl[0].value);
      const links = [one, two, three].filter(o => o);

      const packet = {proxy: ref.creative[1], issueType: 'Domain mismatch'};
      if (new Set(links).size !== 1) {
        packet.issueLevel = 'orange';
        packet.message = links.join(', ');
      }
      util.dispatch('issueUpdate', packet);
    }
    checkDomainMismatch = util.debounce(checkDomainMismatch);

    /**
     * Set up event handlers.
     */
    function setupReactions() {

      ー({
        name: 'Text',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [1, 5, 9, 13, 17],
        onClick: (_, idx) => idx > 1 && click.addItem(idx),
        onInteract: [
          shared.noMoreThan25Chars,
          shared.noDuplicateValues,
          shared.noForbiddenPhrase,
        ],
        onKeydown_CtrlShiftAltArrowLeft: swapLeft,
        onKeydown_CtrlShiftAltArrowRight: swapRight,
        onKeydown_CtrlAltArrowLeft: moveLeft,
        onKeydown_CtrlAltArrowRight: moveRight,
        onKeydown_CtrlDelete: deleteItem,
        onKeydown_CtrlShiftDelete: deleteAllItems,
        onLoad: [
          shared.noMoreThan25Chars,
          shared.noDuplicateValues,
          shared.noForbiddenPhrase,
        ],
        onKeydown_CtrlAltArrowLeft: swapLeft,
        onKeydown_CtrlAltArrowRight: swapRight,
        onKeydown_CtrlDelete: deleteItem,
        ref: 'textAreas',
      });

      ー({
        name: 'Link',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [2, 6, 10, 14, 18],
        onFocusout: [
          shared.requireUrl,
          shared.removeScreenshot,
        ],
        onKeydown_CtrlAlt: moveFocusToText,
        onLoad: shared.keepAlive,
        onPaste: [
          shared.requireUrl,
          shared.removePorg,
          shared.removeScreenshot,
        ],
        ref: 'linkAreas'
      });

      ー({
        name: 'Screenshot',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [3, 7, 11, 15, 19],
        onFocusout: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        onKeydown_CtrlAlt: moveFocusToText,
        onPaste: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        ref: 'screenshots',
      });

      ー({
        name: 'Dashes',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [4, 8, 12, 16, 20],
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.tabOrder.remove,
        ],
        ref: 'dashes',
      });

      ー({
        name: 'Analyst Comment',
        select: '.feedback-display-text',
        pick: [0],
        ref: 'analystComment',
      });

      ー({
        name: 'Landing Page Url',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [0],
        onKeydown_CtrlAltArrowRight: [
          () => util.attention({on: ref.editButton, click: true}),
          focus.item1,
        ],
        onLoad: shared.prefill,
      });

      ー({
        name: 'LinksAndLP',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [0, 2, 6, 10, 14, 18],
        onInteract: shared.noDuplicateValues,
        onPaste: shared.noDuplicateValues,
      });

      ー({
        name: 'AllUrls',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [2, 6, 10, 14, 18, 3, 7, 11, 15, 19, 0],
        ref: 'openInTabs',
      });

      ー({
        name: 'Final Url',
        select: 'textarea',
        pick: [65],
        ref: 'finalUrl',
      });
      
      ー({
        name: 'InvalidScreenshot',
        rootSelect: '.errorbox-good',
        rootNumber: 1,
        select: 'textarea',
        onKeydown_CtrlAltArrowRight: [
          () => util.attention({on: ref.finalCommentBox, focus: true}),
        ],
        ref: 'invalidScreenshot',
      });
      
      ー({
        name: 'Creative',
        rootSelect: '.context-item',
        rootNumber: [2],
        select: '*',
        pick: [3, 6, 8],
        onLoad: checkDomainMismatch,
        ref: 'creative',
      });

      ー({
        name: 'Prefill',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [1, 2, 5, 6, 9, 10, 13, 14, 17, 18],
        ref: 'prefillTarget',
      });

      for (let pair of [[1, 2],[5, 6],[9, 10],[13, 14],[17, 18]]) {
        ー({
          name: 'Fall',
          rootSelect: '#extraction-editing',
          select: 'textarea',
          pick: pair,
          onPaste: shared.fallThrough,
        });
      }

      for (let rootNumber of [0, 8, 17, 26, 35]) {
        ー({
          name: 'Remaining',
          rootSelect: '.extraction-item table',
          rootNumber,
          select: 'div, textarea',
          pick: [2, 3],
          onChange: shared.updateCharacterCount,
          onKeydown: shared.updateCharacterCount,
          onLoad: shared.updateCharacterCount,
        });
      }

      ー({
        name: 'StatusDropdown',
        select: 'select',
        pick: [0, 1, 2],
        ref: 'statusDropdown',
      });

      ー({
        name: 'Add Data',
        rootSelect: '.extraction',
        select: 'label',
        withText: 'Add Data',
        onKeydown_CtrlAltArrowRight: [
          () => util.attention({on: ref.addDataButton, n: 0, click: true}),
          focus.item1,
        ],
        ref: 'addDataButton',
      });

      ー({
        name: 'Edit',
        rootSelect: '.extraction',
        select: 'label',
        withText: 'Edit',
        onLoad: shared.tabOrder.add,
        onKeydown_CtrlAltArrowRight: [
          (proxy) => proxy.click(),
          focus.item1,
        ],
        ref: 'editButton',
      });

      ー({
        name: 'Add Item',
        rootSelect: '#extraction-editing',
        select: 'label',
        withText: 'Add Item',
        ref: 'addItem',
      });

      ー({
        name: 'Leave Blank',
        rootSelect: '#extraction-editing',
        select: 'label',
        withText: 'Leave Blank',
        ref: 'leaveBlank',
      });

      ー({
        name: 'ApprovalButtons',
        select: 'label',
        pick: [32, 33],
        ref: 'approvalButtons',
      });

      ー({
        name: 'Comment Box',
        rootSelect: '.addComments',
        select: 'textarea',
        pick: [0],
        onFocusout: start,
        onKeydown_CtrlAltArrowRight: [
          () => util.attention({on: ref.editButton, n: 0, click: true}),
          focus.item1,
        ],
        ref: 'finalCommentBox',
      });

      ー({
        name: 'CanOrCannotExtract',
        select: 'label',
        pick: [0, 1],
        onKeydown_CtrlAltArrowRight: [
          () => util.attention({on: ref.editButton, n: 0, click: true}),
          focus.item1,
        ],
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
        name: 'TabRemove',
        select: 'label, button',
        onLoad: shared.tabOrder.remove,
      });

      ー({
        name: 'Extractions2And3',
        select: '.extraction',
        pick: [1, 2],
        css: {display: 'none'},
      });

      ー({
        name: 'Preview Extractions',
        select: '.extraction-preview',
        pick: [1, 2],
        css: {display: 'none'},
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
          beginTask,
          focus.addDataButton,
          focus.editButton,
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

  return {
    home,
    labels,
    sl,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// APP module

function main() {
  const detectedFlowName = environment.flowName();
  if (!detectedFlowName) {
    return false;
  }

  util.dispatch('issueUpdate', {issueType: 'reset'});
  eventReactions.reset();
  ー({
    name: 'Links',
    select: 'a',
    onClick: util.delay(main, 1000),
  });
  eventReactions.setGlobal({
    onKeydown_Backquote: main,
  });
  flows[detectedFlowName].init();
  return true;
};

(async function() {
  try {
    await util.retry(main, 20, 150)();
  } catch (e) {
    const warning = 'No workflow identified';
    shared.guiUpdate(warning);
    user.log.warn(warning);
  }
})();
undefined;
