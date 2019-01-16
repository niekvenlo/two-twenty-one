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
    enclosedInGroup = true;
    func();
    enclosedInGroup = false;
  };

  const confirmEnclosure = () => {
    if (!enclosedInGroup) {
      throw new Error('Please enclose the test within a group');
    }
  }

  /**
   * Test a statement for truth.
   *
   * @param {boolean} statement - Truthy or falsy statement
   * @param {?string} itemDesc - Description of test item.
   */
  const ok = (statement, itemDesc) => {
    confirmEnclosure();
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
    confirmEnclosure();
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
    confirmEnclosure();
    try {
      throwingFunc();
      log('ok', ' OK: ' + itemDesc + ' is solid');
    } catch (e) {
      log('fail', ' FAIL: ' + itemDesc + ' is not solid');
      failuresRecorded = true;
    }
  }

  // Automatically print results if there's a fail result.
  setTimeout(() => {
    if (failuresRecorded) {
      print();
    }
  }, AUTO_PRINT_DELAY);

 return {fizzle, group, ok, print, solid};
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
   * Test whether an object exposes the same properties as a template object.
   *
   * @param {object} template - Object that exposes all required properties.
   * @param {object} toTest - Object to test.
   * @return {boolean} Does the toTest object expose all the properties exposed
   * by the template?
   */
  function objectMatchesTemplate(template, toTest = {}) {
    for (let property in
     template) {
      if (toTest[property] === undefined) {
        return false;
      }
    }
    return true;
  }

  /**
   * Test whether an object is a DOM element. Uses simple duck typing.
   *
   * @param {Object=} domElement - Object to be tested
   * @return {boolean} Returns true if a dom element is passed in.
   */
  function isDomElement(domElement) {
    return objectMatchesTemplate({parentNode: 5}, domElement);
  }
  test.group('isDomElement', () => {
    test.ok(!isDomElement({}), 'An object is not');
    test.ok(isDomElement(document), 'The document');
    test.ok(isDomElement(document.body), 'Document body');
  });

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

  return {bundle, debounce, isDomElement, objectMatchesTemplate, wait};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// REPORTING module

