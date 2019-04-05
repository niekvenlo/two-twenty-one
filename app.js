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
    const title = ー({
      name: 'Title',
      select: '.taskTitle',
      pick: [0],
    })[0];
    const buttonText = firstButton && firstButton.textContent;
    const headerText = header && header.textContent;
    const titleText = title && title.textContent;
    if (/Acquire/.test(buttonText)) {
      return 'home';
    }
    if (/Continue/.test(buttonText)) {
      return 'home';
    }
    if (/Sitelinks/.test(headerText)) {
      return 'sl'
    }
    if (/Snippets/.test(headerText)) {
      return 'ss'
    }
    if (/Curated Creatives/.test(titleText)) {
      return 'as'
    }
    if (/twentyone/.test(headerText)) {
      return 'sl';
    }
    if (/#activeevals\/subpage=labels/.test(document.location.href)) {
      return 'labels';
    }
    if (headerText || titleText) {
      return 'unsupported';
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

  const ALERT_LEVELS = ['high', 'medium', 'low'];

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
    return util.cap.firstLetter(tmpValue);
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
      user.log.warn('Cannot paste a screenshot here');
      util.wait().then(() => group[0].click());
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
        {print: false, toast: false}
      );
      return;
    }
    user.log.notice(
      `'${value}' from '${pastedValue}'`
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
   * Save the values from the current extraction.
   * Logs the values, and adds them to the prefill data store.
   * The domain value of the first proxy is used as the key.
   */
  function saveExtraction() {
    if (!ref.saveExtraction) {
      user.log.warn('No extraction textareas found.');
      return;
    }
    const [key, ...values] = ref.saveExtraction.map(proxy => proxy.value);
    if (!key) {
      user.log.warn('Not enough data to save.');
      return;
    }
    const domain = util.getDomain(key) || key;
    const flowName = util.cap.firstLetter(environment.flowName());
    user.storeAccess({
      feature: `${flowName}SavedExtractions`,
      locale: environment.locale(),
      set: {[domain]: values},
    });
    user.log.ok(
      'Saving new default extraction for ' + domain +
      util.bulletedList(values),
    );
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
        const taskId = environment.taskId().decoded;
        user.log.notice(`Skipping task\n${creativeUrl}\n${taskId}`);
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
    const taskId = environment.taskId().decoded;
    user.log.notice(`Submitting task\n${creativeUrl}\n${taskId}`);
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
      user.log.notice('Removing spaces from end', {toast: true});
    }
    proxy.value = proxy.value.trim();
  }

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
      when: testRegex(/gleplex/),
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

      shared.guiUpdate('Rating Home Loaded');
      user.log.ok('TwoTwentyOne loaded');

      /**
       * Click the 'Acquire next task' button.
       */
      async function clickAcquire() {
        util.attention(ref.firstButton, 0, 'click');
        try {
          await util.retry(clickContinue, 50, 150)();
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
          util.attention(ref.select, key - 1, 'click');
        }
      }

      ー({
        name: 'Select',
        select: 'select',
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
      
      const printLog = () => {
        const entries = user.log.raw();
        console.log(JSON.stringify(entries));
      };
      
      const printLogIds = () => {
        const entries = user.log.raw({items: 2000, contains: 'Submitting'});
        console.log(JSON.stringify(entries));
      };

      eventReactions.setGlobal({
        onKeydown_CtrlAltDigit1: toggleSelectWithKey(1),
        onKeydown_CtrlAltDigit2: toggleSelectWithKey(2),
        onKeydown_CtrlAltDigit3: toggleSelectWithKey(3),
        onKeydown_CtrlAltDigit4: toggleSelectWithKey(4),
        onKeydown_CtrlAltDigit5: toggleSelectWithKey(5),
        onKeydown_CtrlAltDigit6: toggleSelectWithKey(6),
        onKeydown_CtrlAltDigit7: toggleSelectWithKey(7),
        onKeydown_CtrlAltDigit8: toggleSelectWithKey(8),
        onKeydown_CtrlAltDigit9: toggleSelectWithKey(9),
        onKeydown_CtrlAltDigit0: () => {
          for (let idx = 0; idx < 10; idx++) {
            toggleSelectWithKey(idx)();
          }
        },
        onKeydown_Enter: clickAcquire,
        onKeydown_NumpadEnter: clickAcquire,
        onKeydown_Space: clickAcquire,
        onKeydown_CtrlAltBracketLeft: shared.resetCounter,
        onKeydown_P: printLog,
        onKeydown_O: printLogIds,
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
        util.attention(ref.approvalButtons, 1, 'click');
        shared.comment.removeInitials();
        shared.guiUpdate('Ready to edit');
      },

      async approve() {
        util.attention(ref.approvalButtons, 0, 'click');
        completeScreenshots();
        util.attention(ref.finalCommentBox, 0, 'focus');
        shared.tabs.close();
        if (!(ref.submitButton[0].disabled)) {
          shared.comment.addInitials();
          shared.guiUpdate('Approved');
        } else {
          toStage('start');
          user.log.warn(
            'Not ready to Approve',
            {save: false, print: false, toast: true}
          );
        }
      },

      async submit() {
        if (ref.submitButton[0].disabled) {
          user.log.warn('Just a sec', {save: false, print: false});
          await util.wait(100);
          if (ref.submitButton[0].disabled) {
            toStage('start');
            user.log.warn('Task is not ready');
            return;
          }
        }
        const submitted = await shared.submit();
        if (submitted) {
          await util.wait(1000);
          shared.guiUpdate('Press Start');
        } else {
          toStage('approve');
        }
      }
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('approve') && toStage('submit');
    const start = () => stageIs('approve') && toStage('start');

    function focusItem(n) {
      util.attention(ref.addDataButton, 0, 'click'),
      util.attention(ref.editButton, 0, 'click, scrollIntoView');
      util.attention(ref.textAreas, n - 1, 'focus');
    }

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
      util.attention(ref.addDataButton, 0, 'focus');
      util.attention(ref.editButton, 0, 'focus');
      util.attention(ref.creative, 0, 'scrollIntoView');
    }
    
    // const status = (function statusMiniModule() {
    //   // return object:
    //   return {
    //     get() {},
    //     canExtract() {},
    //     insufficient() {},
    //     pageError() {},
    //     dynamic() {},
    //     geo() {},
    //     // ...
    //   }
    // });

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
        'emptyCreative': [1, 2, 0, 'Creative Not Available/Comprehendable'],
        'urlsUnchanged': [1, 2, 0, 'URLs Not Changing/Tabs On Same Page'],
        'urlMismatch':   [1, 2, 0, 'Visible URL/LP URL Mismatch'],
      };
      if (!ref.statusDropdown) {
        throw new Error('No status dropdown menus selected.');
      }
      function clickAndFocus(type) {
        const n = (type === 'canExtract') ? 0 : 1;
        util.attention(ref.canOrCannotExtractButtons, n, 'click');
        if (type === 'canExtract') {
          util.attention(ref.editButton, 0, 'click');
          util.attention(ref.addDataButton, 0, 'click, scrollIntoView');
          if (ref.extractionPage.value) {
            focusItem(1);
          } else {
            util.attention(ref.extractionPage, 0, 'focus');
          }
        } else {
          util.attention(ref.invalidScreenshot, 0, 'focus');
        }
      }
      async function setTo() {
        if (!keys[type]) {
          return user.log.warn('Invalid status type: ' + type);
        }
        const [b, c, d, message] = keys[type] || [];
        const dropdowns = ref.statusDropdown;
        dropdowns[0].value = b;
        dropdowns[c].value = d;
        clickAndFocus(type);
        shared.comment.setStatus(message);
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
      if (group[idx].value === '') {
        util.attention(ref.leaveBlank.slice(-3), idx - 2, 'click');
      }
      util.attention(group, idx - 1, 'focus');
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
        util.attention(ref.addItem.slice(-3), idx - 1, 'click');
      }
      util.attention(group, idx + 1, 'focus');
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
      util.attention(ref.editButton, 0, 'click');
      for (let idx in [0,1,2,3,4]) {
        deleteItem(null, idx);
      }
    }

    function moveFocusToText(_, idx) {
      util.attention(ref.editButton, 0, 'click');
      util.attention(ref.textAreas, idx, 'focus');
    }

    function leaveAllBlank() {
      const blank = ref.leaveBlank.slice(-3)
      util.attention(blank, 0, 'click');
      util.attention(blank, 1, 'click');
      util.attention(blank, 2, 'click');
    }

    function checkDomainMismatch() {
      const getTrimmedDomain = (url) => {
        const domain = util.getDomain(url).toLowerCase();
        const n = (/co.uk/.test(url)) ? 3 : 2;
        return domain.split('.').slice(-n).join('.');
      }
      const one = getTrimmedDomain('https://' + ref.creative[1].textContent);
      const two = getTrimmedDomain(ref.openInTabs.slice(-1)[0].value);
      const three = getTrimmedDomain(ref.finalUrl[0].value);
      const links = [one, two, three].filter(o => o);

      const packet = {proxy: ref.creative[1], issueType: 'Creative domain mismatch'};
      if (new Set(links).size !== 1) {
        packet.issueLevel = 'medium';
        packet.message = links.join(', ');
      }
      util.dispatch('issueUpdate', packet);
    }
    checkDomainMismatch = util.debounce(checkDomainMismatch);

    /**
     * Raise an issue if the creative contains no text.
     *
     * @param {Object} proxy
     * @param {number} _
     * @param {Object[]} group
     */
    function checkEmptyCreative(proxy, __, group) {
      const packet = {proxy, issueType: 'Empty creative'};
      if (group.every(el => !el.textContent)) {
        packet.issueLevel = 'medium';
        packet.message = 'Creative is empty';
      }
      util.dispatch('issueUpdate', packet);
    }
    checkEmptyCreative = util.debounce(checkEmptyCreative);

    /**
     * Set up event handlers.
     */
    function setupReactions() {
      
      const innocuousTerm = shared.is.analystTask()
          ? {
              text: [1, 5, 9, 13, 17],
              link: [2, 6, 10, 14, 18],
              dashes: [4, 8, 12, 16, 20],
              linkLP: [2, 6, 10, 14, 18, 0],
              fall: [[1, 2],[5, 6],[9, 10],[13, 14],[17, 18]],
              remain: [0, 8, 17, 26, 35],
            }
          : {
              text: [1, 4, 7, 10, 13],
              link: [2, 5, 8, 11, 14],
              dashes: [3, 6, 9, 12, 15],
              linkLP: [2, 5, 8, 11, 14, 0],
              fall: [[1, 2],[4, 5],[7, 8],[10, 11],[13, 14]],
              remain: [0, 6, 13, 20, 27],
            };

      const maybeNoMoreThan12Chars = (proxy) => {
        if (!user.config.get('12 character limit')) {
          return;
        }
        shared.noMoreThan12Chars(proxy);
      }

      ー({
        name: 'Text',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.text,
        onClick: (proxy, idx) => {
          util.attention(ref.addItem.slice(-3), idx - 2, 'click');
          util.attention([proxy], 0, 'focus');
        },
        onFocusout: [
          shared.trim,
          shared.removeQuotes,
        ],
        onInteract: [
          shared.checkCapitals,
          shared.noMoreThan25Chars,
          maybeNoMoreThan12Chars,
          shared.noDuplicateValues,
          shared.noDuplicateVerbs,
          shared.noForbiddenPhrase,
        ],
        onKeydown_CtrlShiftAltArrowLeft: swapLeft,
        onKeydown_CtrlShiftAltArrowRight: swapRight,
        onKeydown_CtrlAltArrowLeft: moveLeft,
        onKeydown_CtrlAltArrowRight: moveRight,
        onKeydown_CtrlDelete: deleteItem,
        onLoad: [
          shared.trim,
          shared.checkCapitals,
          shared.noMoreThan25Chars,
          maybeNoMoreThan12Chars,
          shared.noDuplicateValues,
          shared.noDuplicateVerbs,
          shared.noForbiddenPhrase,
        ],
        ref: 'textAreas',
      });

      ー({
        name: 'Link',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.link,
        onFocusout: [
          shared.requireUrl,
          shared.removeScreenshot,
        ],
        onKeydown_CtrlAlt: moveFocusToText,
        onLoad: [
          shared.disableSpellcheck,
          shared.keepAlive,
        ],
        onPaste: [
          shared.requireUrl,
          shared.removeBannedDomains,
          shared.removeScreenshot,
        ],
        ref: 'linkAreas',
      });
      
      if (shared.is.analystTask()) {
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
          onLoad: shared.disableSpellcheck,
          onPaste: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          ref: 'screenshots',
        });

      } else {
        ー({
          name: 'Screenshot',
          rootSelect: '.extraction-screenshots',
          select: 'textarea',
          pick: [0, 1, 2, 3, 4],
          onFocusout: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          onKeydown_CtrlAlt: moveFocusToText,
          onLoad: shared.disableSpellcheck,
          onPaste: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          ref: 'screenshots',
        });
      }

      ー({
        name: 'Dashes',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.dashes,
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.tabOrder.remove,
          shared.disableSpellcheck,
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
        name: 'Extraction Page Url',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [0],
        onKeydown_CtrlAltArrowRight: [
          () => util.attention(ref.editButton, 0, 'click'),
          () => focusItem(1),
        ],
        onLoad: [
          shared.prefill,
          shared.removeScreenshot,
          shared.requireUrl,
        ],
        ref: 'extractionPage',
      });

      ー({
        name: 'LinksAndLP',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.linkLP,
        onInteract: [
          shared.noDomainMismatch,
          shared.noDuplicateValues,
        ],
        onLoad: [
          shared.noDomainMismatch,
          shared.noDuplicateValues,
        ],
        onPaste: [
          shared.noDomainMismatch,
          shared.noDuplicateValues,
        ],
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
          () => util.attention(ref.finalCommentBox, 0, 'focus'),
        ],
        onPaste: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        ref: 'invalidScreenshot',
      });

      ー({
        name: 'Creative',
        rootSelect: '.context-item',
        rootNumber: [2],
        select: '*',
        pick: [3, 6, 8],
        onLoad: [
          checkEmptyCreative,
          checkDomainMismatch,
        ],
        ref: 'creative',
      });

      for (let pair of innocuousTerm.fall) {
        ー({
          name: 'Fall',
          rootSelect: '#extraction-editing',
          select: 'textarea',
          pick: pair,
          onPaste: shared.fallThrough,
        });
      }

      for (let rootNumber of innocuousTerm.remain) {
        ー({
          name: 'Remaining',
          rootSelect: '.extraction-item table',
          rootNumber,
          select: 'div, textarea',
          pick: [2, 3],
          onChange: shared.updateCharacterCount,
          onFocusin: shared.updateCharacterCount,
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
        onKeydown_CtrlAltArrowRight: () => {
          util.attention(ref.addDataButton, 0, 'click');
          focusItem(1);
        },
        ref: 'addDataButton',
      });

      ー({
        name: 'Edit',
        rootSelect: '.extraction',
        select: 'label',
        withText: 'Edit',
        onKeydown_CtrlAltArrowRight: () => {
          util.attention(ref.editButton, 0, 'click');
          focusItem(1);
        },
        onLoad: shared.tabOrder.add,
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
        rootSelect: '.primaryContent',
        rootNumber: 3,
        select: 'label',
        pick: [0, 1],
        ref: 'approvalButtons',
      });

      ー({
        name: 'Comment Box',
        rootSelect: '.addComments',
        select: 'textarea',
        pick: [0],
        onFocusout: util.delay(start, 200),
        onKeydown_CtrlAltArrowRight: () => focusItem(1),
        ref: 'finalCommentBox',
      });

      ー({
        name: 'CanOrCannotExtract',
        select: 'label',
        pick: [0, 1],
        onKeydown_CtrlAltArrowRight: () => focusItem(1),
        ref: 'canOrCannotExtractButtons',
      });
      
      ー({
        name: 'Visit LP',
        select: '.lpButton button',
        pick: [0],
        css: {
          opacity: 1,
          cursor: 'pointer',
        },
      });
      
      function manualSubmitWarning() {
        alert('Please use the Submit Hotkey instead of clicking manually.')
      };
      manualSubmitWarning = util.debounce(manualSubmitWarning, 4000);

      ー({
        name: 'SubmitButton',
        select: '.submitTaskButton',
        pick: [0],
        css: {
          backgroundColor: '#643495',
          cursor: 'not-allowed',
          opacity: 0.5,
        },
        onFocusin: manualSubmitWarning,
        ref: 'submitButton',
      });

      ー({
        name: 'Skip Button',
        select: '.taskIssueButton',
        pick: [0],
        ref: 'skipButton'
      });

      ー({
        name: 'Task Title',
        select: '.taskTitle',
        ref: 'taskTitle'
      });

      ー({
        name: 'Save',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [0, 1, 2, 5, 6, 9, 10, 13, 14, 17, 18],
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

      const statusReactions = {
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
        onKeydown_CtrlShiftAltDigit0: setStatus('canExtract'),
        onKeydown_CtrlShiftAltDigit1: setStatus('other'),
        onKeydown_CtrlShiftAltDigit2: setStatus('urlsUnchanged'),
        onKeydown_CtrlShiftAltDigit3: setStatus('urlMismatch'),
        onKeydown_CtrlShiftAltDigit4: setStatus('emptyCreative'),
      };
      
      const experimentalEscapeApprove = () => {
        if (user.config.get('use escape-key to approve')) {
          approve();
        }
      };
      
      const experimentalSubmit = () => {
        if (user.config.get('use escape-key to approve')) {
          submit();
        }
      };
      
      const nordicLayout = {
        onKeydown_CtrlAltBracketLeft: shared.resetCounter,
        onKeydown_CtrlAltBracketRight: shared.skipTask,
        onKeydown_Backslash: approve,
        onKeydown_Escape: experimentalEscapeApprove,
      };
      
      const submitKeys = {
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlAltEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onKeydown_CtrlShiftEscape: experimentalSubmit,
      };
      
      const logIds = () => {
        console.log('Entries');
        const entries = user.log.raw({type: 'notice', items: 100});
        console.log(JSON.stringify(entries));
      };

      eventReactions.setGlobal({
        onKeydown_Backquote: beginTask,
        onKeydown_CtrlAltBackquote: beginTask,
        
        onKeydown_NumpadSubtract: shared.skipTask,
        onKeydown_NumpadAdd: approve,
        
        onKeydown_CtrlShiftDelete: deleteAllItems,
        
        onKeydown_CtrlBackquote: main,
        onKeydown_CtrlAltP: logIds,
        ...statusReactions,
        ...nordicLayout,
        ...submitKeys,
      });
    }

    return {init};
  })();
  
  const as = (function asModule() {
    function init() {
      creativeValidation();
      /*
       * @todo Add Approve/Submit Hotkey.
       * @todo Add Hotkeys mapping to 'issues'.
       * @todo Add support for the 3 other sub-flows.
       */
    }
    
    function creativeValidation() {
      ー({
        name: 'Visit LP',
        select: '.lpButton button',
        pick: [0],
        ref: 'visitLPButton',
      });
      
      ー({
        name: 'Provided Creatives',
        select: '#provided-creatives',
        pick: [0],
        ref: 'creatives',
      });
      
      function start() {
        util.attention(ref.visitLPButton, 0, 'click');
        util.attention(ref.creatives, 0, 'scrollIntoView');
      }
      
      function approve() {
        console.log('approve');
      }
      
      function submit() {
        console.log('submit');
      }
      
      eventReactions.setGlobal({
        onKeydown_Backquote: start,
        onKeydown_Backslash: approve,
        onKeydown_CtrlEnter: submit,
      });
    }
    return {init};
  })();
  
  const unsupported = (function unsupportedModule() {
    function init() {
      shared.guiUpdate('Unsupported flow');

      (function addStylesheet () {
        const style = document.createElement('style');
        document.head.append(style);
        const addRule = (p) => style.sheet.insertRule(p, 0);
        const rules = [
          `.lpButton button { opacity: 1 }`,
          `.lpButton button { cursor: pointer }`,
          `.submitTaskButton { opacity: 1 }`,
        ];
        rules.forEach(addRule);
      })();
    }
    return {init};
  })();

  return {
    home,
    labels,
    sl,
    as,
    unsupported,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// APP module

function main() {
  util.dispatch('issueUpdate', {issueType: 'reset'});
  eventReactions.reset();
  
  const detectedFlowName = environment.flowName();
  if (!detectedFlowName) {
    shared.guiUpdate('No flow');
    return false;
  }

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
    await util.retry(main, 60, 300)();
  } catch (e) {
    const warning = 'No workflow identified';
    shared.guiUpdate(warning);
    user.log.warn(warning);
  }
})();
undefined;
