////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//   _______         _______                 _          ____             
//  |__   __|       |__   __|               | |        / __ \            
//     | |_      _____ | |_      _____ _ __ | |_ _   _| |  | |_ __   ___ 
//     | \ \ /\ / / _ \| \ \ /\ / / _ \ '_ \| __| | | | |  | | '_ \ / _ \
//     | |\ V  V / (_) | |\ V  V /  __/ | | | |_| |_| | |__| | | | |  __/
//     |_| \_/\_/ \___/|_| \_/\_/ \___|_| |_|\__|\__, |\____/|_| |_|\___|
//                                                __/ |                  
//                                               |___/                   
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// TEST module

var test = (function testModule() {
  'use strict';

  /**
   * @fileoverview Exports testing functions.
   * Define a new test with group.
   * Use ok, fizzle and solid to define test items:
   * - pass ok a true statement.
   * - pass fizzle a function that throws an error.
   * - pass solid a function that does not throw an error.
   * Results are logged to the console if there is a failure.
   * @example
   * test.group('Name', () => {
   *   test.ok(1===1, '1 equals 1');
   * });
   * which would record:
   * ===== Name
   * OK: 1 equals 1
   */

  const RUN_UNSAFE_TESTS = false;
  const AUTO_PRINT_DELAY = 1000;
  const PRINT_COLORS = {
    header: 'color: grey',
    ok: 'color: green',
    fail: 'color: red',
    todo: 'color: purple',
  }
  const testingLogBook = [];
  let failuresRecorded = false;
  let enclosedInGroup = false;

  const print = () => testingLogBook.forEach(el => console.log(...el));

  const log = (type, message) => {
    testingLogBook.push([`%c${message}`, PRINT_COLORS[type]]);
  };

  /**
   * Define a test, which can include many test items.
   * 
   * @param {?string} groupDesc - Commonly the name of the
   * function being tested.
   * @param {function} func - Function body that contains the
   * test items.
   */
  const group = (groupDesc, func, unsafe) => {
    if (unsafe && !RUN_UNSAFE_TESTS) {
      return;
    }
    if (typeof func !== 'function') {
      throw new Error('Test requires a function as its second parameter');
    }
    log('header', '===== ' + groupDesc);
    func();
  };

  /**
   * Test a statement for truth.
   *
   * @param {boolean} statement - Truthy or falsy statement
   * @param {?string} itemDesc - Description of test item.
   */
  const ok = (statement, itemDesc) => {
    if (statement === true) {
      log('ok', ' OK: ' + itemDesc);
    } else {
      log('fail', ' FAIL: ' + itemDesc);
      failuresRecorded = true;
    }
  }

  /**
   * Test that a function throws an error.
   *
   * @param {function} fizzleFunc - Function that is
   * expected to throw an error.
   * @param {?string} itemDesc - Description of test item.
   */
  const fizzle = (fizzleFunc, itemDesc) => {
    try {
      fizzleFunc();
      log('fail', ' FAIL: ' + itemDesc + ' did not fizzle');
      failuresRecorded = true;
    } catch (e) {
      log('ok', ' OK: ' + itemDesc + ' fizzled');
    }
  }

  /**
   * Test that a function does not throw an error.
   *
   * @param {function} throwingFunc - Function that is
   * expected to run without throwing an error.
   * @param {?string} itemDesc - Description of test item.
   */
  const solid = (throwingFunc, itemDesc) => {
    try {
      throwingFunc();
      log('ok', ' OK: ' + itemDesc + ' is solid');
    } catch (e) {
      log('fail', ' FAIL: ' + itemDesc + ' is not solid');
      failuresRecorded = true;
    }
  }

  const todo = (message) => {
    log('todo', 'TODO: ' + message);
  };

  // Automatically print results if there's a fail result.
  setTimeout(() => {
    if (failuresRecorded) {
      print();
    }
  }, AUTO_PRINT_DELAY);

 return {
   fizzle,
   group,
   ok,
   print,
   solid,
   todo,
 };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// UTILITY module

var util =
    (function utilityModule() {
  'use strict';

  /**
   * @fileoverview Exports utility functions.
   */

  const DEFAULT_DELAY = 10; //milliseconds

  /**
   * Call several functions with a single function call.
   *
   * @param {...function} functions - Functions to be bundled into a single
   * callable function.
   * @return {function} Calling this function calls all bundled function.
   */
  function bundle(...functions) {
    /**
     * @param {...params} 
     */
    function bundled(...params) {
      functions.forEach(func => func(...params));
    }
    return bundled;
  }
  test.group('bundle', () => {
    let count = 0;
    const func1 = () => count++;
    const func2 = () => count++;
    const func3 = () => count++;
    bundle(func1, func2, func3)();
    test.ok(count === 3, 'Ran three bundled functions')
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
     * @return {*} The debounced function returns whatever the wrapped function
     * returns.
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
  test.group('debounce', () => {
    let count = 0;
    const func1 = () => count++;
    const funct1deb = debounce(func1, 1000);
    funct1deb();
    funct1deb();
    test.ok(count === 1, 'Ran debounced functions');
    test.ok(DEFAULT_DELAY !== undefined, 'Default delay is set');
  });

  /**
   * Function decorator. Returns a function that will run with a delay.
   *
   * @param {function} func - The function to be decorated.
   * @param {number} ms - The delay in milliseconds.
   */
  function delay(func, ms = DEFAULT_DELAY) {
    function delayed(...params) {
      wait(ms).then(() => func(...params));
    }
    return delayed;
  }
  test.group('delay', () => {
    let val = 0;
    const increment = () => val++;
    const delayedIncrement = delay(increment);
    delayedIncrement();
    test.ok(val === 0, 'Value is not immediately affected');
    increment();
    test.ok(val === 1, 'Incrementing does work');
  });

  /**
   * @param {Object} o
   * @param {string} o.type - E.g. 'keydown' or 'guiUpdate'.
   * @param {Object} o.payload - E.g. event or {detail: {stage: 5}}.
   * @param {HTMLElement} o.target - The HTMLElement emitting the event.
   * @example 
   */
  function dispatch({type, payload, target = document}) {
    target.dispatchEvent(new CustomEvent(type, payload));
  }

  /**
   * Compares two arrays shallowly. Two arrays match if the i-th element in
   * each is exactly equal to the i-th element in the other.
   *
   * @param {*[]} a - First array
   * @param {*[]} b - Second array
   * @return {boolean} Does every element in both arrays match?
   */
  function doArraysMatch(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }
  test.group('doArraysMatch', () => {
    test.ok(doArraysMatch([], []) === true, 'Empty arrays');
    test.ok(doArraysMatch([3], [3]) === true, 'Simple arrays');
    test.ok(doArraysMatch([], [3]) === false, 'First array empty');
    test.ok(doArraysMatch([3], []) === false, 'Second array empty');
    test.ok(doArraysMatch([3,4,5], [3,4,5]) === true, 'Multiple elements');
    test.ok(doArraysMatch([3,4,7], [3,4,5]) === false, 'Mismatch one element');
    test.ok(doArraysMatch([5,3,4], [3,4,5]) === false, 'Different order');
  });

  /**
   * Test whether an object exposes the same properties as a template object.
   *
   * @param {object} template - Object that exposes all required properties.
   * @param {object} toTest - Object to test.
   * @return {boolean} Does the toTest object expose all the properties exposed
   * by the template?
   */
  function doesObjectMatchTemplate(template, toTest = {}) {
    for (let property in
     template) {
      if (toTest[property] === undefined) {
        return false;
      }
    }
    return true;
  }
  test.group('doesObjectMatchTemplate', () => {
    const a = {};
    const b = {};
    const c = {test: 1};
    const d = {test: 2};
    test.ok(doesObjectMatchTemplate(a, b) === true, 'Empty objects match');
    test.ok(doesObjectMatchTemplate(a, d) === true, 'Empty template');
    test.ok(doesObjectMatchTemplate(d, a) === false, 'Non-empty template');
    test.ok(doesObjectMatchTemplate(c, d) === true, 'Different values match');
  });

  /**
   * Return any input in the form of an array.
   *
   * @param {*|*[]} input
   * @return {*[]}
   */
  function ensureIsArray(input) {
    if (Array.isArray(input)) {
      return input;
    }
    return [input];
  }
  test.group('ensureIsArray', () => {
    test.ok(ensureIsArray(5).length === 1, '5 becomes an array');
    test.ok(ensureIsArray(5)[0] === 5, '5 becomes [5]');
    test.ok(ensureIsArray([5]).length === 1, '[5] remains an array');
    test.ok(ensureIsArray([5])[0] === 5, '[5] remains [5]');
  });

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
      log.warn('Not a url', true);
      return '';
    }
    const domain = url.match(/\/\/([^\/]*)/);
    return domain[1];
  }
  test.group('getDomain', () => {
    test.ok(
      getDomain('https://example.com') === 'example.com',
      'Test 1',
    );
    test.ok(
      getDomain('http://www.example.com') === 'www.example.com',
      'Test 2',
    );
    test.ok(
      getDomain('http://www.example.com/test.html') === 'www.example.com',
      'Test 3'
    );
  })

  /**
   * Test whether an object is an HTMLElement. Uses simple duck typing.
   *
   * @param {Object=} HTMLElement - Object to be tested
   * @return {boolean} Returns true if an HTMLElement is passed in.
   */
  function isHTMLElement(htmlElement) {
    return doesObjectMatchTemplate({parentNode: 5}, htmlElement);
  }
  test.group('isHTMLElement', () => {
    test.ok(isHTMLElement({}) === false, 'An object is not');
    test.ok(isHTMLElement(document) === true, 'The document');
    test.ok(isHTMLElement(document.body) === true, 'Document body');
  });

  function mapToBulletedList(arrOrObj, spaces = 4) {
    const arr = (Array.isArray(arrOrObj)) ? arrOrObj : Object.keys(arrOrObj);
    return arr.map(el => '\n' + ' '.repeat(spaces) + '* ' + el).join('');
  }

  /**
   * Returns a promise that will resolve after a delay.
   *
   * @param {number=} ms - Time to wait before continuing, in milliseconds
   * @return {Promise} Promise which will resolve automatically.
   */
  function wait(ms = DEFAULT_DELAY) {
    return new Promise((resolve) => setTimeout(() => resolve(), ms));
  }
  test.group('wait', () => {
    const promise = wait();
    test.ok(wait().then !== undefined, 'Wait returns a Promise');
    test.ok(DEFAULT_DELAY !== undefined, 'Default delay is set');
  });

  return {
    bundle,
    debounce,
    delay,
    dispatch,
    doArraysMatch,
    doesObjectMatchTemplate,
    ensureIsArray,
    getDomain,
    isHTMLElement,
    mapToBulletedList,
    wait,
    };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// REPORTING module

var {
  config,
  counter,
  data,
  log,
} = (function reportingModule() {
  'use strict';

  /**
   * @fileoverview Exposes stateful objects to keep track of things.
   * * config - manage configuration settings.
   * * counter - count things.
   * * flag - flag issues.
   * * log - log things.
   */

  const LOCALSTORE_BASENAME = 'twoTwentyOne';

  const CONFIG_STORE_NAME = 'Configuration';

  const COUNTER_STORE_NAME = 'Counter';

  const DATA_STORE_NAME = 'Data';

  const LOGBOOK_STORE_NAME = 'LogBook';
  const MAX_LOG_LENGTH = 5000; // entries
  const LOG_PAGE_SIZE = 25; // entries per page
  const NO_COLOR_FOUND = 'yellow';
  const TIMESTAMP_COLOR = 'color: grey';
  const LOG_TYPES = {
    log: {color:'black', print: true},
    notice: {color:'DodgerBlue', print: true},
    warn: {color:'OrangeRed', print: true},
    ok: {color:'LimeGreen', print: true},
    lowLevel: {color:'Gainsboro', print: false},
    changeValue: {color:'LightPink', print: false},
    changeConfig: {color:'MediumOrchid', print: true},
    saveExtraction: {color:'#6370ff', print: true},
    autoSaveExtraction: {color:'#6370ff', print: true},
  };

  /**
   * Create a human readable string timestamp.
   *
   * @param {Date} d - A date to turn into a matching timestamp.
   * For today's Date, returns a short format (hh:mm)
   * For other Dates, returns a long format (MM/DD hh:mm:ss) 
   * @return {string}
   */
  function timestamp (d = new Date()) {
    /** Cast numbers into a zero prefixed two digit string format */
    const cast = (/** number */n) /** string */ => ('0' + n).slice(-2);
    const isTodaysDate = (new Date().getDate() - d.getDate() === 0);
    const month = cast(d.getMonth() + 1);
    const date = cast(d.getDate());
    const hrs = cast(d.getHours());
    const min = cast(d.getMinutes());
    const sec = cast(d.getSeconds());
    const longForm = `${month}/${date} ${hrs}:${min}:${sec}`;
    const shortForm = `${hrs}:${min}`;
    return (isTodaysDate) ? shortForm : longForm;
  }
  test.group('timestamp', () => {
    const today = new Date();
    const earlier = new Date('01-01-2019 12:34:56');
    test.ok(
      timestamp(today).length === 5,
      'Without a parameter',
    );
    test.ok(
      timestamp(today).length === 5,
      'Short length: ' + timestamp(today),
    );
    test.ok(
      timestamp(new Date(earlier)).length === 14,
      'Long length: ' + timestamp(new Date(earlier)),
    );
  });

  /**
   * Dispatch GUI update packets. The GUI module  is reponsible for integrating
   * packets into a consistent state.
   *
   * @param {Object} packet - A packet containing a state update to the GUI.
   * @example - updateGui({counters: {one: 21}});
   */
  function updateGui(packet) {
    util.dispatch({type: 'guiUpdate', payload: {detail: packet}});
  }
  test.group('updateGui', () => {
    let received;
    let testPacket = {packet: {stage: 0}};
    document.addEventListener('guiUpdate', ({detail}) => received = detail);
    updateGui(testPacket);
    test.ok(received === testPacket, 'Packet succesfully sent');
  }, true);

  /** Handle communication with localStorage */
  const localStore = {
    /**
     * @param {string} itemName - Name of the item in localStorage
     * @return {(Object|string|number)} Data restored from string in storage,
     * or empty object. Strings and numbers are supported.
     */
    get(itemName) {
      const item = localStorage.getItem(LOCALSTORE_BASENAME + itemName);
      return (item) ? JSON.parse(item) : {};
    },
    /**
     * @param {string} itemName - Name of the item in localStorage
     * @param {object} obj - Object, string or number to be stored.
     * Will overwrite previously stored values.
     */
    set(itemName, obj = {}) {
      localStorage.setItem(LOCALSTORE_BASENAME + itemName, JSON.stringify(obj))
    }
  };

  /**
   * Track configuration settings. Settings are loaded from localStorage on
   * load, but changes are not persisted by default.
   * #get(name) returns a value if a config setting is loaded, or undefined.
   * #set(name, newValue, save) adds a value to the config object in memory
   * and optionally updates the config options stored in localStorage.
   * #raw() returns the config object in memory and exists mostly for debugging.
   */
  const config = (function configMiniModule() {
    const defaults = {};
    const stored = localStore.get(CONFIG_STORE_NAME);
    const config = {...defaults, ...stored};
    /**
     * @param {string} name - The name of the configuration option to find.
     * @return {(Object|string|number)} The associated value, or undefined if
     * none is found.
     */
    function get(name) {
      return config[name];
    }
    /**
     * @param {string} name - The name of the configuration option to set.
     * @param {(Object|string|number)} newValue
     * @param {boolean} save - Should the value be persisted to localstorage?
     */
    function set(name, newValue, save) {
      const term = (save) ? 'permanently' : 'temporarily';
      log.changeConfig(`${name} ${term} changed to '${newValue}'`)
      config[name] = newValue;
      if (save) {
        localStore.set(CONFIG_STORE_NAME, config);
      }
    }
    /**
     * Return the raw config object. Exists mainly for debugging purposes.
     *
     * @return {Object} - The raw config object as it exists in memory.
     */
    function raw() {
      return config;
    }
    return {get, set, raw};
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

    function getStored() {
      return localStore.get(COUNTER_STORE_NAME);
    }

    /**
     * Add one to the count of an existing counter, or create a new counter
     * starting at 1.
     *
     * @param {string} name - Name of counter to be incremented or created. 
     */
    function add(name) {
      if (typeof name !== 'string') {
        throw new Error('Counter add expects a name string');
      }
      const /** object */ allCounts = getStored();
      const /** number */ newCount = (allCounts[name] + 1) || 1;
      allCounts[name] = newCount;
      localStore.set(COUNTER_STORE_NAME, allCounts);
      updateGui({counters: allCounts});
      return newCount;
    }

    /**
     * @param {string} name - Name of the counter to find.
     * @return {number} The count of the counter, or -1 if the counter
     * does not exist.
     */
    function get(name) {
      if (typeof name !== 'string') {
        throw new Error('Counter get expects a name string');
      }
      const allCounts = getStored();
      return allCounts[name] || -1;
    }

    /**
     * @param {string=} name - Name of the counter to reset.
     */
    function reset(name) {
      if (typeof name !== 'string' && name !== undefined) {
        throw new Error('Counter reset expects a name string or nothing');
      }
      const allCounts = getStored();
      if (name) {
        const currentCount = allCounts[name];
        util.wait().then(() => { // @todo Fix wait hack. Used for testing only.
          log.notice(
            `Resetting counter ${name} from ${currentCount}`,
            true,
          ), 0
        });
        delete allCounts[name];
      } else {
        log.notice(
          `Resetting all counters: ${JSON.stringify(allCounts)}`,
          true,
        );
        for (let i in allCounts) {
          delete allCounts[i];
        }
      }
      localStore.set(COUNTER_STORE_NAME, allCounts);
      updateGui({counters: allCounts});
      return 0;
    }
    util.wait().then(() => updateGui({counters: getStored()}));
    return {add, get, reset};
  })();
  test.group('counter', () => {
    const complex = 'aG9yc2ViYXR0ZXJ5c3RhYmxl';
    test.ok(counter.get(complex) === -1, 'Undefined counter');
    test.ok(counter.add(complex) === 1, 'Initialised counter');
    test.ok(counter.add(complex) === 2, 'Counter is counting');
    test.ok(counter.get(complex) === 2, 'Counter is consistent');
    test.ok(counter.reset(complex) === 0, 'Reset returns 0');
    test.ok(counter.get(complex) === -1, 'Counter is gone');
  }, true);

  /**
   * Manage dynamic data stores.
   */
  const data = (function dataMiniModule() {
    const storedData = localStore.get(DATA_STORE_NAME);
    return storedData;
  })();

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
   * {proxy, issueType: 'Typo', issueLevel: 'red', message: 'Wrod misspelled'}
   */
  function flag(issueUpdate) {
    const template = {proxy: true, issueType: true};
    if (!util.doesObjectMatchTemplate(template, issueUpdate)) {
      throw new Error('Not a valid issue.');
    }
    /**
     * Filter function to remove issues that match the incoming issue. Compares proxy
     * type properties.
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
  test.group('flag', () => {
    test.fizzle(() => flag(), 'Without a issue');
    // @todo Better tests.
  });

  /**
   * Sets a listener on the document for issue updates.
   */
  function addissueUpdateListener() {
    document.addEventListener('issueUpdate', ({detail}) => {
      const issueUpdate = detail;
      flag(issueUpdate);
    }, {passive: true});
  }
  addissueUpdateListener();

  /**
  * Object with methods to log events. The following is true for most methods:
  * * @param {Object|string} payload
  * * @param {Boolean} persist Should the event be persisted to localstorage?
  */
  const log = (function loggingModule() {

    /**
     * Generate a string from a log entry, in order to print to the console.
     *
     * @param {Object | string} payload Data associated with the log entry.
     * @param {number} space Number of spaces to include in front of new lines.
     */
    function payloadToString(payload, space) {
      const spacer = " ".repeat(space + 1);
      if (typeof payload === 'string') {
        return payload.replace(/\n/g,'\n' + spacer);
      } else {
        return JSON.stringify(payload);
      }
    }
    test.group('payloadToString', () => {
      let payload = 'one\ntwo';
      let resultString = 'one\n   two';
      test.ok(payloadToString(payload, 2) === resultString, 'Two spaces');
      payload = {test: '1,2,3'};
      resultString = '{"test":"1,2,3"}';
      test.ok(payloadToString(payload, 2) === resultString, 'JSON');
    });

    /**
     * Print a log entry to the console, with a timestamp.
     *
     * @param {string} type
     * @param {Object|string} payload
     * @time {=Date} Optionally, provide a Date for the timestamp.
     */
    function toConsole({type, payload, time = new Date()}) {
      const color = LOG_TYPES[type] && LOG_TYPES[type].color || NO_COLOR_FOUND;
      const ts = timestamp(time);
      const string = payloadToString(payload, ts.length);
      console.log(`%c${ts} %c${string}`, TIMESTAMP_COLOR, `color: ${color}`);
    }

    /**
     * Retrieve an array of all log entries. Timestamps are recast into Date
     * objects.
     *
     * @return {Object[]} Array of entries. 
     */
    function getPersistent() {
      const logBook = localStore.get(LOGBOOK_STORE_NAME);
      return (logBook.entries || []).map(entry => {
        entry.time = new Date(entry.time);
        return entry;
      });
    }
    test.group('getPersistent', () => {
      test.ok(Array.isArray(getPersistent()), 'Returns an array');
    });

    /**
     * Persistently save an array of log entries.
     *
     * @param {Object} entries - An object containing an array of log entries. 
     */
    function setPersistent(entries) {
      entries = entries.slice(-MAX_LOG_LENGTH);
      localStore.set(LOGBOOK_STORE_NAME, {entries});
    }

    /**
     * Add a single log entry to the persistent log.
     *
     * @param {Object} entry - Log entry object.
     * @param {string} entry.type - Type of log entry.
     * @param {Object|string} entry.payload - Data associated with the log entry.
     */
    function addPersistent({type, payload}) {
      const entries = getPersistent();
      const newEntry = {time: new Date(), type, payload};
      const newEntries = [...entries, newEntry];
      setPersistent(newEntries);
    }
    test.group('addPersistent', () => {
      const length = getPersistent().length;
      addPersistent({type: 'testing', payload: '1,2,3'});
      test.ok((length + 1) === getPersistent().length), 'Added one entry';
    }, true);

    /**
     * Get a filtered part of the persistent log as an array of entries.
     *
     * @param {Object=} filterBy - Filter parameters.
     * @return {Object[]}
     * @example - printPersistent({before: new Date('2019-01-17')});
     */
    function getFilteredPersistent(filterBy = {}) {
      const filters = {
        after: entry => entry.time > filterBy.after,
        before: entry => entry.time < filterBy.before,
        contains: entry => new RegExp(filterBy.contains).test(entry.payload),
        regex: entry => filterBy.regex.test(entry.payload),
        type: entry => entry.type === filterBy.type,
        typeExclude: entry => entry.type !== filterBy.typeExclude,
      }
      let entries = getPersistent();
      for (let filterType in filterBy) {
        if (filterType === 'page') {
          continue;
        }
        try {
          entries = entries.filter(filters[filterType]);
        } catch (e) {
          if (e instanceof TypeError) {
            log.warn(
              `'${filterType}' is not a valid log filter. Please use:` +
              util.mapToBulletedList(filters),
              true,
            );
            return [];
          }
        }
      }
      const page = (filterBy.page > 0) ? filterBy.page : 0;
      const start = LOG_PAGE_SIZE * (page);
      const end = LOG_PAGE_SIZE * (page + 1);
      entries = entries.slice(-end, -start || undefined);
      return entries;
    }
    test.group('getFilteredPersistent', () => {
      const entries = getFilteredPersistent();
      test.ok(
        (entries.length === LOG_PAGE_SIZE) ||
        (getPersistent().length < LOG_PAGE_SIZE),
        'Get a full page from the log, if possible',
      );
      const randomString = Math.random().toString();
      const filtered = getFilteredPersistent({contains: randomString});
      test.ok(
        filtered.length === 0,
        'Succesfully filter out all entries',
      );
    });

    /**
     * Print a filtered part of the persistent log.
     *
     * @param {Object=} filterBy Filter parameters.
     * @return {Object[]}
     * @example printPersistent({before: new Date()});
     */
    function printPersistent(filterBy = {}) {
      getFilteredPersistent(filterBy).forEach(entry => toConsole(entry));
    }
    test.group('printPersistent', () => {
      test.todo('XXXXX');
    });

    function raw(filterBy = {}) {
      return getFilteredPersistent(filterBy);
    }

    /**
     * Generate a logging function.
     *
     * @param {string} type Title of the log.
     */
    function genericLog(type) {
      /**
       * Write to the console, and optionally to persistent log.
       *
       * @param {(Object|string|number)=} payload - Data associated with the
       * log entry.
       * @param {persist} boolean - Should the log entry be persisted to
       * localstorage.
       */
      function log(payload = '', persist) {
        if (LOG_TYPES[type].print) {
          toConsole({type, payload});        
        }
        if (persist) {
          addPersistent({type, payload});
        }
      }
      return log;
    }

    const exports = {print: printPersistent, raw};
    for (let type in LOG_TYPES) {
      exports[type] = genericLog(type);
    }
    return exports;
  })();

  return {
    config,
    counter,
    data,
    log,
  };
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENER module

var {
  resetReactions,
  setReactions,
  setGlobalReactions,
} = (function eventListenersModule() {
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
    'onKeydown': 'keydown',
    'onPaste': 'paste',
    /** load is handled separately */
    /** interact is handled separately */
  });

  /**
   * string[] - The events that are triggered by the special
   * 'interact' event.
   */
  const INTERACT_EVENTS = Object.freeze([
    'onClick',
    'onFocusout',
    'onKeydown',
    'onPaste',
  ]);

  /**
   * reactionStore maps HTMLElements to sets of events. Each event maps to an
   * array of reactions. When a browser event is fired by the HTMLElement,
   * all matching reactions are returned and called.
   * For example:
   * document.body => {
   *   click: [reaction, reaction],
   *   focusout: [raaction],
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
        throw new Error('Please provide an array of eventTypes');
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
     * @return {number} The new number of reaction functions now accociated with
     * this HTML element and eventType.
     */
    function set({htmlElement, eventType, functions}) {
      if (!util.isHTMLElement(htmlElement)) {
        throw new Error(htmlElement + ' is not an htmlElement');
      }
      if (!Array.isArray(functions)) {
        throw new Error('Please provide an array of functions');
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
        return string.replace('Digit', 'NumberRow');
      default:
        return '';
    }
  }
  test.group('eventToString', () => {
    const events = {
      ctrlP: {type: 'keydown', ctrlKey: true, shiftKey: false, code: 'KeyP'},
      p: {type: 'keydown', ctrlKey: false, shiftKey: false, code: 'KeyP'},
      ctrlEnter: {type: 'keydown', ctrlKey: true, code: 'Enter'},
      click: {type: 'click'},
    };
    test.ok(eventToString(events.ctrlP) === 'CtrlP', 'CtrlP');
    test.ok(eventToString(events.p) === 'P', 'P');
    test.ok(eventToString(events.ctrlEnter) === 'CtrlEnter', 'CtrlEnter');
    test.ok(eventToString(events.click) === '', 'Click');
  });

  /**
   * Maps a browser event to two descriptive strings, if possible.
   * @param {Event} event - Browser event
   * @return {string[]}
   * @example. A click event may be converted to ['click', 'click_'].
   * @example. A keydown event may be converted to ['keydown', 'keydown_CtrlA'].
   */
  function eventToEventTypes(event) {
    const eventString = eventToString(event);
    const type = 'on' + event.type.replace(/./,(d) => d.toUpperCase());
    const type_k = `${type}_${eventString}`;
    return [type, type_k];
  }
  test.group('eventToEventTypes', () => {
    const ret = eventToEventTypes({type: 'click'});
    test.ok(ret[0] === 'onClick', 'onClick');
    test.ok(ret[1] === 'onClick_', 'onClick_');
  });

  /**
   * Run an array of functions without blocking.
   * @param {function[]} functions.
   */
  function runAll(functions) {
    functions.forEach(func => {
      if (typeof func === 'function') {
        util.wait().then(func);
      } else {
        throw new Error('Not a function.');
      }
    });
  }
  test.group('runAll', () => {
    let sum = 0;
    const func = () => sum++;
    test.todo('Async');
    test.fizzle(
      () => runAll([3, 5]),
      'run an array of numbers'
    );
    test.fizzle(
      () => runAll(5),
      'run a number'
    );
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
    return util.ensureIsArray(functions).map(func => {
      const run = util.debounce(func);
      return () => run(proxy, idx, group);
    });
  }

  /**
   * Process raw reactions objects:
   * * Handle the onLoad event (by running these reactions).
   * * Handle the onInteract event (by assigning these reactions to several
   *   other event).
   * * Wrap all reactions in the relevant context (proxy, idx, group).
   */
  function unpackAndAddContext(reactions, context) {
    if (!reactions || !context) {
      throw new Error('Reactions object and context are required.');
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
      runAll(cloneReaction.onLoad);
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
  test.group('unpackAndAddContext', () => {
    const reactions = {
      onLoad: () => {},
      onClick: () => {},
      onInteract: () => {},
      name: 'Name',
    }
    const ret = unpackAndAddContext(reactions, {});
    test.ok(ret.onLoad === undefined, 'onLoad removed');
    test.ok(ret.onClick.length === 2, 'onClick added');
    test.ok(ret.name === undefined, 'name removed');
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
  function setReactions(htmlElement, reactions, context) {
    if (!util.isHTMLElement(htmlElement)) {
      throw new Error('Not an HTMLElement');
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
  function setGlobalReactions(reactions) {
    setReactions(document, reactions, {proxy: {}, idx: 0, group: []});
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

  /**
   * Respond to document level browser events.
   * Request matching reactions to events and run them.
   *
   * @param {Event} - Browser event.
   */
  function genericEventHandler(event) {
    const targetReactions = getMatchingReactions(event);
    runAll(targetReactions);
  }

  /**
   * Initialise document level event handlers.
   */
  function initGenericEventHandlers() {
    for (let type in SUPPORTED_EVENTS) {
      const eventType = SUPPORTED_EVENTS[type];
      document.addEventListener(eventType, genericEventHandler, {passive: true});
    }
  }

  (function addCheatCode() {
    const CODE = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'KeyB',
      'KeyA',
      'Backquote',
    ];
    let idx = 0;
    function cheatCodeHandler(e) {
      (e.code === CODE[idx]) ? idx++ : idx = 0;
      if (idx === CODE.length) {
        log.log('cheat mode');
      }
    }
    document.addEventListener('keydown', cheatCodeHandler, {passive: true});
  })();

  initGenericEventHandlers();
  return {
    resetReactions: reactionStore.clear,
    setReactions,
    setGlobalReactions,
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
   * @param {number} idx - Index maps to a letter from the alphabet.
   * @return {string}
   * @example - namePlusLetter('Example', 3) => 'Example C'
   */
  function namePlusLetter(name = 'Unnamed', idx) {
    const letter = String.fromCharCode(65 + idx);
    return `${name} ${letter}`;
  }

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
    }
  }

  /**
   * Touch an HTMLElement, so that GWT registers it.
   *
   * @param {HTMLElement} htmlElement
   */
  function touch(htmlElement) {
    util.wait().then(() => {
      // Blur signals a change to GWT
      htmlElement.dispatchEvent(new Event('blur'));
      htmlElement.dispatchEvent(new Event('paste'));
    });
  }

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
      log.lowLevel(`No change to ${name}'.`);
      return;
    }
    if(!EDITABLE_ELEMENT_TYPES.includes(htmlElement.type)) {
      throw new Error(`Cannot set value on ${htmlElement.type} elements`);
    }
    htmlElement.value = newValue;
    touch(htmlElement);
    log.changeValue(
      `Changing '${name}' from '${currentValue}' to '${newValue}'.`,
      true,
    );
  }

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
    const proxy = {
      name,
      value: htmlElement.value,
      get checked() {
        return htmlElement.checked;
      },
      get disabled() {
        return htmlElement.disabled;
      },
      get textContent() {
        return htmlElement.textContent;
      },
      set cssText(string) {
        htmlElement.style.cssText = string;
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
   * Attempt to append another name to the name property of an HTMLElement
   * proxy.
   *
   * @param {Object} proxy
   * @param {string} name
   * @param {number} idx
   * @return {Object} proxy
   */
  function appendToNameOfCachedProxy(proxy, name, idx) {
    if (!proxy) {
      return;
    }
    if (proxy.name.includes(name)) {
      return proxy;
    }
    try {
      proxy.name += '|' + namePlusLetter(name, idx);
    } catch (e) {
      if (e instanceof TypeError) {
        log.warn(
          `Cannot append ${name} to name of static proxy ${proxy.name}`,
        )
      } else {
        throw e;
      }
    }
    return proxy;
  }

  /**
   * Create an object that can be used to find a fresh HTMLElement on the page.
   * This is based on the original values passed into the ー function.
   *
   * @param {Object} options
   * @param {number} idx
   */
  function makeFreshSelector(options, idx) {
    const {select, pick} = options;
    return {
      select,
      pick: [pick[idx]],
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
    if (!util.isHTMLElement(htmlElement)) {
      throw new Error('Not an HTMLElement');
    }
    const cached = htmlElementWeakMap.get(htmlElement);
    if (cached && options.mode === 'fresh') {
      options.mode = cached.mode;
    } else if (cached) {
      if (cached.mode !== options.mode && false) { // @todo Fix warning
        log.warn(
          `Didn't change ${options.name} element mode from ${cached.mode}` +
          ` to ${options.mode}`,
          true,
        )
      }
      return appendToNameOfCachedProxy(cached, options.name, idx);
    } else if (options.mode === 'fresh') {
      mode = 'static';
    }
    const proxy = makeProxy({
      htmlElement,
      name: namePlusLetter(options.name, idx),
      mode: options.mode,
      freshSelector: makeFreshSelector(options, idx),
    });
    if (options.mode !== 'fresh') {
      htmlElementWeakMap.set(htmlElement, proxy);
    }
    return proxy;
  }

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
   */
  function getHtmlElements({rootSelect, rootNumber, select, pick}) {
    if (!pick) {
      throw new Error(
        'Required paramers missing: ' +
        util.mapToBulletedList([rootSelect, rootNumber, select, pick]),
      )
    }
    const simpleSelect = () => {
      return [...document.querySelectorAll(select)];
    }
    const complexSelect = () => {
      return [...document.querySelectorAll(rootSelect)][rootNumber]
          .querySelectorAll(select || '*');
    }
    const allElements = (rootSelect) ? complexSelect() : simpleSelect();
    const pickedElements = [];
    for (let number of pick) {
      const picked = allElements[number];
      if (picked) {
      pickedElements.push(picked);
      }
    }
    return pickedElements;
  }

  /**
   * Set event reactions on an HTMLElement.
   *
   * @param {Object[]} htmlElements
   * @param {Object[]} proxies
   * @param {Object} options - All properties in the options object for which
   * the name begins with 'on' will be processed.
   */
  function setAllReactions(htmlElements, proxies, options) {
    const reactions = {};
    for (let prop in options) {
      if (/^on/.test(prop)) {
        reactions[prop] = options[prop];
      }
    }
    proxies.forEach((proxy, idx, group) => {
      const htmlElement = htmlElements[idx];
      const context = {proxy, idx, group};
      setReactions(htmlElement, reactions, context);
    });
  }

  const ref = {};

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
    if (options.mode !== 'fresh') {
      setAllReactions(htmlElements, proxies, options);
    }
    if (options.ref) {
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

  const guiState = Object.seal({
    stage: 0,
    counters: {},
    issues: [],
  });

  function setState(packet) {
    for (let prop in packet) {
      const incoming = packet[prop];
      const state = guiState[prop];
      if (state === undefined) {
        throw new Error(`Unknown gui state property: ${prop}`);
      }
      if (
        Array.isArray(incoming) &&
        util.doArraysMatch(state, incoming)
      ) {
        return false;
      }
      guiState[prop] = incoming;
    }
    return true;
  }

  function makeUl({title, elements, valueProp, titleProp}) {
    if (elements.length < 1) {
      return '';
    }
    const mappedToLi = elements.map(el => {
      return `<li>${el[valueProp]}: <em>${el[titleProp]}</em></li>`;
    });
    return (
        `<h4 style="padding: 0 0 0 10px">${title}</h4>` +
        `<ul id=${BASE_ID}_${title}>${mappedToLi.join('')}</ul>`
    );
  }

  const mainGui = (function mainGuiModule() {
    const frame = document.createElement('div');
    frame.id = BASE_ID + 'mainGui'
    frame.style.cssText = `
      background: rgba(255,255,200,0.8);
      bottom: 0px;
      height: auto;
      left: 0px;
      pointer-events: none;
      position: fixed;
      width: 100%;
      z-index: 2000;
    `;
    document.body.append(frame);
    function update() {
      const issues = guiState.issues;
      const counters = Object.entries(guiState.counters);
      frame.innerHTML =
          makeUl({
            title: 'Issues',
            elements: issues,
            valueProp: 'issueType',
            titleProp: 'message',
          }) + 
          makeUl({
            title: 'Counters',
            elements: counters,
            valueProp: 1,
            titleProp: 0,
          });
    }
    update = util.debounce(util.delay(update));
    return update;
  })();

  const paintBorders = (function paintBorderModule() {
    const issueBorders = [];

    /**
     * Add a div to the DOM with specified coordinates.
     *
     * @param {Object} o
     * @param {number} 0.top
     * @param {number} 0.left
     * @param {number} 0.width
     * @param {number} 0.height
     */
    function paintBorder({top, left, width, height}) {
      const div = document.createElement('div');
      div.style.cssText = `
        box-shadow: 0 0 6px orange;
        border-width: 0;
        height: ${height}px;
        left: ${left}px;
        pointer-events: none;
        position: absolute;
        top: ${top}px;
        width: ${width}px;
        z-index: 2000;
      `;
      issueBorders.push(div);
      document.body.appendChild(div);
    }

    /**
     * Paints borders around every HTMLElement proxy that has been 
     */
    function update() {
      issueBorders.forEach((div) => document.body.removeChild(div));
      issueBorders.length = 0;
      guiState.issues
          .map(issue => issue.proxy.getCoords())
          .forEach(paintBorder);
    }
    return update;
  })();

  /**
   * Merges new data into the local gui state, and triggers and update of
   * the gui.
   *
   * @param {Object} packet - Data to be merged into the gui's state.
   */
  function update(packet) {
    if (setState(packet)) {
      mainGui();
      paintBorders();
    }
  }

  /**
   * Sets a listener on the document for gui updates.
   */
  function addGuiUpdateListener() {
    document.addEventListener('guiUpdate', ({detail}) => {
      const packet = detail;
      update(packet);
    }, {passive: true});
    document.addEventListener('scroll', () => {
      paintBorders();
    }, {passive: true});
  }
  addGuiUpdateListener();
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
    fallThrough(1,0,[a,b]);
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

  async function submit(button) {
    if (!button || !button.click) {
      throw new Error('Submit requires a valid submit button proxy');
    }
    log.notice('Submitting', true);
    await util.wait(100);
    button.click();
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

  function ratingHome(main) {
    ー({
      name: 'Select',
      select: 'select',
      pick: [0, 1, 2],
      mode: 'programmable',
      onClick: shared.toggleSelectYesNo,
    });

    setGlobalReactions({
      onKeydown_Backquote: main,
    });
  }

  function slDutch(main) {
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
      name: 'Url',
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
    });ー({
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
      mode: 'programmable',
      onFocusin: shared.removeDashes,
      onFocusout: shared.addDashes,
      onLoad: shared.addDashes,
    });

    function save() {
      const values = ー({
        name: 'Save',
        select: 'textarea',
        pick: [1, 2, 3, 6, 7, 10, 11, 14, 15, 18, 19],
        mode: 'programmable',
      }).map(element => element.value);
      const domain = util.getDomain(values[0]);
      const data = {[domain]: values.slice(1)};
      shared.saveExtraction(data);
    }

    setGlobalReactions({
      onKeydown_Backquote: main,
      onKeydown_BracketLeft: shared.resetCounter,
      onKeydown_BracketRight: shared.skipTask,
      onKeydown_CtrlAltS: save,
    });
  }

  function playground(main) {
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
      const submitButton = ref.submitButton;
      stage = -1;
      autoSaveExtraction();
      shared.submit(submitButton);
      counter.add('Submit');
    }

    function setStage(n) {
      stage = n;
      main();
    }

    const stages = [
      editStage,
      readyToSubmitStage,
    ];

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

      [[2,3],[6,7],[10,11], [14,15]].forEach(pair => {
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

    stages[stage]();
  }

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
  flowInitializer(main);
};

main();


/**
 * @todo Find prefill (check key elements for matching values,
 * write to other elements)
 *
 * @todo Data store for prefill and the like
 *
 * @todo Handle scrolling within divs
 *
 * @todo Redesign wrap mode to create different level proxies each time
 * with context determined when wrapping.
 */