var {config, counter, flag, log} = (function reportingModule() {
  'use strict';

  /**
   * @fileoverview Exposes objects to keep track of things.
   * * config - manage configuration settings.
   * * counter - count things.
   * * flag - flag issues.
   * * log - log things.
   */

  const LOCALSTORE_BASENAME = 'twoTwenty';
  const CONFIG_STORE_NAME = 'Configuration';
  const COUNTER_STORE_NAME = 'Counter';

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
    document.dispatchEvent(
        new CustomEvent('guiUpdate', {detail: packet})
    );
  }
  test.group('updateGui', () => {
    let received;
    let testPacket = {packet: 'packet'};
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
      log.changeConfig(`${name} changed to '${newValue}'`)
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
      const /** object */ allCounts = localStore.get(COUNTER_STORE_NAME);
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
      const allCounts = localStore.get(COUNTER_STORE_NAME);
        return allCounts[name] || -1;
    }

    /**
     * @param {string=} name - Name of the counter to reset.
     */
    function reset(name) {
      if (typeof name !== 'string' && name !== undefined) {
        throw new Error('Counter reset expects a name string or nothing');
      }
      const allCounts = localStore.get(COUNTER_STORE_NAME);
      if (name) {
        const currentCount = allCounts[name];
        util.wait().then(() => { // @todo Fix wait hack. Used for testing only.
          log.notice(
            `Resetting counter ${name} from ${currentCount}`,
            true,
          ), 0
        });
        allCounts[name] = 0;
      } else {
        log.notice(
          `Resetting all counters: ${JSON.stringify(allCounts)}`,
          true,
        );
        allCounts = {};
      }
      localStore.set(COUNTER_STORE_NAME, allCounts);
      updateGui({counters: allCounts});
      return 0;
    }
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

  let flaggedConcerns = [];

  /**
   * Issue tracker. Integrates updates into a consistent list of currently
   * unresolved concerns.
   * 
   * @param {Object} newConcern - Incoming message. This may refer to a new
   * concern, or update the status of a previous issue.
   * @param {Object} newConcern.wrapper - DOM element wrapper.
   * @param {string} newConcern.type - The type of concern.
   * @param {string} newConcern.category - How critical is this concern?
   * @param {string} newConcern.message - Describes the details of the concern.
   * @example
   * {wrapper, type: 'Typo', category: 'red', message: 'Wrod is misspelled'}
   */
  function flag(newConcern) {
    const template = {wrapper: true, type: true, category: true};
    if (!util.objectMatchesTemplate(template, newConcern)) {
      throw Error('Not a valid concern.');
    }
    /**
     * Filter function to remove concerns that match the incoming concern. Compares wrapper
     * type properties.
     *
     * @param {Object} concern
     */
    const removeMatching = (concern) => {
      const sameWrapper = (concern.wrapper === newConcern.wrapper);
      const sameType = (concern.type === newConcern.type);
      return !(sameWrapper && sameType);
    };
    /**
     * Filter out concerns that with a category property of 'ok'.
     *
     * @param {Object} concern
     */
    const removeOk = (concern => concern.category !== 'ok');
    flaggedConcerns = flaggedConcerns.filter(removeMatching);
    flaggedConcerns.push(newConcern);
    flaggedConcerns = flaggedConcerns.filter(removeOk);
    updateGui({concerns: flaggedConcerns});
  }
  test.group('flag', () => {
    test.fizzle(() => flag(), 'Without a concern');
    // @todo Better tests.
  });

  /**
  * Object with methods to log events. The following is true for most methods:
  * * @param {Object|string} payload
  * * @param {Boolean} persist Should the event be persisted to localstorage?
  */
  const log = (function loggingModule() {
    const STORE_NAME = 'LogBook';
    const LOG_LENGTH_MAX = 5000;
    const LOG_LENGTH_MIN = 4000;
    const LOG_PAGE_SIZE = 25;
    const NO_COLOR_FOUND = 'yellow';
    const TIMESTAMP_COLOR = 'color: grey';
    const LOG_TYPES = {
      log: 'black',
      notice: 'DodgerBlue',
      warn: 'OrangeRed',
      ok: 'LimeGreen',
      lowLevel: 'Gainsboro',
      changeValue: 'LightPink',
      changeConfig: 'MediumOrchid',
    };

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
      const color = LOG_TYPES[type] || NO_COLOR_FOUND;
      const ts = timestamp(time);
      const string = payloadToString(payload, ts.length);
      console.log(`%c${ts} %c${string}`, TIMESTAMP_COLOR, `color: ${color}`);
    }

    /**
     * Retrieve an array of all log entries. Timestamps are recast into Date
     * objects.
     *
     * @return {Array<Object>} Array of entries. 
     */
    function getPersistent() {
      const logBook = localStore.get(STORE_NAME);
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
      if (entries.length > LOG_LENGTH_MAX) {
        entries = entries.slice(-LOG_LENGTH_MIN);
      }
      localStore.set(STORE_NAME, {entries});
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
     * @return {Array<Object>}
     * @example - printPersistent({before: new Date('2019-01-17')});
     */
    function getFilteredPersistent(filterBy = {}) {
      const filters = {
        type: entry => entry.type === filterBy.type,
        notType: entry => entry.type !== filterBy.notType,
        after: entry => entry.time > filterBy.after,
        before: entry => entry.time < filterBy.before,
        regex: entry => filterBy.regex.test(entry.payload),
      }
      let entries = getPersistent();
      for (let filterType in filterBy) {
        if (filterType === 'page') {
          continue;
        }
        entries = entries.filter(filters[filterType]);
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
        (getPersistent.length < LOG_PAGE_SIZE),
        'Get a full page from the log, if possible',
      );
    });

    /**
     * Print a filtered part of the persistent log.
     *
     * @param {Object=} filterBy Filter parameters.
     * @return {Array<Object>}
     * @example printPersistent({before: new Date()});
     */
    function printPersistent(filterBy = {}) {
      getFilteredPersistent(filterBy).forEach(entry => toConsole(entry));
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
        toConsole({type, payload});
        if (persist) {
          addPersistent({type, payload});
        }
      }
      return log;
    }

    const toExport = {print: printPersistent};
    for (let type in LOG_TYPES) {
      toExport[type] = genericLog(type);
    }
    return toExport;
  })();

  return {config, counter, flag, log};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// GUI module

