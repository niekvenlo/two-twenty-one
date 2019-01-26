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
    test.ok(doArraysMatch([3,4,7], [3,4,5]) === false, 'One mismatch');
    test.ok(doArraysMatch([5,3,4], [3,4,5]) === false, 'Different order');
  });

  /**
   * Test whether an object exposes the same properties as a template object.
   *
   * @param {object} template - Object that exposes all required properties.
   * @param {object} toTest - Object to test.
   * @return {boolean} Does the toTest object expose all the properties
   * exposed by the template?
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
// DATA module

var {
  config,
  counter,
  data,
  log,
} = (function dataModule() {
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
   * Dispatch GUI update packets. The GUI module  is reponsible for
   * integrating packets into a consistent state.
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
      localStorage.setItem(
        LOCALSTORE_BASENAME + itemName,
        JSON.stringify(obj),
      );
    }
  };

  /**
   * Track configuration settings. Settings are loaded from localStorage on
   * load, but changes are not persisted by default.
   * #get(name) returns a value if a config setting is loaded, or undefined.
   * #set(name, newValue, save) adds a value to the config object in memory
   * and optionally updates the config options stored in localStorage.
   * #raw() returns the config object in memory and exists mostly for
   * debugging.
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
        util.wait().then(() => { // @todo Fix wait hack. Used for testing.
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
  * Object with methods to log events. The following is true for most
  * methods:
  * * @param {Object|string} payload
  * * @param {Boolean} persist Should the event be persisted to
  *   localstorage?
  */
  const log = (function loggingModule() {

    /**
     * Generate a string from a log entry, in order to print to the console.
     *
     * @param {Object | string} payload Data associated with the log entry.
     * @param {number} space Number of spaces to include in front of new
     * lines.
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
     * @time {Date=} Optionally, provide a Date for the timestamp.
     */
    function toConsole({type, payload, time = new Date()}) {
      const color =
          (LOG_TYPES[type] && LOG_TYPES[type].color) || NO_COLOR_FOUND;
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
     * @param {Object|string} entry.payload - Data associated with the
     * log entry.
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
   * reactionStore maps HTMLElements to sets of events. Each event maps to
   * an array of reactions. When a browser event is fired by the
   * HTMLElement all matching reactions are returned and called.
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
     * @return {number} The new number of reaction functions now accociated
     * with this HTML element and eventType.
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
        return string;
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
      document.addEventListener(
        eventType,
        genericEventHandler,
        {passive: true}
      );
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
      set textContent(newValue) {
        htmlElement.textContent = newValue;
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
   * @param {Object} options - All properties in the options object for
   * which the name begins with 'on' will be processed.
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

  const ref = {
    fresh(name) {
      const cached = ref[name] || [];
      return cached.map(element => element.fresh()[0]);
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
