////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// ASYNC TEST module

var atest = (function testModule() {
  const RUN_UNSAFE_TESTS = false;
  const promises = [];
  let ts;

  function group(groupName, functions, unsafe) {
    if (unsafe && !RUN_UNSAFE_TESTS) {
      return;
    }
    for (let func in functions) {
      if (typeof functions[func] !== 'function') {
        throw new TypeError('Atest requires an object with function values.')
      }
    }
    clearTimeout(ts);
    ts = setTimeout(run, 100);
    for (let unitName in functions) {
      if (unitName === 'before' || unitName === 'after') {
        continue;
      }
      const promise = (async () => {
        const fromBefore = functions.before && await functions.before();
        const success = await functions[unitName](fromBefore);
        functions.after && await functions.after(fromBefore);
        return {groupName, unitName, success};
      })();
      promises.push(promise);
    }
  }


  function throws(func, type = Error) {
    try {
      func();
    } catch (e) {
      return (e instanceof type);
    }
    return false;
  }

  function todo() {
  }

  async function run() {
    let testcount = 0;
    const results = await Promise.all(promises);
    const failGroups = results.filter(r => !r.success).map(r => r.groupName);
    for (let result of results) {
      testcount++;
      if (!failGroups.includes(result.groupName)) {
        continue;
      }
      console.log(
        `%c${result.groupName}/${result.unitName} ${result.success ? 'OK' : 'FAIL'}`,
        `color: ${result.success ? 'darkgreen' : 'darkred'}`
      )
    }
    const failures = failGroups.length;
    const successes = testcount - failures;
    console.log(
      `%c${testcount} tests, ${successes} successes, ${failures} failures.`,
      'color: darkblue',
    );
  }
  return {
    group,
    throws,
    todo,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// UTILITY module

var util = (function utilityModule() {
  'use strict';

  /**
   * @fileoverview Exports utility functions.
   */

  const DEFAULT_DELAY = 15; // milliseconds
  const DEFAULT_RETRIES = 20;
  const DEFAULT_SPACES = 4; // for bulletedList

  /**
   * Return any input in the form of an array.
   *
   * @param {*|*[]} input
   * @return {*[]}
   */
  function alwaysArray(input) {
    if (Array.isArray(input)) {
      return [...input];
    }
    return [input];
  }
  atest.group('alwaysArray', {
    '5 becomes an array': () => Array.isArray(alwaysArray(5)),
    '5 becomes [5]': () => alwaysArray(5)[0] === 5,
    '[5] remains an array': () => Array.isArray(alwaysArray([5])),
    '[5] remains [5]': () => alwaysArray([5])[0] === 5,
  });
  
  /**
   * Helper to move focus to, click on, or scroll to a proxy.
   *
   * @param {(Object|Object[])} on - A proxy or an array of proxies.
   * @param {number} n - The number of the proxy on which to act.
   * @param {string|string[]} actions - A string or an Array of strings
   * describing the actions to take.
   * @example: attention(buttons, 0, 'click'); // => Clicks on the first button.
   * @throws {TypeError} When n is not a number.
   */
  function attention(on, n = 0, actions) {
    if (typeof n !== 'number') {
      throw new TypeError('Attention expects a number, not ' + n);
    }
    if (Array.isArray(on)) {
      on = on[n];
    }
    if (!on || !on.click) {
      return;
    }
    if (actions.includes('click')) {
      on.click();
    }
    if (actions.includes('focus')) {
      on.focus();
    }
    if (actions.includes('scrollIntoView')) {
      on.scrollIntoView();
    }
  }
  atest.group('attention', {
    'Simple click': () => {
      let clicked = false;
      const el = {
        click() { clicked = true },
      };
      attention([el], 0, 'click');
      return clicked;
    },
    'Focus and scroll': () => {
      let clicked = false;
      let focused = false;
      let scrolled = false;
      const el = {
        click() { clicked = true },
        focus() { focused = true },
        scrollIntoView() { scrolled = true },
      };
      attention([el], 0, 'focus, scrollIntoView');
      return focused && scrolled;
    },
    'Fails silently': () => attention([], 1, 'click') === undefined,
    'Throws': () => atest.throws(() => attention([], 'click')),
  });

  /**
   * Play a short beep.
   */
  async function beep() {
    const audioFile = new Audio(
    'data:audio/wav;base64,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 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
    );
    audioFile.play();
  }
  beep = debounce(beep, 4000);

  /**
   * Call several functions with a single function call.
   *
   * @param {...function} functions - Functions to be bundled into a single
   * callable function.
   * @return {function} Calling this function calls all bundled function.
   */
  function bundle(...functions) {
    for (let func of functions) {
      if (typeof func !== 'function') {
        throw new TypeError(
          `'${func}' (${func.name || 'unnamed'}) is not a function. Bundled:` +
          bulletedList(functions)
        );
      }
    }
    /**
     * @param {...params}
     */
    function bundled(...params) {
      for (let func of functions) {
        try {
          func(...params);
        } catch (e) {
          throw new Error(
            `Bundle threw an Error (${e.message}) in ${func}. ` +
            `Bundled: ${bulletedList(functions)}`
          );
        }
      }
    }
    return bundled;
  }
  atest.group('bundle', {
    'Three bundled functions': () => {
      let count = 0;
      const func1 = () => count++;
      const func2 = () => count++;
      const func3 = () => count++;
      bundle(func1, func2, func3)();
      return count === 3;
    },
    'Requires functions': () => atest.throws(() => bundle(4,3)()),
    'Catches errors in functions': () => {
      return atest.throws(() => {
        bundle(
          () => { throw new Error() },
        )();
      });
    }
  });

  /**
   * Map an Object's keys, or an Array's values to a string, with a new line
   * for each element, and an asterisk in front of each item.
   * For function elements or function values, the function name and a
   * string description of the function is printed.
   *
   * @param {Array|Object} arrOrObj - Array or Object
   * @param {number=} spaces - The number of spaces to precede each item.
   * @return {string}
   * @example:
   * bulletedList(['One', 'Two']) // =>
   *     * One
   *     * Two
   */
  function bulletedList(input, spaces = DEFAULT_SPACES) {
    if (typeof input !== 'object') {
      throw new TypeError('Requires an Object or Array');
    }
    const spacer = (star) => {
      return ' '.repeat(spaces) + ((star) ? '* ' : '  ');
    }
    const toArray = (obj) => {
      const elToString = (entry) => `${entry[0]}: ${toString(entry[1])}`
      return Object.entries(input).map(elToString);
    }
    function toString(entry) {
      if (typeof entry === 'function') {
        const string = entry.toString().slice(0,50).replace(/(\n|\s+)/g, ' ');
        return (entry.name)
            ? `${entry.name}\n${spacer()}${string}`
            : string;
      }
      return entry;
    }
    const array = (Array.isArray(input)) ? input : toArray(input);
    return '\n' + spacer(true) + array.map(toString).join('\n' + spacer(true));
  }
  atest.group('bulletedList', {
    'Simple array': () => bulletedList([1,2,3]) === '\n    * 1\n    * 2\n    * 3',
    'Simple object': () => {
      return bulletedList({namedKey: 1}) === `\n    * namedKey: 1`;
    },
    'Unnamed function': () => {
      const string = `\n    * () => { 'body of function'}`;
      return bulletedList([() => { 'body of function'}]) === string;
    },
    'Named function': () => {
      const namedFunction = () => { 'body of function'};
      const string = `\n    * namedFunction\n      () => { 'body of function'}`;
      return bulletedList([namedFunction]) === string;
    },
    'Object with functions': () => {
      const string = `\n    * namedKey: namedKey\n      () => { 'body of function'}`;
      return bulletedList({namedKey: () => { 'body of function'}}) === string;
    },
  });

  /**
   * Add capitalisation to a string.
   */
  var cap = (function() {
    const oneWord = (string) => string.replace(/^./, c => c.toUpperCase());
    const eachWord = (string) => string.replace(/\w+/g, oneWord);
    const camelCase = (string) => {
      return cap.eachWord(string.toLowerCase()).replace(/\s+/, '');
    };
    return {
      camelCase,
      eachWord,
      firstLetter: oneWord,
    }
  })();
  atest.group('cap', {
    'First letter': () => cap.firstLetter('abc abc') === 'Abc abc',
    'Each word': () => cap.eachWord('abc abc') === 'Abc Abc',
    '1 number': () => cap.firstLetter('1 number') === '1 number',
    '2number': () => cap.firstLetter('2number') === '2number',
    'Japanese': () => cap.eachWord('お問い合わせ') === 'お問い合わせ',
  });

  /**
   * Debounce function calls.
   *
   * @param {function} func - Function to be debounced.
   * @param {number} delay - Delay in milliseconds.
   */
  function debounce(func, delay = DEFAULT_DELAY) {
    let timer = false;
    /**
     * @param {...*} params - Params passed to the debounced function are
     * passed to the wrapped function when it is called.
     * @return {*} The debounced function returns whatever the wrapped
     * function returns.
     */
    function debounced(...params) {
      if (!timer) {
        timer = true;
        wait(delay).then(() => timer = false);
        return func(...params);
      }
    }
    return debounced;
  }
  atest.group('debounce', {
    'Runs only once if called twice quickly': async () => {
      let count = 0;
      const func = () => count++;
      const funcDebounced = debounce(func, 10);
      funcDebounced();
      funcDebounced();
      return count === 1;
    },
    'Runs twice if called with delay': async () => {
      let count = 0;
      const func = () => count++;
      const funcDebounced = debounce(func, 10);
      funcDebounced();
      await wait(20);
      funcDebounced();
      return count === 2;
    },
    'Delay is set': () => DEFAULT_DELAY !== undefined,
  });

  /**
   * Returns a function that will run the input function with a delay.
   *
   * @param {function} func - The function to be decorated.
   * @param {number} ms - The delay in milliseconds.
   * @return {function}
   */
  function delay(func, ms = DEFAULT_DELAY) {
    async function delayed(...params) {
      await wait(ms);
      return func(...params);
    }
    return delayed;
  }
  atest.group('delay', {
    'Effect delayed': async () => {
      let count = 0;
      let increment = () => count++;
      increment = delay(increment);
      increment();
      const unaffectedCount = count;
      await wait();
      const affectedCount = count;
      return unaffectedCount === 0 && affectedCount === 1;
    },
  });

  /**
   * Dispatch events.
   *
   * @param {string} types - Comma separated string of event types.
   * E.g. 'keydown', 'guiUpdate' or 'blur, change, input'.
   * @param {Object} o
   * @param {Object=} o.detail - Optional payload.
   * @param {(HTMLElement|HTMLDocument)=} o.target - The element emitting
   * the event.
   */
  function dispatch(types, detail, target = document) {
    types.split(/, ?/).forEach(type => {
      const event = (detail)
          ? new CustomEvent(type, {detail}, {bubbles: true})
          : new Event(type, {bubbles: true});
      target.dispatchEvent(event);
    });
  }
  atest.todo();

  /**
   * Map a url to its domain.
   *
   * @param {string} url
   * @return {string}
   */
  function getDomain(url) {
    if (url === '') {
      return '';
    }
    if (!/^https?:\//.test(url)) {
      return '';
    }
    const domain = url.match(/\/\/([^\/]*)/);
    if (!domain) {
      return '';
    }
    return domain[1];
  }
  atest.group('getDomain', {
    'https://example.com':
        () => getDomain('https://example.com') === 'example.com',
    'https://www.example.com':
        () => getDomain('https://www.example.com') === 'www.example.com',
    'https://www.example.com/test.html':
        () => getDomain('https://www.example.com/test.html') === 'www.example.com',
    'Not a url':
        () => getDomain('Not a url') === '',
  });

  /**
   * Return true when code is running in dev mode (in a local file).
   *
   * @return {boolean} Is the code running locally?
   */
  function isDev() {
    return /^file/.test(window.location.href);
  }

  /**
   * Test whether an object is an HTMLElement or HTMLDocument.
   *
   * @param {Object=} HTMLElement - Object to be tested
   * @return {boolean} Returns true if an HTMLElement or HTMLDocument is
   * passed in.
   */
  function isHTMLElement(htmlElement) {
    return (
      htmlElement instanceof HTMLElement ||
      htmlElement instanceof HTMLDocument
    );
  }
  atest.group('isHTMLElement', {
    'An object: false': () => isHTMLElement({}) === false,
    'The document: true': () => isHTMLElement(document) === true,
    'Document body: true': () => isHTMLElement(document.body) === true,
  });
  
  /**
   * Returns an async function that will run the input function
   * repeatedly, until it returns a truthy value.
   *
   * @param {function} func - The function to be decorated.
   * @param {number} retries - The number of times to run the function.
   * @param {number} ms - The delay between iterations in milliseconds.
   * @param {boolean} suppressError - Should an error be thfown if the
   * function never returned a truthy value?
   * @return {Promise} A Promise which will return the result of the function
   * if it ran succesfully, or throw an Error otherwise.
   * @throws {Error} If the function never succeeds and suppressError is not
   * true.
   */
  function retry(
    func,
    retries = DEFAULT_RETRIES,
    delay = DEFAULT_DELAY,
    suppressError
  ) {
    let attempts = 0;
    async function retrying(...params) {
      while (attempts++ < retries) {
        await wait(delay);
        const ret = func(...params);
        if (ret) {
          return ret;
        }
      }
      if (suppressError) {
        return false;
      }
      throw new Error(
        `Failed. Ran ${func.name || 'unnamed function'} ${retries} times`
      );
    }
    return retrying;
  }
  atest.group('retry', {
    'Test 1': async () => {
      let count = 0;
      let willFailInitially = () => count++ > 10;
      willFailInitially = retry(willFailInitially, 12, 0);
      return willFailInitially();
    },
    'Test 2': async () => {
      let count = 0;
      let willFailInitially = () => count++ > 10;
      willFailInitially = retry(willFailInitially, 5, 0);
      let error;
      await willFailInitially().catch((e) => error = e);
      return !!error;
    },
  });
  
  /**
   * Swap the values of two proxies.
   *
   * @param {Object} one - Proxy
   * @param {Object} two - Proxy
   */
  function swapValues(one, two) {
    [one.value, two.value] = [two.value, one.value];
  }
  atest.group('swapValues', {
    'Simple swap': () => {
      const one = {value: 'one'};
      const two = {value: 'two'};
      swapValues(one, two);
      return one.value === 'two' && two.value === 'one';
    },
  });

  /**
   * The inverse of calling toString on a RegExp.
   * Transforms a string of the format '/abc/i' to a RegExp.
   *
   * @param {string}
   * @return {RegExp}
   */
  const toRegex = (string)=> {
    try {
      const [,regex,flags] = string.match(/\/(.+)\/([gimuy]*)/);
      return RegExp(regex, flags);
    } catch (e) {
      console.debug('Cannot make RegExp from ' + string);
      return;
    }
  }
  atest.group('toRegex', {
    'Simple': () => toRegex('/abc/gi').toString() === '/abc/gi',
    'Complex': () => toRegex('/^\d?[a-c]+/g').toString() === '/^d?[a-c]+/g',
    'Malformed string': () => toRegex('abc/gi') === undefined,
  })

  /**
   * Wraps typeof but returns 'array' for Array input, and undefined
   * for undefined input.
   *
   * @param {*} input
   * @return {string}
   */
  function typeOf(input) {
    if (Array.isArray(input)) {
      return 'array';
    }
    const type = typeof input
    return (type === 'undefined') ? undefined : type;
  }
  atest.group('typeOf', {
    'undefined': () => typeOf(undefined) === undefined,
    'number': () => typeOf(5) === 'number',
    'array': () => typeOf([]) === 'array',
    'object': () => typeOf({}) === 'object',
    'function': () => typeOf(() => {}) === 'function',
  })

  /**
   * Returns a promise that will resolve after a delay.
   *
   * @param {number=} ms - Time to wait before continuing, in milliseconds
   * @return {Promise} Promise which will resolve automatically.
   */
  function wait(ms = DEFAULT_DELAY) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }
  atest.group('wait', {
    'Wait': async () => {
      let count = 0;
      let ms = 10;
      setTimeout(() => count++, ms);
      const unaffectedCount = count;
      await wait(2 * ms);
      const affectedCount = count;
      return unaffectedCount === 0 && affectedCount === 1;
    },
    'DEFAULT': () => DEFAULT_DELAY !== undefined,
  });

  return {
    alwaysArray,
    attention,
    beep,
    bundle,
    bulletedList,
    cap,
    debounce,
    delay,
    dispatch,
    getDomain,
    isDev,
    isHTMLElement,
    retry,
    swapValues,
    toRegex,
    typeOf,
    wait,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// USER DATA module

var user = (function userDataModule() {
  'use strict';

  /**
   * @fileoverview Exposes stateful objects to keep track of things.
   * * config - manage configuration settings.
   * * counter - count things.
   * * log - log things.
   * * storeAccess - access to data storage.
   */

  const LOCALSTORE_BASENAME = 'twoTwentyOne';

  const CONFIG_STORE_NAME = 'Configuration';
  const DEFAULT_SETTINGS = {};

  const COUNTER_STORE_NAME = 'Counter';

  const LOGBOOK_STORE_NAME = 'LogBook';
  const LOG_MAX_LENGTH = 5000; // entries
  const LOG_ENTRY_MAX_LENGTH = 250; // characters per log entry
  const LOG_PAGE_SIZE = 25; // entries per page
  const NO_COLOR_FOUND = 'yellow'; //
  const TIMESTAMP_STYLE = 'color: grey';
  const LOG_TYPES = {
    log: 'black',
    notice: 'DodgerBlue',
    warn: 'OrangeRed',
    ok: 'LimeGreen',
    low: 'Gainsboro',
    changeValue: 'LightPink',
    config: 'MediumOrchid',
    counter: 'DarkCyan',
  };

  /**
   * Manage dynamic data stores.
   * Note: Data was originally stored as JSON.
   */
  const storeAccess = (function storesMiniModule() {

    const cached = (function chromeLocalModule() {
      let storeCache = {};
      
      function populateCacheFromChromeStorage() {
        chrome.storage.local.get(null, (result) => {
          storeCache = result;
        });
      }
      populateCacheFromChromeStorage();
      document.addEventListener('cache', populateCacheFromChromeStorage);
      
      const warnToRefresh = util.debounce(() => alert(`TwoTwenty has updated. Please refresh EWOQ.`), 5000);
      
      async function destroyStore(storeName) {
        if (!storeCache.hasOwnProperty(storeName)) {
          throw new TypeError('Cannot find store to destroy');
        }
        delete storeCache[storeName];
        chrome.storage.local.remove([storeName]);
      }
      function getStore(storeName) {
        if (storeCache.hasOwnProperty(storeName)) {
          return storeCache[storeName];
        }
      }
      async function setStore(storeName, data) {
        if (!storeName) {
          throw new TypeError('Cannot create nameless store');
        }
        if (typeof data !== 'object') {
          throw new TypeError('Data should be an object, not ' + typeof data);
        }
        storeCache[storeName] = data;
        console.debug({[storeName]: data});
        try {
          await chrome.storage.local.set({[storeName]: data});
        } catch (e) {
          if (e.message.includes('/Invocation of form')) {
            console.debug('Expected Error: Invocation of form', e);
          } else if (e.message.includes(`Cannot read property 'local'`)) {
            warnToRefresh();
          } else {
            console.debug('Weird Error', e);
          }
        }
      }
      return {
        destroyStore,
        getStore,
        setStore,
      }
    })();

    /**
     * Add a data element to an Array data store.
     * If no locale is specified, element is added to a store that
     * is shared accross locales.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {(Object|Array|string|number)} o.add The element to add.
     */
    function addElement({feature, locale = '', add}) {
      if (!feature) {
        throw new TypeError('Cannot add element to nameless store.');
      }
      const data = cached.getStore(`${feature}${locale}`) || [];
      if (!Array.isArray(data)) {
        throw new TypeError('Cannot add element to Array store. Use set/value.');
      }
      data.push(add);
      cached.setStore(`${feature}${locale}`, data);
    }
    
    /**
     * Set or replace all data for a specific feature, and optionally a
     * specific locale. If no locale is specified, data will be added
     * to a feature specific shared data store.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {*} o.data
     */
    function createStore({feature, locale, data}) {
      if (!feature) {
        throw new TypeError('Cannot set data to nameless store.');
      }
      try {
        data = JSON.parse(data);
        console.debug('CreateStore received this JSON: ', data);
      } catch (e) {
      }
      if (locale) {
        const sharedType = util.typeOf(cached.getStore(`${feature}`));
        const dataType = util.typeOf(data);
        if (sharedType && sharedType !== dataType) {
          throw new TypeError('Cannot create store. Array/Object mismatch.');
        }
      }
      cached.setStore(`${feature}${locale}`, data);
    }
    
    /**
     * Set or replace all data for a specific feature, and optionally a
     * specific locale. If no locale is specified, data will be added
     * to a feature specific shared data store.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {boolean} o.destroy - Should the store be destroyed?
     */
    function destroyStore({feature, locale, destroy}) {
      if (!feature) {
        throw new TypeError('Cannot destroy nameless store.');
      }
      const store = cached.getStore(`${feature}${locale}`);
      if (!store) {
        throw new Error('Cannot find store to destroy.');
      }
      cached.destroyStore(`${feature}${locale}`);
    }

    /**
     * Get a data store for a specific feature.
     * If no locale is specified, a shared store is returned. If a
     * locale is specified, a merged store containing shared and locale
     * specific data is returned.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale - Not all stores are locale specific
     * @return {Object} The store for non-locale specific stores, or
     * an object containing a store for the specified locale and a shared
     * store.
     */
    function dumpStore({feature, locale}) {
      const sharedStore = cached.getStore(`${feature}`);
      const localeStore = cached.getStore(`${feature}${locale}`);

      if (!locale) {
        return sharedStore;
      }
      const sharedType = util.typeOf(sharedStore);
      const localeType = util.typeOf(localeStore);
      if (sharedType && localeType && sharedType !== localeType) {
        throw new TypeError('Mismatch Object/Array.');
      }

      if (localeType === 'array') {
        return [...(sharedStore || []), ...localeStore];
      } else if (localeType === 'object') {
        return {...(sharedStore || {}), ...localeStore};
      }
      return sharedStore;
    }
    
    /**
     * Get an entry from a specific data store.
     * If a locale is specified, entries from the matching locale specific
     * store are prioritized. If no locale specific entry is found, the
     * shared store is checked.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {string} o.get
     * @return {(Object|Array|string|number|undefined)}
     */
    function getValue({feature, locale = '', get}) {
      const oneLocale = cached.getStore(`${feature}${locale}`);
      if (oneLocale && oneLocale.hasOwnProperty(get)) {
        return oneLocale[get];
      }
      const allLocales = cached.getStore(`${feature}`);
      if (allLocales && allLocales.hasOwnProperty(get)) {
        return allLocales[get];
      }
    }

    /**
     * Remove an entry in a specific data store.
     * If a locale is specified, the entries is removed from the locale
     * specific store. If no locale is specified, the entry is removed
     * from a store that is shared accross locales.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {Object} o.remove - Key to be deleted from the store.
     */
    function removeValue({feature, locale = '', remove}) {
      if (!feature) {
        throw new TypeError('Cannot set data to nameless store.');
      }
      const data = cached.getStore(`${feature}${locale}`) || {};
      delete data[remove];
      cached.setStore(`${feature}${locale}`, data);
    }

    /**
     * Set an entry in a specific data store.
     * If a locale is specified, the entries is added to the locale
     * specific store. If no locale is specified, the entry is added
     * to a store that is shared accross locales.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {Object} o.set - Object to be merged into the store.
     */
    function setValue({feature, locale = '', set}) {
      if (!feature) {
        throw new TypeError('Cannot set data to nameless store.');
      }
      if (typeof set !== 'object') {
        throw new TypeError('Set requires an object.');
      }
      const data = cached.getStore(`${feature}${locale}`) || {};
      const newData = {...data, ...set};
      cached.setStore(`${feature}${locale}`, newData);
    }

    /**
     * Get or set data entries, or dump or create data stores,
     * depending on the input parameters.
     *
     * @param {Object} o
     * @param {string} o.feature
     * @param {string=} o.locale
     * @param {string=} o.get
     * @param {string=} o.set
     * @param {*=} o.value
     * @param {string=} o.remove
     * @param {*=} o.data
     * @param {string=} o.destroy
     * @return {*}
     */
    function storeAccess({
      feature,
      locale = '',
      add,
      get,
      set,
      value,
      remove,
      data,
      destroy
    }) {
      if (typeof feature !== 'string') {
        throw new TypeError('Feature must be a text string');
      }
      if (typeof locale !== 'string') {
        throw new TypeError('Locale must be a text string');
      }
      if (add !== undefined) {
        return addElement({feature, locale, add});
      } else if (get !== undefined) {
        return getValue({feature, locale, get});
      } else if (set !== undefined) {
        return setValue({feature, locale, set, value});
      } else if (remove !== undefined) {
        return removeValue({feature, locale, remove});
      } else if (data !== undefined) {
        return createStore({feature, locale, data});
      } else if (destroy === true) {
        return destroyStore({feature, locale, destroy});
      } else {
        return dumpStore({feature, locale});
      }
    }
    atest.group('storeAccess', {
      'before': () => {
        return {
          objectStore: 'TestingObject',
          arrayStore: 'TestingArray',
          language: 'English',
          tokyo: 'Tokyo',
          lauren: 'Lauren Ipsum',
          yanny: 'Yanny Ipsum',
        }
      },
      'Return undefined for undefined stores': (o) => {
        return storeAccess({
          feature: o.objectStore,
        }) === undefined;
      },
      'Create an object store and get shared value': (o) => {
        storeAccess({
          feature: o.objectStore,
          data: {city: o.tokyo},
        });
        return storeAccess({
          feature: o.objectStore,
          locale: o.language,
          get: 'city',
        }) === o.tokyo;
      },
      'Set data and get value': (o) => {
        storeAccess({
          feature: o.objectStore,
          locale: o.language,
          data: {
            name: o.lauren,
          },
        });
        return storeAccess({
          feature: o.objectStore,
          locale: o.language,
          get: 'name',
        }) === o.lauren;
      },
      'Change value': (o) => {
        storeAccess({
          feature: o.objectStore,
          locale: o.language,
          data: {
            name: o.lauren,
          },
        });
        storeAccess({
          feature: o.objectStore,
          locale: o.language,
          set: {
            name: o.yanny
          },
        });
        return storeAccess({
          feature: o.objectStore,
          locale: o.language,
          get: 'name',
        }) === o.yanny;
      },
      'after': (o) => {
        const shared = storeAccess({
          feature: o.objectStore,
          locale: o.language,
        });
        const locale = storeAccess({
          feature: o.objectStore,
        });
        if (shared) {
          storeAccess({
            feature: o.objectStore,
            destroy: true,
          })
        }
        if (locale) {
          storeAccess({
            feature: o.objectStore,
            locale: o.language,
            destroy: true,
          })
        }
      },
    });
    return storeAccess;
  })();

  /**
   * Create a human readable string timestamp.
   *
   * @param {Date} d - A date to turn into a matching timestamp.
   * For today's Date, returns a short format (hh:mm)
   * For other Dates, returns a long format (MM/DD hh:mm:ss)
   * @return {string}
   */
  function timestamp(d = new Date()) {
    if (!(d instanceof Date)) {
      console.debug('Date', d);
      d = new Date();
    }
    /** Cast numbers into a zero prefixed two digit string format */
    const c = new Date();
    const cast = (/** number */n) /** string */ => ('0' + n).slice(-2);
    const sameDate = (c.getDate() - d.getDate() === 0);
    const sameMonth = (c.getMonth() - d.getMonth() === 0);
    const sameYear = (c.getFullYear() - d.getFullYear() === 0);
    const isTodaysDate = sameDate && sameMonth && sameYear;
    const month = cast(d.getMonth() + 1);
    const date = cast(d.getDate());
    const hrs = cast(d.getHours());
    const min = cast(d.getMinutes());
    const sec = cast(d.getSeconds());
    const longForm = `${month}/${date} ${hrs}:${min}:${sec}`;
    const shortForm = `${hrs}:${min}`;
    return (isTodaysDate) ? shortForm : longForm;
  }
  atest.group('timestamp', {
    'Without a parameter': () => {
      return timestamp().length === 5;
    },
    'Short length': () => {
      const today = new Date();
      return timestamp(today).length === 5;
    },
    'Long length': () => {
      const earlier = new Date('01-01-2019 12:34:56');
      return timestamp(earlier).length === 14;
    },
  });

  /**
   * Dispatch GUI update packets. The GUI module  is reponsible for
   * integrating packets into a consistent state.
   *
   * @param {Object} packet - A packet containing a state update to the GUI.
   * @example - updateGui({counters: {one: 21}});
   */
  function updateGui(packet) {
    util.dispatch('guiUpdate', packet);
  }

  /**
   * Track configuration settings. Settings are loaded from localStorage on
   * load, but changes are not saved by default.
   * #get(name) returns a value if a config setting is loaded, or undefined.
   * #set(name, newValue, save) adds a value to the config options in memory
   * and optionally updates the config options stored in localStorage.
   */
  const config = (function configMiniModule() {
    function getStore() {
      return storeAccess({
        feature: CONFIG_STORE_NAME,
      });
    }

    function get(name) {
      const allSettings = getStore();

      // @todo Remove
      if (!Array.isArray(allSettings)) {
        return allSettings && allSettings[name];
      }
      //

      const setting = allSettings.find((setting) => setting.name === name);
      if (!setting) {
        return;
      }
      return setting.value;
    }

    function set(name, newValue) {
      const allSettings = getStore();
      const currentSetting = get(name);
      const idx = allSettings.findIndex((setting) => setting.name === name);
      currentSetting.value = newValue;
      allSettings[idx] = currentSetting;
      storeAccess({
        feature: CONFIG_STORE_NAME,
        data: allSettings,
      });
    }
    return {
      get,
      set,
    };
  })();

  /**
   * Object with methods to create and manage counters.
   * #add(name) create a new counter or increments it if it already exists.
   * #get(name) returns the count of a named counter (or -1 if no such counter
   * exists).
   * #reset(=name) resets a named counter (or all counters if no name is
   * provided).
   */
  const counter = (function counterMiniModule() {
    /**
     * @return {Object<string: number>} - Maps names to counts.
     */
    function getStore() {
      return storeAccess({
        feature: COUNTER_STORE_NAME,
      }) || {};
    }

    /**
     * Add one to the count of an existing counter, or create a new counter
     * starting at 1.
     *
     * @param {string} name - Name of counter to be incremented or created.
     */
    function add(name) {
      if (typeof name !== 'string') {
        throw new TypeError('Counter add expects a name string');
      }
      const /** object */ allCounts = getStore();
      const /** number */ newCount = (allCounts[name] + 1) || 1;
      allCounts[name] = newCount;
      storeAccess({
        feature: COUNTER_STORE_NAME,
        data: allCounts,
      });
      updateGui({counters: allCounts});
      return newCount;
    }

    /**
     * @param {string=} name - Name of the counter to find.
     * @return {Object|number} If no name is provided, returns an object
     * containing all the counts. Otherwise, returns the count of the
     * counter, or -1 if the counter does not exist.
     */
    function get(name) {
      const allCounts = getStore();
      if (!name) {
        return {...allCounts};
      }
      return allCounts[name] || -1;
    }

    /**
     * @param {string=} name - Name of the counter to reset. If no name
     * is provided, all counters are reset.
     */
    function reset(name) {
      if (typeof name !== 'string' && name !== undefined) {
        throw new TypeError('Counter reset expects a name string or nothing');
      }
      const allCounts = getStore();
      if (name) {
        const currentCount = allCounts[name];
        util.wait().then(() => { // @todo Fix wait hack. Used for testing.
          user.log.counter(
            `Resetting counter ${name} from ${currentCount}`,
          );
        });
        delete allCounts[name];
      } else {
        user.log.counter(
          'Resetting all counters:' +
          util.bulletedList(allCounts),
        );
        for (let i in allCounts) {
          delete allCounts[i];
        }
      }
      storeAccess({
        feature: COUNTER_STORE_NAME,
        data: allCounts,
      });
      updateGui({counters: allCounts});
      return 0;
    }
    util.wait().then(() => updateGui({counters: getStore()}));
    return {
      add,
      get,
      reset,
    };
  })();
  atest.group('counter', {
    'before': () => 'aG9yc2ViYXR0ZXJ5c3RhYmxl',
    'Undefined counter': (name) => counter.get(name) === -1,
    'Initialised counter': (name) => counter.add(name) === 1,
    'Counter is counting': (name) => counter.add(name) === 2,
    'Counter is consistent': (name) => counter.get(name) === 2,
    'Reset returns 0': (name) => counter.reset(name) === 0,
    'Counter is gone': (name) => counter.get(name) === -1,
  }, true);

  /** Object[] */
  let flaggedIssues = [];

  /**
   * Issue tracker. Integrates updates into a consistent list of currently
   * unresolved issues.
   *
   * @param {Object} issueUpdate - Incoming message. This may refer to a new
   * issue, or update the status of a previous issue.
   * @param {Object} issueUpdate.proxy - HTMLElement proxy.
   * @param {string} issueUpdate.issueType - The type of issue.
   * @param {string} issueUpdate.issueLevel - How critical is this issue?
   * @param {string} issueUpdate.message - Describes the details of the issue.
   * @example
   * {proxy, issueType: 'Typo', issueLevel: 'high', message: 'Wrod misspelled'}
   */
  function flag(issueUpdate) {
    if (issueUpdate && issueUpdate.issueType === 'reset') {
      flaggedIssues.length = 0;
      updateGui({issues: flaggedIssues});
      return;
    }
    if (!issueUpdate || !issueUpdate.proxy || !issueUpdate.issueType) {
      throw new TypeError('Not a valid issue.');
    }
    /**
     * Filter function to remove issues that match the incoming issue.
     * Compares proxy type properties.
     *
     * @param {Object} issue
     */
    const removeMatching = (issue) => {
      const sameproxy = (issue.proxy === issueUpdate.proxy);
      const sameType = (issue.issueType === issueUpdate.issueType);
      return !(sameproxy && sameType);
    };
    /**
     * Filter out issues that without a issueLevel.
     *
     * @param {Object} issue
     */
    const removeOk = (issue => issue.issueLevel !== undefined);
    flaggedIssues = flaggedIssues.filter(removeMatching);
    flaggedIssues.push(issueUpdate);
    flaggedIssues = flaggedIssues.filter(removeOk);
    updateGui({issues: flaggedIssues});
  }
  atest.group('flag', {
    'Fail without an issue': () => atest.throws(() => flag()),
  });

  /**
   * Sets a listener on the document for issue updates.
   */
  function addissueUpdateListener() {
    document.addEventListener('issueUpdate', ({detail}) => {
      flag(detail);
    }, {passive: true});
  }
  addissueUpdateListener();

  /**
  * Object with methods to log events. The following is true for most
  * methods:
  * * @param {Object|string} payload
  * * @param {Object} o
  * * @param {boolean} o.save Should the event be saved to localstorage?
  * * @param {boolean} o.print Should the event be printed to the console?
  */
  const log = (function loggingModule() {

    /**
     * Generate a string from a log entry, in order to print to the console.
     *
     * @param {Object | string} payload - Data associated with the log entry.
     * @return {string}
     */
    function payloadToString(payload) {
      const string = (typeof payload === 'string')
          ? payload
          : JSON.stringify(payload);
      if (typeof payload !== 'string') {
        console.debug('payloadToString received object', payload);
      }
      return (string.length > LOG_ENTRY_MAX_LENGTH)
          ? (string.slice(0, LOG_ENTRY_MAX_LENGTH - 3) + '...')
          : string;
    }

    /**
     * Print a log entry to the console, with a timestamp.
     *
     * @param {string} type
     * @param {Object|string} payload
     * @time {Date=} Optionally, provide a Date for the timestamp.
     * @param {boolean} save - Is this entry being saved?
     */
    function printToConsole({type, payload, time = new Date(), save = true}) {
      const color = LOG_TYPES[type] || NO_COLOR_FOUND;
      const ts = timestamp(time);
      const string = payloadToString(payload)
          .replace(/\n/g, '\n' + ' '.repeat(ts.length + 1));
      console.log(
        `%c${ts}%c ${string}`,
        TIMESTAMP_STYLE,
        `color: ${color}`
      );
    }

    /**
     * Retrieve an array of all log entries. Timestamps are recast into Date
     * objects.
     *
     * @return {Object[]} Array of entries.
     */
    function getLogbook() {
      const logBook = storeAccess({
        feature: LOGBOOK_STORE_NAME,
      }) || [];
      // If the logbook is too long, cut it in half.
      if (logBook.length > LOG_MAX_LENGTH) {
        storeAccess({
          feature: LOGBOOK_STORE_NAME,
          data: logBook.slice(-LOG_MAX_LENGTH / 2),
        });
      }
      return logBook.map(entry => {
        const [timestamp, type, payload] = entry;
        const time = new Date(timestamp || 0);
        return {time, type, payload};
      });
    }

    /**
     * Get a filtered part of the persistent log as an array of entries.
     *
     * @param {Object=} filterBy - Filter parameters.
     * @return {Object[]}
     * @example - printPersistent({before: new Date('2019-01-17')});
     */
    function getEntries(filterBy = {}) {
      const filters = {
        after: entry => entry.time > new Date(filterBy.after),
        before: entry => entry.time < new Date(filterBy.before),
        contains: entry => new RegExp(filterBy.contains).test(entry.payload),
        items: entry => true,
        page: entry => true,
        regex: entry => filterBy.regex.test(entry.payload),
        type: entry => entry.type === filterBy.type,
        typeExclude: entry => entry.type !== filterBy.typeExclude,
      };
      let entries = getLogbook();
      for (let filterType in filterBy) {
        try {
          entries = entries.filter(filters[filterType]);
        } catch (e) {
          if (e instanceof TypeError) {
            user.log.warn(
              `'${filterType}' is not a valid log filter.\nPlease use:` +
              util.bulletedList(filters),
              {save: false},
            );
            return [];
          }
        }
      }
      const pageSize = filterBy.items || LOG_PAGE_SIZE;
      const page = (filterBy.page > 0) ? filterBy.page : 0;
      const start = pageSize * (page);
      const end = pageSize * (page + 1);
      entries = entries.slice(-end, -start || undefined);
      return entries;
    }
    atest.group('getEntries', {
      'Get a full page, if possible': () => {
        const entries = getEntries();
        const fullPage = entries.length === LOG_PAGE_SIZE;
        const logTooShort = getLogbook().length < LOG_PAGE_SIZE;
        return fullPage || logTooShort;
      }
    });

    /**
     * Print a filtered part of the persistent log.
     *
     * @param {Object=} filterBy Filter parameters.
     * @return {Object[]}
     * @example print({before: new Date()});
     */
    function print(filterBy = {}) {
      const entries = getEntries(filterBy);
      console.debug('LogEntries: ', entries);
      for (let entry of entries) {
        printToConsole(entry)
      }
    }

    /**
     * Generate a logging function.
     *
     * @param {string} type - Type of log.
     */
    function genericLog(type) {
      /**
       * @param {string|Object} payload
       * @param {Object} o - Options
       * @param {boolean} o.print
       * @param {boolean} o.save
       * @param {boolean} o.toast
       */
      function add(payload, {print = true, save = true, toast = true} = {}) {
        if (typeof payload === 'string' &&
            payload.length > LOG_ENTRY_MAX_LENGTH) {
          payload = payload.slice(0, LOG_ENTRY_MAX_LENGTH - 3) + '...';
        }
        if (print) {
          printToConsole({type, payload, save});
        }
        if (save) {
          storeAccess({
            feature: LOGBOOK_STORE_NAME,
            add: [new Date().toString(), type, payload],
          });
        }
        if (toast) {
          updateGui({toast: payload});
        }
      }
      return add;
    }
    const log = {
      print,
      raw: getEntries,
    }
    for (let type in LOG_TYPES) {
      log[type] = genericLog(type);
    }
    return log;
  })();

  return {
    config,
    counter,
    storeAccess,
    log,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENER module

var eventReactions = (function eventListenersModule() {
  'use strict';

  /**
   * @fileoverview Sets global event listeners, and exports
   * functions through which functions can be registered.
   * Reaction functions are registered to an HTMLElement and
   * a browser event, and are called when a matching browser
   * event is issued by the matching HTMLElement.
   * This basically emulates setting several event listeners
   * on each HTMLElement.
   */

  /**
   * string[] - The events that can be set on an HTMLElement.
   */
  const SUPPORTED_EVENTS = Object.freeze({
    'onChange': 'change',
    'onClick': 'click',
    'onFocusin': 'focusin',
    'onFocusout': 'focusout',
    'onInteract': 'interact',
    'onKeydown': 'keydown',
    'onInput': 'input',
    'onLoad': 'load',
    'onPaste': 'paste',
  });

  /**
   * string[] - The events that are triggered by the special
   * 'interact' event.
   */
  const INTERACT_EVENTS = Object.freeze([
    'onClick',
    'onInput',
    'onKeydown',
    'onPaste',
  ]);

  const PREVENT_DEFAULT_ON = Object.freeze([
    'Backquote',
    'Backslash',
    'NumpadAdd',
    'NumpadSubtract',
    'NumpadMultiply',
    'NumpadAdd',
    'CtrlEnter',
    'CtrlAltEnter',
    'CtrlNumpadEnter',
    'AltArrowLeft',
    'AltArrowRight',
    'CtrlAltEqual',
  ]);

  /**
   * reactionStore maps HTMLElements to sets of events. Each event maps to
   * an array of reactions. When a browser event is fired by the
   * HTMLElement all matching reactions are returned and called.
   * For example:
   * document.body => {
   *   click: [reaction, reaction],
   *   focusout: [reaction],
   * }
   */
  const reactionStore = (function () {
    const map = new Map();

    /**
     * Get all reaction functions for a given HTML element and an eventType
     * string.
     *
     * @param {Object} o
     * @param {HTMLElement} htmlElement
     * @param {string[]} eventTypes
     * @return {function[]}
     */
    function get({htmlElement, eventTypes}) {
      if (!map.has(htmlElement)) {
        return [];
      }
      if (!Array.isArray(eventTypes)) {
        throw new TypeError('Please provide an array of eventTypes');
      }
      const found = [];
      const reactions = map.get(htmlElement);
      for (let eventType of eventTypes) {
        if (reactions[eventType] !== undefined) {
          found.push(...reactions[eventType]);
        }
      }
      return found;
    }

    /**
     * Get all reaction functions for a given HTML element and an eventType
     * string.
     *
     * @param {Object} o
     * @param {HTMLElement} htmlElement
     * @param {string} eventType
     * @param {function[]}
     * @return {number} The new number of reaction functions now accociated
     * with this HTML element and eventType.
     */
    function set({htmlElement, eventType, functions}) {
      if (!util.isHTMLElement(htmlElement)) {
        throw new TypeError(htmlElement + ' is not an htmlElement');
      }
      if (!Array.isArray(functions)) {
        throw new TypeError('Please provide an array of functions');
      }
      const reactions = map.get(htmlElement) || {};
      const current = get({htmlElement, eventTypes: [eventType]});
      const funcs = [...current, ...functions];
      reactions[eventType] = funcs;
      map.set(htmlElement, reactions);
      return funcs.length;
    }

    function clear() {
      map.clear();
    }

    return {
      get,
      set,
      clear,
    }
  })();

  /**
   * Maps a browser event to a descriptive string, if possible.
   * @param {Event} event - Browser event
   * @return {string}
   * @example A keydown event could map to 'ctrl-c' or 'shift'.
   * 'ctrl-Control' or similar.
   */
  function eventToString(event) {
    if (!event) {
      return '';
    }
    switch (event.type) {
      case 'keydown':
        if (!event.code) { // i.e. synthetic event
          return '';
        }
        let string = '';
        if (event.ctrlKey || event.metaKey) {
          string += 'Ctrl';
        }
        if (event.shiftKey) {
          string += 'Shift';
        }
        if (event.altKey) {
          string += 'Alt';
        }
        if (![
          'ControlLeft', 'ControlRight',
          'ShiftLeft', 'ShiftRight',
          'AltLeft', 'AltRight',
          'MetaLeft', 'MetaRight',
        ].includes(event.code)) {
          string += event.code.replace('Key', '');
        }
        return string;
      default:
        return '';
    }
  }
  atest.group('eventToString', {
    'onKeydown': () => {
      return eventToString({
        type: 'keydown',
        code: 'KeyA',
      }) === 'A';
    },
    'onKeydown_CtrlA': () => {
      return eventToString({
        type: 'keydown',
        ctrlKey: true,
        code: 'KeyA',
      }) === 'CtrlA';
    },
    'onKeydown_CtrlShiftAltA': () => {
      return eventToString({
        type: 'keydown',
        shiftKey: true,
        ctrlKey: true,
        altKey: true,
        code: 'KeyA',
      }) === 'CtrlShiftAltA';
    },
    'onKeydown_CtrlShiftAltA': () => {
      return eventToString({
        type: 'keydown',
        ctrlKey: true,
        code: 'Enter',
      }) === 'CtrlEnter';
    },
    'onClick': () => {
      return eventToString({
        type: 'click',
      }) === '';
    },
  });

  /**
   * Maps a browser event to two descriptive strings, if possible.
   * @param {Event} event - Browser event
   * @return {string[]}
   * @example:
   * A click event may be converted to ['click', 'click_'].
   * @example:
   * A keydown event may be converted to ['keydown', 'keydown_CtrlA'].
   */
  function eventToEventTypes(event) {
    const eventString = eventToString(event);
    const type = 'on' + event.type.replace(/./,(d) => d.toUpperCase());
    const type_k = `${type}_${eventString}`;
    return [type, type_k];
  }
  atest.group('eventToEventTypes', {
    'onKeydown[0]': () => {
      return eventToEventTypes({
        type: 'keydown',
      })[0] === 'onKeydown';
    },
    'onKeydown_CtrlA[0]': () => {
      return eventToEventTypes({
        type: 'keydown',
        ctrlKey: true,
        code: 'KeyA',
      })[0] === 'onKeydown';
    },
    'onKeydown_CtrlA[1]': () => {
      return eventToEventTypes({
        type: 'keydown',
        ctrlKey: true,
        code: 'KeyA',
      })[1] === 'onKeydown_CtrlA';
    },
    'onKeydown_CtrlShiftAltA[1]': () => {
      return eventToEventTypes({
        type: 'keydown',
        shiftKey: true,
        ctrlKey: true,
        altKey: true,
        code: 'KeyA',
      })[1] === 'onKeydown_CtrlShiftAltA';
    },
  });

  /**
   * Run an array of functions without blocking.
   * @param {function[]} functions.
   */
  function runAll(...functions) {
    for (let func of functions) {
      if (typeof func === 'function') {
        util.wait().then(func);
      } else {
        throw new TypeError('Not a function.');
      }
    }
  }
  atest.group('runAll', {
    'Run 3 functions': async () => {
      let count = 0;
      const increment = () => count++;
      runAll(increment, increment, increment);
      await util.wait();
      return count === 3;
    },
    'Throw unless all functions': async () => {
      let count = 0;
      const increment = () => count++;
      return atest.throws(() => {
        runAll(increment, increment, 3, increment);
      });
    },
    'Fail if input is an array': async () => {
      let count = 0;
      const increment = () => count++;
      return atest.throws(() => {
        runAll([increment, increment, increment]);
      });
    },
  });

  /**
   * Wrap reaction functions so that the reaction function is receive
   * important context.
   *
   * @param {function[]} functions - Reaction functions
   * @param {Object} o
   * @param {Object} o.proxy - Which proxy triggered the event.
   * @param {number} o.idx - The index of the proxy
   * @param {Object[]} o.group - All proxies in this group.
   */
  function addContext(functions, {proxy, idx, group}) {
    return util.alwaysArray(functions).map(func => {
      const run = util.debounce(func);
      return () => run(proxy, idx, group);
    });
  }
  atest.group('addContext', {
    'Context added to functions': async () => {
      const func = (a, b, c) => a + b + c;
      const context = {proxy: 1, idx: 2, group: 3};
      const withContext = addContext(func, context)[0];
      await util.wait();
      return withContext() === 6;
    },
  });

  /**
   * Process raw reactions objects:
   * * Handle the onLoad event (by running these reactions).
   * * Handle the onInteract event (by assigning these reactions to several
   *   other event).
   * * Wrap all reactions in the relevant context (proxy, idx, group).
   */
  function unpackAndAddContext(reactions, context) {
    if (!reactions || !context) {
      throw new TypeError('Reactions object and context are required.');
    }
    const cloneReaction = {...reactions};
    for (let eventType in cloneReaction) {
      cloneReaction[eventType] =
          addContext(
            cloneReaction[eventType],
            context,
          );
    }
    if (cloneReaction.onInteract) {
      for (let eventType of INTERACT_EVENTS) {
        const current = cloneReaction[eventType] || [];
        const onInteract = cloneReaction.onInteract;
        cloneReaction[eventType] = [...current, ...onInteract];
      }
      delete cloneReaction.onInteract;
    }
    if (cloneReaction.onLoad) {
      runAll(...cloneReaction.onLoad);
      delete cloneReaction.onLoad;
    }
    const filteredClone = {};
    for (let eventType in cloneReaction) {
      if (/^on/.test(eventType)) {
        filteredClone[eventType] = cloneReaction[eventType];
      }
    }
    return filteredClone;
  }
  atest.group('unpackAndAddContext', {
    'before': () => {
      return {
        name: 'Name',
        onLoad: () => {},
        onClick: () => {},
        onInteract: () => {},
      };
    },
    'onLoad removed': (reactions) => {
      const ret = unpackAndAddContext(reactions, {});
      return ret.onLoad === undefined;
    },
    'onClick added': (reactions) => {
      const ret = unpackAndAddContext(reactions, {});
      return ret.onClick.length === 2;
    },
    'Name removed': (reactions) => {
      const ret = unpackAndAddContext(reactions, {});
      return ret.name === undefined;
    },
  });

  /**
   * For an HTMLElement, attach additional reaction functions.
   *
   * @param {htmlElement} htmlElement - The element to which
   * the reactions should be attached.
   * @param {Object<string: function[]>} reactions - A
   * map of event types to arrays of functions.
   * @param {Object} - Context about the way in which the
   + functions should be invoked, i.e. what group of proxies
   * these reactions were attached to and which one triggered
   * the functions.
   */
  function set(htmlElement, reactions, context) {
    if (!util.isHTMLElement(htmlElement)) {
      throw new TypeError('Not an HTMLElement');
    }
    const formattedReactions = unpackAndAddContext(reactions, context);
    for (let reaction in formattedReactions) {
      reactionStore.set({
        htmlElement: htmlElement,
        eventType: reaction,
        functions: formattedReactions[reaction],
      });
    }
  }

  /**
   * Attach additional reaction functions to the document.
   *
   * @param {Object<string: function[]>} reactions - A
   * map of event types to arrays of functions.
   */
  function setGlobal(reactions) {
    eventReactions.set(document, reactions, {proxy: {}, idx: 0, group: []});
  }

  /**
   * For a given browser event, find all relevant reaction functions.
   *
   * @param {Event} event - Browser event.
   * @return {function[]} Reaction functions.
   */
  function getMatchingReactions(event) {
    const elementReactions = reactionStore.get({
      htmlElement: event.target,
      eventTypes: eventToEventTypes(event),
    });
    const globalReactions = reactionStore.get({
      htmlElement: document,
      eventTypes: eventToEventTypes(event),
    });
    return [...elementReactions, ...globalReactions];
  }

  function maybePreventDefault(event) {
    const string = eventToString(event);
    if (PREVENT_DEFAULT_ON.includes(string)) {
      event.preventDefault();
    } else if (event.code) {
    }
  }

  /**
   * Respond to document level browser events.
   * Request matching reactions to events and run them.
   *
   * @param {Event} - Browser event.
   */
  function genericEventHandler(event) {
    maybePreventDefault(event);
    const targetReactions = getMatchingReactions(event);
    runAll(...targetReactions);
  }

  /**
   * Initialise document level event handlers.
   */
  function initGenericEventHandlers() {
    for (let type in SUPPORTED_EVENTS) {
      if (type === 'onLoad' || type === 'onInteract') {
        continue;
      }
      const eventType = SUPPORTED_EVENTS[type];
      document.addEventListener(
        eventType,
        genericEventHandler,
      );
    }
  }

  initGenericEventHandlers();
  return {
    reset: reactionStore.clear,
    set,
    setGlobal,
    SUPPORTED_EVENTS,
  }
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// DOM ACCESS module

var {ー, ref} = (function domAccessModule() {
  'use strict';

  /**
   * @fileoverview Exports the ー function, which enables and regulates
   * DOM access. Proxy objects for HTMLElements are returned, which
   * expose a limited number of methods, and which log
   * changes.
   */

  const EDITABLE_ELEMENT_TYPES =
      Object.freeze(['textarea', 'select-one', 'text']);

  const htmlElementWeakMap = new WeakMap();

  /**
   * Test whether an HTMLElement is hidden through CSS or Javascript.
   *
   * @param {HTMLElement} htmlElement
   * @return {boolean} Is the HTMLElement being displayed on the page?
   */
  function isHidden(htmlElement) {
    return (htmlElement.offsetParent === null);
  }

  /**
   * Get a numbered name.
   *
   * @param {string=} name
   * @param {number} idx
   * @return {string}
   * @example - namePlusIdx('Example name', 3) => 'ExampleName_3'
   */
  function namePlusIdx(name = 'Unnamed', idx) {
    return `${util.cap.camelCase(name)}_${idx + 1}`;
  }
  atest.group('namePlusIdx', {
    'One word': () => namePlusIdx('Name', 3) === 'Name_4',
    'Two words': () => namePlusIdx('First second', 0) === 'FirstSecond_1',
  });

  /**
   * Get coordinates of an HTMLElement, taking scroll position into account.
   *
   * @param {HTMLElement} htmlElement
   * @return {Object} o
   * @return {number} o.top
   * @return {number} o.left
   * @return {number} o.width
   * @return {number} o.height
   */
  function getCoords(htmlElement) {
    const rect = htmlElement.getBoundingClientRect();
    return {
      top: parseInt(scrollY + rect.top),
      left: parseInt(scrollX + rect.left),
      width: parseInt(rect.width),
      height: parseInt(rect.height),
    };
  }

  /**
   * Touch an HTMLElement, so that GWT registers it.
   *
   * @param {HTMLElement} htmlElement
   */
  async function touch(htmlElement) {
    await util.wait();
    // Blur signals a change to GWT
    util.dispatch(
      'blur, change, input, keydown',
      {touch: true},
      htmlElement,
    );
  }
  atest.group('touch', {
    'Listen for events': async () => {
      let count = 0;
      const fakeElement = {
        dispatchEvent: () => count++,
      };
      touch(fakeElement);
      await util.wait();
      return count === 4
    }
  });

  /**
   * All changes to HTMLElement values should be routed through this function.
   * Changes can be logged and checked.
   *
   * @param {HTMLElement} htmlElement
   * @param {string} name
   * @param {string} newValue - The new value that should conditionally be set.
   */
  function safeSetter(htmlElement, name, newValue) {
    const currentValue = htmlElement.value;
    if (currentValue === newValue) {
      user.log.low(`No change to ${name}.`, {print: false, toast: false});
      return;
    }
    if(!EDITABLE_ELEMENT_TYPES.includes(htmlElement.type)) {
      throw new TypeError(`Cannot set value on ${htmlElement.type} elements`);
    }
    htmlElement.value = newValue;
    touch(htmlElement);
    user.log.changeValue(
      `${name} '${currentValue}' => '${newValue}'.`,
      {print: false, toast: false},
    );
  }
  atest.group('safeSetter', {
    'Basic set value on supported element': async () => {
      let count = 0;
      const fakeElement = {
        type: EDITABLE_ELEMENT_TYPES[0],
        dispatchEvent: () => count++,
      };
      safeSetter(fakeElement, 'Name', 'newValue');
      await util.wait();
      const numTouchEvents = 4;
      return fakeElement.value = 'newValue' && count === numTouchEvents;
    },
    'Fail on unsupported element': async () => {
      let count = 0;
      const fakeElement = {
        type: 'unsupported',
        dispatchEvent: () => count++,
      };
      return atest.throws(() => {
        safeSetter(fakeElement, 'Name', 'newValue')
      });
    },
  });

  /**
   * Get a fresh proxy matching the select and pick parameters.
   * If the DOM updates, this may return a proxy to a different HTMLElement
   * than the original proxy.
   *
   * @param {Object} freshSelector
   * @param {string} freshSelector.select
   * @param {number[]} freshSelector.pick
   * @param {string} name
   * @return {Object} proxy
   */
  function getFreshElement(freshSelector, name) {
    return ー({...freshSelector, name, mode: 'static'});
  }

  /**
   * Make a basic proxy for an HTMLElement, to serve as the basis for more
   * specific versions.
   *
   * @param {Object} o
   * @param {HTMLElement} o.htmlElement
   * @param {string} o.name
   * @param {Object} o.freshSelector
   * @return {Object} proxy
   */
  function makeBasicProxy({htmlElement, name, freshSelector}) {
    if (!util.isHTMLElement(htmlElement)) {
      throw new TypeError('Not an HTMLElement');
    }
    const proxy = {
      name,
      value: htmlElement.value,
      get checked() {
        return htmlElement.checked;
      },
      set css(styles) {
        for (let rule in styles) {
          htmlElement.style[rule] = styles[rule];
        }
      },
      get disabled() {
        return htmlElement.disabled;
      },
      set spellcheck(on) {
        htmlElement.spellcheck = on;
      },
      get textContent() {
        return htmlElement.textContent;
      },
      set textContent(newValue) {
        htmlElement.textContent = newValue;
      },
      get tabIndex() {
        return htmlElement.tabIndex;
      },
      set tabIndex(value) {
        htmlElement.tabIndex = value;
      },
      click() {
        htmlElement.click();
      },
      blur() {
        htmlElement.blur();
      },
      focus() {
        htmlElement.focus();
      },
      scrollIntoView() {
        htmlElement.scrollIntoView();
      },
      touch() {
        touch(htmlElement);
      },
      toString() {
        return `${name}: ${htmlElement.value}`;
      },
      fresh() {
        return ー({...freshSelector, name, mode: 'user-editable'});
      },
      getCoords() {
        return getCoords(htmlElement);
      },
      unsafe() {
        return htmlElement;
      },
    }
    return proxy;
  }

  /**
   * Make a specific type of HTMLElement proxy, based on the passed in mode.
   *
   * @param {Object} o
   * @param {HTMLElement} o.htmlElement
   * @param {string} o.name
   * @param {string} o.mode
   * @param {Object} o.freshSelector
   * @return {Object} proxy
   */
  function makeProxy({htmlElement, name, mode, freshSelector}) {
    if (!util.isHTMLElement(htmlElement)) {
      throw new TypeError('Not an HTMLElement');
    }
    const proxy = makeBasicProxy({
      htmlElement,
      name,
      freshSelector
    });
    proxy.name = name;
    proxy.mode = mode;

    function goodSetter(value) {
      safeSetter(htmlElement, name, value)
    }
    function brokenSetter(newValue) {
      throw new Error(
          `Cannot set value of ${name} to '${newValue}'. ` +
          `Element is not programmatically editable.`
      );
    }
    if (proxy.mode === 'static') {
      return Object.freeze({...proxy});
    }
    if (proxy.mode === 'programmable') {
      Object.defineProperty(
        proxy, 'value', {get: () => htmlElement.value, set: goodSetter,}
      );
      return Object.seal(proxy);
    }
    if (proxy.mode === 'user-editable') {
      Object.defineProperty(
        proxy, 'value', {get: () => htmlElement.value, set: brokenSetter,}
      );
      return Object.seal(proxy);
    }
    throw new Error('No valid mode set');
  }

  /**
   * Create an object that can be used to find a fresh HTMLElement on the
   * page. This is based on the original values passed into the ー function.
   *
   * @param {Object} options
   * @param {number} idx
   */
  function makeFreshSelector(options, idx) {
    const {select, pick} = options;
    return {
      select,
      pick: (pick ? [pick[idx]] : []),
    };
  }

  /**
   * Find or create a proxy matching an HTMLElement.
   *
   * @param {HTMLElement} htmlElement
   * @param {number} idx
   * @param {Object} options
   */
  function toProxy(htmlElement, idx, options) {
    options.mode = 'programmable';
    if (!util.isHTMLElement(htmlElement)) {
      throw new TypeError('Not an HTMLElement');
    }
    const cached = htmlElementWeakMap.get(htmlElement);
    if (cached && options.mode === 'fresh') {
      options.mode = cached.mode;
    } else if (cached) {
      if (cached.mode !== options.mode && false) { // @todo Fix warning
        user.log.warn(
          `Didn't change ${options.name} element mode from ${cached.mode}` +
          ` to ${options.mode}`,
          true,
        )
      }
      return cached;
    } else if (options.mode === 'fresh') {
      mode = 'static';
    }
    const proxy = makeProxy({
      htmlElement,
      name: namePlusIdx(options.name, idx),
      mode: options.mode,
      freshSelector: makeFreshSelector(options, idx),
    });
    if (options.mode !== 'fresh') {
      htmlElementWeakMap.set(htmlElement, proxy);
    }
    return proxy;
  }
  atest.group('toProxy', {
    'Throws without an HTMLElement': () => {
      return atest.throws(() => toProxy({}, 0, {}));
    },
  });

  /**
   * Access the DOM and find HTMLElements matching the parameters.
   * Select and pick can be used to find elements in the entire page, while
   * rootSelect and rootNumber can be used to narrow the search down to a
   * specific node of the page.
   * For example, {select: 'button', pick: [2,0,1]} will return the 2nd,
   * 0th and 1st buttons on the page, in that order.
   * {rootSelect: 'div', rootNumber: 4, select: 'button', pick: [2]} will
   * return the 2nd button from the 4th div.
   *
   * @param {Object} o
   * @param {string} o.rootSelect
   * @param {number} o.rootNumber
   * @param {string} o.select
   * @param {number[]} o.pick
   * @param {HTMLElement[]}
   */
  function getHtmlElements({
    rootSelect,
    rootNumber = '0',
    select,
    pick,
    withText,
  }) {
    const simpleSelect = () => {
      return [...document.querySelectorAll(select)];
    }
    const complexSelect = () => {
      const root = [...document.querySelectorAll(rootSelect)][rootNumber];
      if (!root) {
        return [];
      }
      return [...root.querySelectorAll(select || '*')] || [];
    }
    const allElements = (rootSelect) ? complexSelect() : simpleSelect();
    const filterByText = (el) => {
      if (!withText) {
        return true;
      }
      return el.value === withText || el.textContent === withText;
    };
    if (!pick) {
      return allElements.filter(filterByText);
    }
    const pickedElements = [];
    for (let number of pick) {
      const picked = allElements[number];
      if (picked) {
      pickedElements.push(picked);
      }
    }
    return pickedElements.filter(filterByText);
  }
  atest.group('getHtmlElements', {
    'Throws without input': () => atest.throws(() => getHtmlElements()),
    'Returns an array': () => {
      return Array.isArray(getHtmlElements({rootSelect: 'div'}));
    },
  })

  function checkSupportedProps(prop) {
    for (let supported of Object.keys(eventReactions.SUPPORTED_EVENTS)) {
      if (prop.includes(supported)) {
        return;
      }
    }
    throw new TypeError(
      `${prop}  is not a supported event. Please use:` +
      util.bulletedList(eventReactions.SUPPORTED_EVENTS)
    );
  }
  atest.group('checkSupportedProps', {
    'onLoad is ok': () => !atest.throws(() => checkSupportedProps('onLoad')),
    'onError fails': () => atest.throws(() => checkSupportedProps('onError')),
    'load fails': () => atest.throws(() => checkSupportedProps('load')),
  });

  function checkReactionsAreFunctions(name, action, reactions) {
    util.alwaysArray(reactions).forEach(reaction => {
      if (typeof reaction !== 'function') {
        throw new TypeError(
          `Failed to add '${action}' reaction to ${name}.` +
          `Reaction should be a function, not ${typeof reaction}.`,
        );
      }
    });
  }
  atest.group('checkReactionsAreFunctions', {
    'Array of functions': () => {
      const reactions = [() => {}, () => {}];
      return !atest.throws(() => {
        checkReactionsAreFunctions('Test 1', 'onLoad', reactions);
      });
    },
    'Single function': () => {
      const reactions = () => {};
      return !atest.throws(() => {
        checkReactionsAreFunctions('Test 1', 'onLoad', reactions);
      });
    },
    'Array with undefined': () => {
      const reactions = [() => {}, () => {}, undefined];
      return atest.throws(() => {
        checkReactionsAreFunctions('Test 1', 'onLoad', reactions);
      }, TypeError);
    },
    'Single undefined': () => {
      const reactions = undefined;
      return atest.throws(() => {
        checkReactionsAreFunctions('Test 1', 'onLoad', reactions);
      }, TypeError);
    },
  });

  /**
   * Set event reactions on an HTMLElement.
   *
   * @param {Object[]} htmlElements
   * @param {Object[]} proxies
   * @param {Object} options - All properties in the options object for
   * which the name begins with 'on' will be processed.
   */
  function setAllReactions(htmlElements, proxies, options) {
    const reactions = {};
    for (let prop in options) {
      if (/^on/.test(prop)) {
        checkSupportedProps(prop);
        checkReactionsAreFunctions(options.name, prop, options[prop]);
        reactions[prop] = options[prop];
      }
    }
    proxies.forEach((proxy, idx, group) => {
      const htmlElement = htmlElements[idx];
      const context = {proxy, idx, group};
      eventReactions.set(htmlElement, reactions, context);
    });
  }

  const ref = {
    fresh(name) {
      const cached = ref[name] || [];
      return cached[0].fresh()[0];
    }
  };

  /**
   * Find and process HTMLElements to produce proxies and attach event
   * reactions.
   *
   * @param {Object} options
   */
  function ー(options) {
    const htmlElements = getHtmlElements(options);
    const proxies = htmlElements.map((element,idx) => {
      return toProxy(element, idx, options);
    });
    proxies.forEach(proxy => {
      if (options.css) {
        proxy.css = options.css;
      }
    });
    if (options.mode !== 'fresh') {
      setAllReactions(htmlElements, proxies, options);
    }
    if (options.ref) {
      if (typeof options.ref !== 'string') {
        throw new TypeError(`Ref should be a string, not ${typeof options.ref}.`);
      }
      ref[options.ref] = proxies;
    }
    return proxies;
  }

  return {ー, ref};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// GUI module

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
      `.${BASE_ID}container { font-size: 1.5em }`,
      `.${BASE_ID}container { opacity: 0.8 }`,
      `.${BASE_ID}container { overflow: hidden }`,
      `.${BASE_ID}container { pointer-events: none }`,
      `.${BASE_ID}container { padding: 10px }`,
      `.${BASE_ID}container { position: absolute }`,
      `.${BASE_ID}container { right: 3px }`,
      `.${BASE_ID}container { top: 30px }`,
      `.${BASE_ID}container { width: 20em }`,
      `.${BASE_ID}container { z-index: 2000 }`,
      `.${BASE_ID}container p { margin: 4px }`,
      `.${BASE_ID}container em { font-weight: bold }`,
      `.${BASE_ID}container em { font-style: normal }`,
      `.${BASE_ID}container .high { color: #dd4b39 }`,
      `.${BASE_ID}container .medium { color: #4b0082 }`,
      `.${BASE_ID}container .low { color: #000077 }`,
      `.${BASE_ID}bubble { border-radius: 50% }`,
      `.${BASE_ID}bubble { opacity: 0.25 }`,
      `.${BASE_ID}bubble { pointer-events: none }`,
      `.${BASE_ID}bubble { z-index: 1999 }`,
      `.lpButton button { opacity: 0 }`,
      `.lpButton button { cursor: not-allowed }`,
      `.submitTaskButton { opacity: 0 }`,
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
    const keepOnScreen = (x, max) => Math.min(Math.max(-BUBBLE_RADIUS * 0.6, x), max - BUBBLE_RADIUS);
    const boo = (top, offset) => (top || 200) + (offset / 2) - BUBBLE_RADIUS;
    const top = keepOnScreen(boo(coords.top, coords.height), window.innerHeight);
    const left = keepOnScreen(boo(coords.left, coords.width), window.innerWidth);
    const div = document.createElement('div');
    div.classList = BASE_ID + 'bubble';
    div.style.top = top + 'px';
    div.style.left = left + 'px';
    div.style.padding = BUBBLE_RADIUS + 'px';
    div.style.position = 'fixed';
    document.body.append(div);
    div.style.backgroundColor = BUBBLE_COLORS[issueLevel] || BUBBLE_COLORS.high;
    await util.wait(BUBBLE_TIME * 0.65);
    document.body.removeChild(div);
  }

  function update() {
    let html = [];
    const p = (type, text, title = '') => {
      const slicedText = text.slice(0, GUI_TEXT_MAX_LENGTH);
      html.push(`<p class="${type}"><em>${title}</em> ${slicedText}</p>`);
    };
    const x = [];
    for (let counter in guiState.counters) {
      x.push(counter + ': ' + guiState.counters[counter]);
    }
    p('stage', util.cap.firstLetter(guiState.stage), 'Stage');
    p('counter', x.join(' | '));
    for (let issue of guiState.issues) {
      p(issue.issueLevel, issue.message, issue.issueType);
      if (user.config.get('play beeps on error') && issue.issueLevel !== 'low') {
        util.beep();
      }
      bubble(issue);
    }
    container.setContent(html.join('\n'));
  }
  
  setInterval(update, BUBBLE_TIME);
})();




////////////////////////////////////////////////////////////////////////////////
undefined;




// @todo Remove this. Porting data
chrome.storage.local.get(null, (stores) => {
  // Porting settings to new format.

  if (!Array.isArray(stores['Configuration'])) {
    const defaults = [
      {
        name: 'initials',
        value: user.config.get('initials'),
        description: 'Your initials will be automatically added to the comment box.',
      },
      {
        name: 'play beeps on error',
        value: !!user.config.get('play beeps on error'),
        description: '',
      },
      {
        name: 'use escape-key to approve',
        value: !!user.config.get('use escape-key to approve'),
        description: 'Use the Escape key as a Hotkey to Approve tasks.',
      },
      {
        name: '12 character limit',
        value: false,
        description: 'For the Japanese team, the character limit should be 12 characters.',
      },
      {
        name: 'use google links',
        value: false,
        description: 'Experimental: Use the Google internal redirection system.',
      },
    ];
    console.debug(defaults);
    chrome.storage.local.set({'Configuration': defaults}, (stores) => {
      if (!Array.isArray(stores['Configuration'])) {
        alert(
          `TwoTwenty was updated. Please do the following:
          1) Load the TwoTwenty options page.
          2) Click Reset default values.
          3) Add your initials back.`
        );
      }
    });
  }
});