var gui =
    (function guiModule() {
  'use strict';

  /**
   * @fileoverview Maintains the graphical interface and
   * associated data, and exposes an update method to send
   * updates to the data and trigger an update.
   * A custom event listener may replace or supplement the
   * update function.
   */

  let guiState = {
    stage: 0,
    counters: {},
    concerns: [],
  };

  /**
   * Merges new data into the local gui state, and triggers and update of
   * the gui.
   *
   * @param {Object} packet - Data to be merged into the gui's state.
   */
  function update(packet) {
    guiState = {...guiState, ...packet};
    if (guiState.concerns.length > 0) {
      log.log(JSON.stringify(guiState));
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
  }
  addGuiUpdateListener();

  return {update};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENER module

var {setReactions, setGlobalReactions} = (function eventListenersModule() {
  'use strict';

  /**
   * @fileoverview Sets global event listeners, and exports
   * functions through which functions can be registered.
   * Reaction functions are registered to a DOM element and
   * a browser event, and are called when a matching browser
   * event is issued by the matching DOM element.
   * This basically emulates setting several event listeners
   * on each DOM element.
   */

  /**
   * Array<string>} The events that can be set on a DOM element.
   */
  const SUPPORTED_EVENTS = Object.freeze([
    'change',
    'click',
    'focusin',
    'focusout',
    'keydown',
    'paste',
    /** load is handled separately */
    /** interact is handled separately */
  ]);

  /**
   * Array<string>} The events that are triggered by the special
   * 'interact' event.
   */
  const INTERACT_EVENTS = Object.freeze([
    'click',
    'focusout',
    'keydown',
    'paste',
  ]);

  /**
   * WeakMap - Maps DOM elements to reaction objects.
   */
  const reactionMap = new WeakMap();

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
   * @return {Array<string>}
   * @example. A click event may be converted to ['click', 'click_'].
   * @example. A keydown event may be converted to ['keydown', 'keydown_CtrlA'].
   */
  function eventToStrings(event) {
    const eventString = eventToString(event);
    const type = `${event.type}`;
    const type_k = `${event.type}_${eventString}`;
    return [type, type_k];
  }

  /**
   * Run an array of functions.
   * @param {Array<function>} functions.
   */
  function runAll(functions) {
    if (!functions) {
      return;
    }
    functions.forEach(func => {
      if (typeof func === 'function') {
        func();
      } else {
        throw new Error('Not a function.');
      }
    });
  }

  test.group('runAll', () => {
    let sum = 0;
    const func = () => sum++;
    runAll([func, func, func]);
    test.ok(
      sum === 3,
      'run three functions'
    );
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
   * Integrate two sets of reactions.
   */
  function mergeReactions(one, two) {
    if (!one || !two) {
      throw new Error('Need two reactions to merge');
    }
    const oneClone = {...one};
    const twoClone = {...two};
    for (let type in oneClone) {
      if (twoClone[type]) {
        oneClone[type] = [...oneClone[type], ...twoClone[type]];
      }
    }
    return {...twoClone, ...oneClone};
  }
  test.group('mergeReactions', () => {
    test.solid(() => mergeReactions({},{}), 'it runs');
    const one = {click: [1, 2], paste: [5]};
    const two = {click: [3, 4], change: [6]};
    const merged = mergeReactions(one, two);
    test.ok(merged.click.length === 4, 'merge click, test 1');
    const uniqueValues = new Set([...merged.click]).size;
    test.ok(uniqueValues === 4, 'merge click, test 2');
    test.ok(merged.paste.length === 1, 'merge paste');
    test.ok(merged.change.length === 1, 'merge change');
    test.fizzle(() => mergeReactions({}), 'requires two objects');
  });

  /**
   * @param {Object<string: Object>} reactions - Map of event
   * types to arrays of functions.
   * Event types can be, for example, 'click' or 'onClick'
   * but will be changed to 'click'.
   * @param {Object<string: Object>} context - Context for
   * the reaction functions.
   */
  function wrapReactions(reactions, context) {
    /**
     * @param {Array<function>} reactions
     * return {Array<function>}
     */
    function wrapReaction(reaction) {
      /**
       * @param {function} func - Function to be wrapped
       * with context.
       * @return {function}
       */
      function wrapFunction(func) {
        /**
         * wrapper, idx and group come from scope.
         * @return {function}
         */
        function wrappedWithContext() {
          return func(wrapper, idx, group);
        }
        return wrappedWithContext;
      }
      if (!Array.isArray(reaction)) {
        // Reaction is a single function.
        return [wrapFunction(reaction)];
      }
      return reaction.map(wrapFunction);
    }
    const wrapped = {};
    const {wrapper, idx, group} = context;
    for (let type in reactions) {
      if (!/^on/.test(type)) {
        continue;
      }
      const simpleType = // @todo Rewrite
          type.replace(/^on([^_]+)/, (a,b) => b.toLowerCase());
      wrapped[simpleType] = wrapReaction(reactions[type]);
    }
    return wrapped;
  }
  test.group('wrapReactions', () => {
    const func1 = (wrapper, idx, group) => idx + 1;
    function func2(wrapper, idx, group) {
      return idx + 1;
    }
    const mockReaction =
        {onClick: [func1, func2], onPaste: [func1]};
    const mockContext = {wrapper: {}, idx: 4, group: []};
    const wrapped = wrapReactions(mockReaction, mockContext);
    let tmp;
    test.solid(() => (tmp = wrapped.click[0]()), 'test 1');
    test.ok(tmp === 5, 'test 2');
    test.fizzle(() => wrapped.click[2](), 'test 3');
    tmp = wrapped.click[1]();
    test.ok(tmp === 5, 'test 5');
  });

  /**
   * We permit two special events:
   * - interact (or onInteract)
   * - load (or onLoad)
   * Setting a reaction on the interact event assigns the
   * reaction to several other events, such as change & click.
   * onInteract is shorthand for onClick, onFocusin, etc.
   * Setting a reaction on the load event immediately calls it.
   * @param {Object} reactions
   * @return {Object}
   */
  function unpackInteractAndLoadReaction(reactions) {
    const reactionsClone = {...reactions};
    if (reactionsClone.load) {
      runAll(reactionsClone.load);
    }
    if (!reactionsClone.interact) {
      return reactionsClone;
    }
    const unpacked = {};
    const interactions =
        reactionsClone.interact.map(func => util.debounce(func, 500));
    for (let type of INTERACT_EVENTS) {
      unpacked[type] = interactions;
    }
    delete reactionsClone.interact;
    delete reactionsClone.load;
    return mergeReactions(reactionsClone, unpacked);
  }

  test.group('unpackInteractAndLoadReaction', () => {
    let mock = {};
    let length = (obj) => Object.keys(obj).length;
    const func = unpackInteractAndLoadReaction;
    test.ok(length(func(mock)) === 0, 'null');
    mock = {interact: [() => 5]};
    test.ok(length(func(mock)) === 4, 'test 1');
    test.ok(func(mock).click[0]() === 5, 'test 2');
    test.ok(func(mock).interact === undefined, 'test 3');
    mock = {interact: [() => 5], click: [() => 7]};
    test.ok(length(func(mock)) === 4, 'test 4');
    test.ok(length(func(mock).click) === 2, 'test 5');
    let tmp = 0;
    const increment = () => tmp++;
    mock = {load: [increment]};
    test.solid(() => func(mock), 'test 6');
    test.ok(tmp === 1, 'test 7');
  });

  /**
   * For a DOM element, attach additional reaction functions.
   * @param {DomElement} domElement - The element to which
   * the reactions should be attached.
   * @param {Object<string: Array<function>>} reactions - A
   * map of event types to arrays of functions.
   * @param {Object} - Context about the way in which the
   + functions should be invoked, i.e. what group of wrappers
   * these reactions were attached to and which one triggered
   * the functions.
   */
  function setReactions(domElement, reactions, context) {
    if (!util.isDomElement(domElement)) {
      throw new Error('Not a DOM element');
    }
    const prior = reactionMap.get(domElement) || {};
    const additional =
        unpackInteractAndLoadReaction(
            wrapReactions(reactions, context)
        );
    const allReactions = mergeReactions(prior, additional);
    reactionMap.set(domElement, allReactions);
  }

  function setGlobalReactions(reactions) {
    const allReactions =
        unpackInteractAndLoadReaction(
            wrapReactions(reactions, {})
        );
    reactionMap.set(document, allReactions);
  }

  function getTargetReactions(event) {
    const target = event.target;
    const targetReactions = reactionMap.get(target);
    const globalReactions = reactionMap.get(document);

    const [type, type_k] = eventToStrings(event);

    const collection = [];
    if (targetReactions) {
      if (targetReactions[type_k]) {
        collection.push(...targetReactions[type_k] || [])
      }
      if (targetReactions[type]) {
        collection.push(...targetReactions[type] || [])
      }
    }
    if (globalReactions) {
      if (globalReactions[type_k]) {
        collection.push(...globalReactions[type_k] || [])
      }
      if (globalReactions[type]) {
        collection.push(...globalReactions[type] || [])
      }
    }
    return collection;
  }

  /**
   * Respond to document level browser events.
   * Find matching reactions to events and run them.
   * @param {Event} - Browser event.
   */
  function genericEventHandler(event) {
    const targetReactions = getTargetReactions(event);
    util.wait().then(() => runAll(targetReactions));
  }

  /**
   * Initialise document level event handlers.
   */
  function initGenericEventHandlers() {
    for (let type of SUPPORTED_EVENTS) {
      document.addEventListener(type, genericEventHandler, {passive: true});
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
  return {setReactions, setGlobalReactions}
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// DOM ACCESS module

var {wrap} = (function domAccessModule() {
  'use strict';

  /**
   * Exports the wrap function, which enables and regulates
   * DOM access. Wrapper objects for DOM elements are returned
   * which expose a limited number of methods, and which log
   * changes.
   */

  const domElementWeakMap = new WeakMap(); // Should use const

  const EDITABLE_ELEMENT_TYPES =
      Object.freeze(['textarea', 'select-one', 'text']);

  /**
   * @param {Object}
   * @return {Array<DomElement>}
   */
  function findInDom(querySelector, pickElements) {
    let greedy = (() => {
      if (Array.isArray(querySelector)) {
        const [rootType, pickOne] = querySelector;
        return [...document.querySelectorAll(rootType)][pickOne]
            .querySelectorAll();
      } else {
        return [...document.querySelectorAll(querySelector)];
      }
    })();
    const picky = [];
    for (let one of pickElements) {
      const picked = greedy[one];
      if (picked) {
      picky.push(greedy[one]);
      }
    }
    return picky;
  }

  function getFreshElement(elementSelector, name) {
    const {domSelector, pickElements} = elementSelector;
    return findAndProcessDomElements(
        domSelector, pickElements, 'fresh', 'Fresh ' + name
    )[0];
  }

  function isHidden(domElement) {
    return (domElement.offsetParent === null);
  }

  function namePlusLetter(name = 'Unnamed', idx) {
    const letter = String.fromCharCode(65 + idx);
    return `${name} ${letter}`;
  }

  function safeSetter(domElement, name, newValue) {
    const currentValue = domElement.value;
    if (currentValue === newValue) {
      log.lowLevel(`No change to ${name}'.`);
      return;
    }
    if(!EDITABLE_ELEMENT_TYPES.includes(domElement.type)) {
      throw new Error(`Cannot set value on ${domElement.type} elements`);
    }
    domElement.value = newValue;
    eventDispatcher(domElement, 'blur');
    log.changeValue(
      `Changing '${name}' from '${currentValue}' to '${newValue}'.`,
      true,
    );
  }

  function getWrapper(domElement, mode, name, elementSelector) {
    const cached = domElementWeakMap.get(domElement);
    if (cached && mode === 'fresh') {
      mode = cached.mode;
    } else if (cached) {
      if (cached.mode !== mode) {
        log.warn(
          `Didn't change ${name} element mode from ${cached.mode}.`,
          true,
        )
      }
      return cached;
    } else if (mode === 'fresh') {
      mode = 'static';
    }

    const wrapper = {
      value: domElement.value,
      name: name,
      get checked() {
        return domElement.checked;
      },
      get disabled() {
        return domElement.disabled;
      },
      get textContent() {
        return domElement.textContent;
      },
      set cssText(string) {
        domElement.style.cssText = string;
      },
      click() {
        domElement.click();
      },
      blur() {
        domElement.blur();
      },
      focus() {
        domElement.focus();
      },
      scrollIntoView() {
        domElement.scrollIntoView();
      },
      toString() {
        return `${name}: ${domElement.value}`;
      },
      fresh() {
        return getFreshElement(elementSelector, name);
      },
      unsafe() {
        return domElement;
      },
    }
    function goodSetter(value) {
      safeSetter(domElement, name, value)
    }
    function brokenSetter(newValue) {
      throw new Error(
          `Cannot set value of ${this.name} to '${newValue}'. ` + 
          `Element is not programmatically editable.`
      );
    }

    wrapper.mode = mode;
    if (mode === 'static') {
      return Object.freeze({...wrapper});
    }
    if (mode === 'programmable') {
      Object.defineProperty(
        wrapper, 'value', {get: () => domElement.value, set: goodSetter,}
      );
      return Object.seal(wrapper);
    }
    if (mode === 'user-editable') {
      Object.defineProperty(
        wrapper, 'value', {get: () => domElement.value, set: brokenSetter,}
      );
      return Object.seal(wrapper);
    }
  }

  function wrapElement(domElement, idx, options) {
    if (!util.isDomElement(domElement)) {
      throw new Error('Not a DOM element');
    }
    const {domSelector, pickElements, mode, name} = options;
    const elementSelector = {domSelector, pickElements: [pickElements[idx]]};
    const nameA = namePlusLetter(name, idx);
    const wrapper = getWrapper(domElement, mode, nameA, elementSelector);
    if (mode !== 'fresh') {
      domElementWeakMap.set(domElement, wrapper);
    }
    return wrapper;
  }

  function setAllReactions(domElements, wrappers, reactions) {
    wrappers.forEach((wrapper, idx, group) => {
      const domElement = domElements[idx];
      const context = {wrapper, idx, group};
      setReactions(domElement, reactions, context);
    });
  }

  function findAndProcessDomElements(domSelector, pickElements, mode, name, reactions) {
    if (!domSelector || !pickElements) {
      throw new Error('Missing selector parameters.');
    }
    const domElements = findInDom(domSelector, pickElements);
    const options = {domSelector, pickElements, mode, name};
    const wrappers = domElements.map((element,idx) => {
      return wrapElement(element, idx, options);
    });
    if (mode !== 'fresh') {
      setAllReactions(domElements, wrappers, reactions);
    }
    return wrappers;
  }

  /**
   * Dispatch simple events to DOM elements.
   */
  function eventDispatcher(domElement, type) {
    util.wait(20).then(() => domElement.dispatchEvent(new Event(type)));
  }

  return {wrap: findAndProcessDomElements};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// WORKFLOW METHODS module

var shared = (function workflowMethodsModule() {
  'use strict';
 
  /**
   * @fileoverview Exports an object packed with methods
   * designed to add reactions to wrappers.
   */

  const {changeValue, redAlert, orangeAlert, yellowAlert} =
      (function responseMiniModule() {
    function changeValue({to, when}) {
      if (typeof when !== 'function') {
        throw new Error('ChangeValue requires a function');
      }
      if (typeof to !== 'string') {
        throw new Error('ChangeValue requires a new string value');
      }
      return function (...params) {
        const {hit, wrapper} = when(...params);
        if (hit) {
          wrapper.value = to;
        }
      }
    }

    function createAlert(color) {
      return function colorAlert({type, when}) {
        if (typeof when !== 'function') {
          throw new Error('ChangeValue requires a function');
        }
        if (typeof type !== 'string') {
          throw new Error('ChangeValue requires a new string value');
        }
        return function (...params) {
          util.wait(20).then(() => {
            const {wrapper, hit, message} = when(...params);
            const category = (hit) ? color : 'ok';
            flag({wrapper, type, category, message});
          });
        }
      }
    }
    return {
      redAlert: createAlert('red'),
      orangeAlert: createAlert('orange'),
      yellowAlert: createAlert('yellow'),
      changeValue,
    }
   })();

  function testRegex (regex, shouldMatch) {
    return (wrapper) => {
      const hit = regex.test(wrapper.value) === shouldMatch;
      const yesOrNo = shouldMatch ? '' : 'not';
      const message = `${wrapper.value} should ${yesOrNo} match ${regex}`;
      return {wrapper, message, hit};
    }
  };

  function testLength ({min, max}) {
    return (wrapper) => {
      const length = wrapper.value.length;
      let message;
      let hit = false;
      if (min && min > length) {
        message = 'Value is too short';
        hit = true;
      }
      if (max && max < length) {
        message = 'Value is too long';
        hit = true;
      }
      return {wrapper, hit, message: message};
    }
  };

  function testDuplicates (wrapper, idx, group) {
    const filledIn = group.map(d => d.value).filter(v => v);
    const uniqueElements = new Set(filledIn).size;
    const totalElements = filledIn.length;
    const hit = (uniqueElements !== totalElements);
    const message = `Duplicate values: ${filledIn.sort()}`;
    return {wrapper, message, hit};
  };

  function fallThrough (wrapper, idx, group) {
    if (idx > 0) {
      return;
    }
    util.wait(0).then(() => {
      group[1].value = wrapper.value;
      group[0].value = 'Moved';
      log.notice(
        `Fallthrough: '${group[1].value}' became '${group[0].value}'`,
        true,
      );
    });
  };

  function toggleSelectYesNo (wrapper) {
    wrapper.value = (wrapper.value === 'no') ? 'yes' : 'no';
    wrapper.blur();
  }

  return {
    fallThrough,
    toggleSelectYesNo,

    addDashes: changeValue({
      to: '---',
      when: testRegex(/^$/, true),
    }),
    redAlertOnExceeding25Chars: redAlert({
      type: 'More than 25 characters long',
      when: testLength({max: 25}),
    }),
    redAlertOnDupe: redAlert({
      type: 'Duplicate values',
      when: testDuplicates,
    }),
    removeDashes: changeValue({
      to: '',
      when: testRegex(/---/, true),
    }),
    removeUrl: changeValue({
      to: '',
      when: testRegex(/^http/, true),
    }),
  }
}
)();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// WORKFLOW module

var {detectWorkflow, flows} = (function workflowModule() {
  // @todo Check the dom for signs (ideally using wrap).
  function detectWorkflow() {
    return 'ratingHome';
  }

  function ratingHome() {
    const textboxBundle = util.bundle(
        shared.redAlertOnExceeding25Chars,
        shared.redAlertOnDupe,
    );
    wrap('textarea', [0,1,2], 'programmable', 'Text', {
      onFocusOut: textboxBundle,
      onLoad: textboxBundle,
      onPaste: textboxBundle,
    });

    wrap('textarea', [3,4,5], 'programmable', 'NoUrl', {
      onFocusOut: shared.removeUrl,
      onPaste: shared.removeUrl,
    });

    wrap('textarea', [6,7,8], 'programmable', 'Dashes', {
      onFocusIn: shared.removeDashes,
      onFocusOut: shared.addDashes,
      onLoad: shared.addDashes,
    });
    
    [[0,3],[1,4],[2,5]].forEach(pair => {
      wrap('textarea', pair, 'programmable', 'Fall', {
        onPaste: shared.fallThrough,
      });
    });

    wrap('select', [0,1], 'programmable', 'Select', {
      onClick: shared.toggleSelectYesNo,
    });

    setGlobalReactions({
      onKeydown_Backquote: () => log.ok('Start'),
      onKeydown_Backslash: () => log.ok('Approve'),
      onKeydown_BracketLeft: () => log.ok('Counter'),
      onKeydown_BracketRight: () => log.ok('Skip'),
    });
  }

  const flows = {ratingHome};
  return {detectWorkflow, flows};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// APP module

function main() {
  const name = detectWorkflow();
  if (!name) {
    return log.warn('No workflow identified');
  }
  const flowInit = flows[name];
  flowInit();
  log.notice(`${name} screen loaded`);
};

main();
