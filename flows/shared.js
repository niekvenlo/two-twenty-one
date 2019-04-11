var shared = (function workflowMethodsModule() {
  'use strict';

  /**
   * @fileoverview Methods designed to add reactions to HTMLElement proxies.
   */

  const ALERT_LEVELS = ['high', 'medium', 'low'];

  /**
   * Conditionally set a new value to a proxy.
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
          {debug: true, save: false, print: false, toast: true},
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
        util.bulletedList(ALERT_LEVELS)
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
        util.attention(ref.editButton, 0, 'click');
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
    'iPhone': async () => {
      await util.wait(100);
      return brandCapitalisation('Iphone') === 'iPhone';
    },
  });

  function commonReplacements(value) {
    const keepCaps = user.config.get('keep original capitalisation');
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
          .trim();
    tmpValue = (keepCaps) ? tmpValue : tmpValue.toLowerCase();
    for (let rule of replacementStore) {
      const [regex, replaceWith] = rule;
      tmpValue = tmpValue.replace(util.toRegex(regex), replaceWith);
    }
    return (keepCaps) ? tmpValue : util.cap.firstLetter(tmpValue);
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
      user.log.warn(
        'No forbidden phrases loaded.',
        {save: true, print: true, toast: true},
      );
    }
    const packet = {proxy, issueType: 'Forbidden phrase'};
    for (let rule of phrases) {
      const [phrase, message] = rule;
      const regex = util.toRegex(phrase);
      if (regex && regex.test(proxy.value)) {
        const clearValue = proxy.value.replace(/\s/g, '░');
        const clearPhrase = phrase.replace(/\s/g, '░');
        packet.issueLevel = 'medium';
        packet.message = (message)
            ? `${message} (${clearValue})`
            : `'${clearValue}' matches '${clearPhrase}'`;
        break;
      }
    }
    util.dispatch('issueUpdate', packet);
  }
  noForbiddenPhrase = util.delay(noForbiddenPhrase, 100);

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
    let statusType = '';
    function setStatus(newType) {
      if (statusType === newType) {
        return;
      }
      const commentBox = getCommentBox();
      const matchStatusOrEnd = new RegExp(statusType + '|$');
      commentBox.value =
          commentBox.value.replace(matchStatusOrEnd, newType || '');
      statusType = newType;
    }
    return {
      addInitials,
      removeInitials,
      setStatus,
    };
  })();
  atest.group('comment', {
    'before': async () => {
      await util.wait(100);
      const tmp = ref.finalCommentBox;
      const initials = user.config.get('initials');
      const fakeBox = {
          value: 'user comment',
          focus: () => {},
          scrollIntoView: () => {},
        }
      ref.finalCommentBox = [fakeBox];
      return {tmp, initials};
    },
    'after': (o) => ref.finalCommentBox = o.tmp,
    'Add initials': (o) => {
      comment.addInitials();
      return ref.finalCommentBox[0].value.includes(o.initials);
    },
    'Remove initials': (o) => {
      comment.addInitials();
      comment.removeInitials();
      return !ref.finalCommentBox[0].value.includes(o.initials);
    },
    'Set status': (o) => {
      comment.setStatus('test');
      return ref.finalCommentBox[0].value.includes('test');
    },
    'Change status': (o) => {
      comment.setStatus('test');
      comment.setStatus('changed');
      const value = ref.finalCommentBox[0].value;
      return value.includes('changed') && !value.includes('test');
    },
  });
  
  function checkCapitals(proxy) {
    const packet = {proxy, issueType: 'Unusual capitalisation'};
    const looksCorrect = (string) => {
      const brands = user.storeAccess({
        feature: 'BrandCapitalisation',
      }) || [];
      const firstWord = string.split(' ')[0]
      const firstLetter = string[0] || 'X';
      for (let brand of brands) {
        if (new RegExp('^' + brand, 'i').test(firstWord)) {
          if (new RegExp('^' + brand).test(firstWord)) {
            return true;
          }
          return false;
        }
      }
      return firstLetter === firstLetter.toUpperCase();
    };
    if (!looksCorrect(proxy.value)) {
      packet.issueLevel = 'medium';
      packet.message =`Check capitalisation of '${proxy.value}' in ${proxy.name}`;
    }
    util.dispatch('issueUpdate', packet);
  }

  /**
   * Locally disable browser spellcheck on specified elements.
   *
   * @param {Object} _ - Ignored
   * @param {number} __ - Ignored
   * @param {Objec[]} group - Array of proxies.
   */
  function disableSpellcheck(_, __, group) {
    for (let proxy of group) {
      proxy.spellcheck = false;
    }
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
    if (group.length !== 2) {
      throw new RangeError('fallThrough requires two proxies.');
    }
    if (idx > 0) {
      return;
    }
    const pastedValue = group[0].value;
    if (/gleplex/.test(pastedValue)) {
      group[0].value = '';
      util.wait().then(() => {
        group[0].click();
        user.log.warn(
          'Cannot paste a screenshot here',
          {save: true, print: true, toast: true},
        );
      });
      return;
    }
    if (/^https?:/.test(pastedValue)) {
      group[1].value = pastedValue;
      util.wait().then(() => {
        util.attention(group, 1, 'click');
        util.attention(group, 0, 'click, focus');
      });
    }
    const value = brandCapitalisation(commonReplacements(group[0].value));
    group[0].value = value;
    if (pastedValue === value) {
      user.log.low(
        `No change to '${pastedValue}'`,
        {debug: true, print: false, toast: false},
      );
      return;
    }
    user.log.notice(
      `'${value}' from '${pastedValue}'`,
        {debug: true, print: false, toast: true},
    );
  }
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
      // @todo Should use ref.taskTitle[0]
      const title = document.querySelector('.taskTitle');
      if (!title) {
        return false;
      }
      return /Analyst/.test(title.textContent);
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
      if (!initials) {
        user.log.warn(
          `You haven't set your initials.`,
            {debug: true, print: true, save: true, toast: true},
        );
        return false;
      }
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
   * Tests whether all proxies in a group have the same domain.
   *
   * @param {Object} _ - Unused parameter. The triggering proxy.
   * @param {number} __ - Unused parameter. The index of the triggering proxy.
   * @param {Object[]} group - Array of proxies to check for mismatching
   * domains.
   */
  function noDomainMismatch(_, __, group) {
    const getTrimmedDomain = (url) => {
      const domain = util.getDomain(url).toLowerCase();
      const n = (/co.uk/.test(url)) ? 3 : 2;
      return domain.split('.').slice(-n).join('.');
    };
    const lpDomain = getTrimmedDomain(group.slice(-1)[0].value);
    const mismatch = [];
    for (let proxy of group) {
      const proxyDomain = getTrimmedDomain(proxy.value);
      if (lpDomain && proxyDomain && (lpDomain !== proxyDomain)) {
        mismatch.push(proxy);
      }
    }
    for (let proxy of group) {
      const packet = {proxy, issueType: 'Domain mismatch'};
      if (mismatch.includes(proxy)) {
        packet.issueLevel = 'medium';
        const trimmed = getTrimmedDomain(proxy.value);
        packet.message =`Different domain '${trimmed}' in ${proxy.name}`;
      }
      util.dispatch('issueUpdate', packet);
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
  function noDuplicateValues(_, __, group) {
    const clean = (value) => value.replace(/\/#?\??$/, '');
    const values = [];
    const dupes = [];
    const packets = [];
    for (let proxy of group) {
      const value = clean(proxy.value);
      if (values.includes(value)) {
        dupes.push(value);
      }
      if (value !== '') {
        values.push(value);
      }
    }
    for (let proxy of group) {
      const value = clean(proxy.value);
      let packet = {proxy, issueType: 'Dupes'};
      if (dupes.includes(value)) {
        packet.issueLevel = 'high';
        packet.message = `Duplicate values '${value}' in ${proxy.name}`;
      }
      packets.push(packet);
      if (value) {
        values.push(value);
      }
    }
    for (let packet of packets) {
      util.dispatch('issueUpdate', packet);
    }
    return packets;
  }
  noDuplicateValues = util.delay(noDuplicateValues, 100);

  /**
   * Tests whether any proxies in a group have the same first word, and flags
   * proxies that repeat previous first words.
   *
   * @param {Object} _ - Unused parameter. The triggering proxy.
   * @param {number} __ - Unused parameter. The index of the triggering proxy.
   * @param {Object[]} group - Array of proxies to check for duplicate values.
   */
  function noDuplicateVerbs(_, __, group) {
    const firstWords = [];
    const dupes = [];
    for (let proxy of group) {
      const firstWord = proxy.value.split(' ')[0];
      if (firstWords.includes(firstWord)) {
        dupes.push(proxy);
      }
      firstWord && firstWords.push(firstWord);
    }
    for (let proxy of group) {
      const packet = {proxy, issueType: 'Repeated verb'};
      if (dupes.includes(proxy)) {
        packet.issueLevel = 'low';
        packet.message = `First word repeated: '${proxy.value.split(' ')[0]}'`;
      }
      util.dispatch('issueUpdate', packet);
    }
  }

  /**
   * Based on an extraction value, attempts to find matching data to
   * automatically fill in.
   * @param {Object} proxy - The proxy containing the extraction url.
   * @todo Combine with Save feature
   */
  function prefill(proxy) {
    if (!user.config.get('enablePrefill')) { // @todo Way to add new Config option.
      return;
    }
    const flowName = util.cap.firstLetter(environment.flowName());
    const values = user.storeAccess({
      feature: `${flowName}SavedExtractions`,
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
      util.bulletedList(values)
    )) {
      user.log.notice('Rejected the prefill values');
      return;
    }
    user.log.notice('Found prefill values');
    for (let idx in values) {
      targets[idx].value = values[idx];
    }
    util.attention(ref.editButton, 0, 'click');
  }

  /**
   * Remove stray characters from proxy values.
   */
  function removeQuotes(proxy) {
    const chars = '`‘’';
    if (proxy.value.split('').some(c => chars.includes(c))) {
      user.log.notice('Removing characters', {toast: true});
    }
    proxy.value = proxy.value.replace(new RegExp(`[${chars}]`, 'g'), '');
  }

  /**
   * Pops up a confirmation dialog. On confirmation, will reset all counters.
   */
  async function resetCounter() {
    const counterList = util.bulletedList(user.counter.get());
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
   * Skip the current task.
   * Currently takes no parameters but could be rewritten to override the
   * locations of the buttons in the DOM.
   */
  async function skipTask() {
    const RETRIES = 50;
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
        const creativeUrl =
            ref.creative&& ref.creative[1] && ref.creative[1].textContent;
        const taskId = environment.taskId().decoded.match(/.{1,41}/g).join('\n');
        user.log.skip(`Skipping task\n${creativeUrl}\n${taskId}`);
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
    await util.wait(400);
    shared.guiUpdate('Press Start');
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
    const creativeUrl =
        ref.creative&& ref.creative[1] && ref.creative[1].textContent;
    const taskId = environment.taskId().decoded.match(/.{1,41}/g).join('\n');
    user.log.submit(`Submitting task\n${creativeUrl}\n${taskId}`);
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
  submit = util.delay(util.debounce(submit, 100), 100);

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
      const lp = openInTabs.slice(-1);
      const tabs = openInTabs.slice(0, -1);
      const screenshots = ref.screenshots || [];
      if (ref.analystComment && ref.analystComment[0]) {
        const commentLinks =
            ref.analystComment[0]
            .textContent.match(/http[^\s,]*/g);
        if (commentLinks) {
          const commentObjects = commentLinks.map(link => ({value: link}));
          screenshots.push(...commentObjects);
        }
      }
      const originalLp = ref.finalUrl || [];
      await util.wait(100);
      const allLinks = [
        ...invalidScreenshot,
        ...tabs,
        ...screenshots,
        ...lp,
        ...originalLp,
      ].map(el => el.value).filter(value => /^http/.test(value));
      const uniqueLinks = [...new Set(allLinks)];

      for (let link of uniqueLinks) {
        const preface = 'https://www.google.com/evaluation/ads/beta/'
            + 'rating/gwt/../redirect?a=true&q=';
        const googleLink = user.config.get('use google links')
            ? preface + encodeURIComponent(link)
            : link;
        openTabs.push(window.open(googleLink, link));
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

  /**
   * Trim leading and trailing spaces from proxy values.
   */
  function trim(proxy) {
    if (proxy.value !== proxy.value.trim()) {
      user.log.notice(
        'Removing spaces from end',
        {toast: true}
      );
    }
    proxy.value = proxy.value.trim();
  }

  function updateCharacterCount(_, __, group) {
    const count = group[0].value.length;
    const characters = count === 1 ? 'character' : 'characters';
    group[1].textContent =
        `You have used ${count || 'no'} ${characters}`;
    const limit = (user.config.get('12 character limit')) ? 12 : 25;
    if (count <= limit) {
      group[1].css = {color: 'black'};
    } else if (count < 51) {
      group[1].css = {color: '#872b20'};
    } else {
      group[1].css = {color: '#dd4b39'};
    }
  }
  updateCharacterCount = util.delay(updateCharacterCount);

  return {
    checkCapitals,
    comment,
    disableSpellcheck,
    fallThrough,
    noForbiddenPhrase,
    guiUpdate,
    is,
    keepAlive,
    noDomainMismatch,
    noDuplicateValues,
    noDuplicateVerbs,
    prefill,
    removeQuotes,
    resetCounter,
    skipTask,
    submit,
    tabOrder,
    tabs,
    trim,
    updateCharacterCount,

    addDashes: changeValue({
      to: '---',
      when: testRegex(/^$/),
      is: true,
    }),

    noMoreThan25Chars: issueUpdate({
      issueLevel: 'high',
      issueType: 'More than 25 characters long',
      when: testLength({max: 25}),
    }),

    noMoreThan12Chars: issueUpdate({
      issueLevel: 'high',
      issueType: 'More than 12 characters long',
      when: testLength({max: 12}),
    }),

    removeDashes: changeValue({
      to: '',
      when: testRegex(/---/),
      is: true,
    }),

    requireUrl: changeValue({
      to: '',
      when: testRegex(/^https?:\/\/[^\s]+$/),
      is: false,
    }),

    requireScreenshot: changeValue({
      to: '',
      when: testRegex(/^https.{17}gleplex.com.{12,13}$/),
      is: false,
    }),

    removeBannedDomains: () => {
      changeValue({
        to: '',
        when: testRegex(/le.com\/eva/),
        is: true,
      });
      changeValue({
        to: '',
        when: testRegex(/http:..youtube.com/),
        is: true,
      });
    },

    removeScreenshot: changeValue({
      to: '',
      when: testRegex(/^https.{17}gleplex.com.{12,13}$/),
      is: true,
    }),

    toggleSelectYesNo: cycleSelect(['YES', 'NO']),
  }
}
)();
