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
   * Tests can be switched on or off with enableTests.
   * Define a new test with group.
   * Use ok, fizzle and solid to define test items:
   * - pass ok a true statement.
   * - pass fizzle a function that throws an error.
   * - pass solid a function that does not throw an error.
   * Results are logged to the console if there is an error.
   */

  const logBook = [];
  let /** boolean */ allGood = true;

  const print = () => logBook.forEach(el => console.log(...el));

  setTimeout(() => {
    if (!allGood) {
      print();
    }
  }, 1000);

  const header = (/** string */ m) => logBook.push([`%c${m}`, 'color: grey']);
  const logOk = (/** string */ m) => logBook.push([`%c${m}`, 'color: green']);
  const logFail = (/** string */ m) => logBook.push([`%c${m}`, 'color: red']);

  /**
   * Define a test, which can include many test items.
   * @param {?string} groupDesc - Commonly the name of the
   * function being tested.
   * @param {function} func - Function body that contains the
   * test items.
   */
  const group = (groupDesc, func) => {
    if (typeof func !== 'function') {
      throw new Error('Test requires a function');
    }
    header(`===== ${groupDesc}`);
    func();
    const verdict = (allGood) ? 'OK' : 'FAIL';
    header(`===== ${verdict}`);
  };

  /**
   * @param {boolean} statement - Truthy or falsy statement
   * @param {?string} itemDesc - Description of test item.
   */
  const ok = (statement, itemDesc) => {
    if (statement === true) {
      logOk(` OK: ${itemDesc}`);
    } else {
      logFail(` FAIL: ${itemDesc}`);
      allGood = false;
    }
  }

  /**
   *
   * @param {function} fizzleFunc - Function that is
   * expected to throw an error.
   * @param {?string} itemDesc - Description of test item.
   */
  const fizzle = (fizzleFunc, itemDesc) => {
    try {
      fizzleFunc();
      logFail(` FAIL: ${itemDesc} didn't fizzle`);
     allGood = false;
   } catch (e) {
     logOk(` OK: ${itemDesc} fizzled`);
   }
 }

/**
  *
  * @param {function} throwingFunc - Function that is
  * expected to run without throwing an error.
  * @param {?string} itemDesc - Description of test item.
  */
 const solid = (throwingFunc, itemDesc) => {
   try {
     throwingFunc();
     logOk(` OK: ${itemDesc} is solid`);
   } catch (e) {
     logFail(` FAIL: ${itemDesc} is not solid`);
     allGood = false;
   }
 }
 
 return {group, ok, fizzle, solid, print};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// UTILITY module

var util =
    (function utilityModule() {
  'use strict';

  /**
   * @param {=object} domElement
   * @return {boolean} Returns true if a dom element is passed in.
   */
  function isDomElement(domElement) {
    return !!domElement && domElement.parentNode !== undefined;
  }

  function debounce(func, delay) {
    let timer = false;
    return function debounced(...params) {
      if (!timer) {
        return func(...params);
      }
      timer = true;
      setTimeout(() => timer = false, delay);
    }
  }

  function bundle (...functions) {
    return function(...params) {
      functions.forEach(func => func(...params));    
    }
  }

  return {isDomElement, debounce, bundle};
})();




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// REPORTING module

var {config, counter, flag, log} =
    (function reportingModule() {
  'use strict';

  /**
   * @fileoverview Exposes objects to keep track
   * of things.
   * - counter to count things.
   * - flagger to flag issues.
   * - log to log things.
   * This module is a semi-functional stub.
   */

  /**
   * Create a human readable string timestamp.
   * @param {Date} d - A date to turn into a matching timestamp.
   * For today's Date, returns a short format (hh:mm)
   * For other Dates, returns a long format (MM/DD hh:mm:ss) 
   * @return {string}
   */
function timestamp (d = new Date()) {
  const lead = (/** number */n) /** string */ => ('0' + n).slice(-2);
  const today = (new Date().getDate() - d.getDate() === 0);
  const month = lead(d.getMonth() + 1);
  const date = lead(d.getDate());
  const hrs = lead(d.getHours());
  const min = lead(d.getMinutes());
  const sec = lead(d.getSeconds());
  const long = `${month}/${date} ${hrs}:${min}:${sec}`;
  const short = `${hrs}:${min}`;
  return (today) ? short : long;
}
  test.group('timestamp', () => {
    const today = new Date();
    const earlier = new Date('01-01-2019');
    test.ok(timestamp(today).length === 5, 'Short length');
    test.ok(timestamp(new Date(earlier)).length === 14, 'Long length');
  });

  /**
   * Dispatch Gui update packets.
   */
  function updateGui(packet) {
    document.dispatchEvent(
        new CustomEvent('guiUpdate', {detail: packet})
    );
  }

  /** Handle communication with localStorage */
  const localStore = {
    BASENAME: 'twoTwenty',
    /**
     * @param {string} itemName - Name of the item in localStorage
     * @return {Object} Object
     * Will return undefined if no item by this name exists.
     */
    get(itemName) {
      const item = localStorage.getItem(this.BASENAME + itemName);
      return (item) ? JSON.parse(item) : {};
    },
    /**
     * @param {string} itemName - Name of the item in localStorage
     * @param {object} obj - Object, string or number to be stored.
     * Will overwrite previously stored values.
     */
    set(itemName, obj = {}) {
      localStorage.setItem(this.BASENAME + itemName, JSON.stringify(obj))
    }
  };

  /**
   * Track configuration settings. Settings are loaded from localStorage on
   * load, but changes are not persisted by default.
   * #get(name) returns a value if a config setting is loaded or undefined.
   * #set(name) adds a value to the config object in memory and optionally
   * updates the config options stored in localStorage.
   * #raw() returns the config object in memory and exists mostly for debugging.
   */
  const config = (function configMiniModule() {
    const defaults = {};
    const stored = localStore.get('Configuration');
    const config = {...defaults, ...stored};
    function get(name) {
      return config[name];
    }
    function set(name, newValue, save) {
      log.changeConfig(`${name} changed to '${newValue}'`)
      config[name] = newValue;
      if (save) {
        localStore.set('Configuration', config);
      }
    }
    function raw() {
      return config;
    }
    return {get, set, raw};
  })();

  /**
   * Object with methods to create and manage counters.
   * #add(name) create a new counter or increments it if it already exists.
   * #get(=name) returns the count of a named counter (or -1 if no such counter
   * exists)(or all counters if no name is provided).
   * #reset(=name) resets a named counter (or all counters if no name is
   * provided).
   */
  const counter = (function counterMiniModule() {
    function add(name) {
      if (typeof name !== 'string') {
        throw new Error('Counter expects a name string');
      }
      const /** object */ allCounts = localStore.get('Counter');
      const /** number */ newCount = (allCounts[name] + 1) || 1;
      allCounts[name] = newCount;
      localStore.set('Counter', allCounts);
      updateGui({counters: allCounts});
      return newCount;
    }

    function get(name) {
      const allCounts = localStore.get('Counter');
      if (name) {
        return allCounts[name] || -1;
      } else {
        return allCounts;
      }
    }

    function reset(name) {
      const allCounts = localStore.get('Counter');
      if (name) {
        log.notice(
          `Resetting counter ${name} from ${allCounts[name]}`,
          true,
        );
        allCounts[name] = 0;
      } else {
        log.notice(
          `Resetting all counters: ${JSON.stringify(allCounts)}`,
          true,
        );
        allCounts = {};
      }
      localStore.set('Counter', allCounts);
      updateGui({counters: allCounts});
      return 0;
    }
    return {add, get, reset};
  })();

  /**
   * Track incoming concerns, keep a running list of
   * unresolved unique issues.
   * concerns look like this: {wrapper, type, category, message}
   */
  const flag = (function flaggerMiniModule() {
    let concerns = [];

    function removeMatching (newConcern) {
      return concerns.filter(concern => {
        const sameWrapper = (concern.wrapper === newConcern.wrapper);
        const sameType = (concern.type === newConcern.type);
        if (sameWrapper && sameType) {
          return false;
        }
        return true;
      })
    }

    function flag(concern) {
      concerns = removeMatching(concern);
      concerns.push(concern);
      concerns = concerns.filter(concern => concern.category !== 'ok');
      updateGui({concerns});
    }
    return flag;
  })();

  /**
  * Object with methods to log events.
  * The following is true for each method:
  * * @param {Object|string} payload
  * * @param {Boolean} persist Should the event be persisted to localstorage?
  * @return {Object}
  */
  const log = (function loggingModule() {

    const STORE_NAME = 'logBook';
    const LOG_LENGTH_MAX = 5000;
    const LOG_LENGTH_MIN = 4000;
    const NO_COLOR_FOUND = 'yellow';
    const TIMESTAMP_COLOR = 'color: grey';
    const LOG_TYPES = {
      log: 'black',
      notice: 'DodgerBlue',
      warn: 'OrangeRed',
      ok: 'LimeGreen',
      low: 'Gainsboro',
      changeValue: 'LightPink',
      changeConfig: 'MediumOrchid',
    };

    /**
     * Retrieve an array of log entries.
     * @return {Array<Object>} Array of entries. 
     */
    function getPersistent() {
      const logBook = localStore.get(STORE_NAME);
      return (logBook.entries || []).map(entry => {
        entry.time = new Date(entry.time);
        return entry;
      });
    }
    /**
     * Save an array of log entries.
     * @param {Object} An object containing an array of log entries. 
     */
    function setPersistent(entries) {
      if (entries.length > LOG_LENGTH_MAX) {
        entries = entries.slice(-LOG_LENGTH_MIN);
      }
      localStore.set(STORE_NAME, {entries});
    }
    /**
     * Add a single log entries to the persistent log.
     * @param {string} type.
     * @param {Object|string} payload Data associated with the log entry.
     */
    function addPersistent({type, payload}) {
      const entries = getPersistent();
      const newEntry = {time: new Date(), type, payload};
      const newEntries = [...entries, newEntry];//.slice(-20);
      setPersistent(newEntries);
    }
    /**
     * Get a filtered part of the persistent log.
     * @param {=Object} filterBy Filter parameters.
     * @return {Array<Object>}
     * @example printPersistent({before: new Date()});
     */
    function getFilteredPersistent(filterBy = {}) {
      let entries = getPersistent();
      if (filterBy.type) {
        entries = entries.filter(entry => entry.type === filterBy.type);
      }
      if (filterBy.notType) {
        entries = entries.filter(entry => entry.type !== filterBy.notType);
      }
      if (filterBy.after) {
        entries = entries.filter(entry => entry.time > filterBy.after);
      }
      if (filterBy.before) {
        entries = entries.filter(entry => entry.time < filterBy.before);
      }  
      return entries;  
    }
    /**
     * Print a filtered part of the persistent log.
     * @param {=Object} filterBy Filter parameters.
     * @return {Array<Object>}
     * @example printPersistent({before: new Date()});
     */
    function printPersistent(filterBy) {
      getFilteredPersistent(filterBy).forEach(entry => toConsole(entry));
    }
    /**
     * Generate a string from a log entry, in order to print to the console.
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
    /**
     * Print a log entry to the console, with a timestamp.
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
     * Generate a logging function.
     * @param {string} type Title of the log.
     */
    function genericLog(type) {
      return function log(payload = '', persist) {
        toConsole({type, payload});
        if (persist) {
          addPersistent({type, payload});
        }
      }
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
    stage: undefined,
    counters: {},
    concerns: [],
  };

  /**
   * Merges new data into the local gui state, and triggers and update of
   * the gui.
   * @param {Object} packet Data to be merged into the gui's state.
   */
  function update(packet) {
    guiState = {...guiState, ...packet};
    log.log(JSON.stringify(guiState));
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

var {setReactions, setGlobalReactions} =
    (function eventListenersModule() {
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
   * Array<string>} These are the events that can be set on a Dom element.
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
   * WeakMap - Maps DOM elements to reaction objects.
   */
  const reactionMap = new WeakMap();

  /**
   * Array<string>} These are the events that are triggered by the special
   * 'interact' event.
   */
  const INTERACT_EVENTS = Object.freeze([
    'click',
    'focusout',
    'keydown',
    'paste',
  ]);

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
    let result = eventToString({
      type: 'keydown', ctrlKey: true, shiftKey: false, code: 'KeyP'
    });
    test.ok(
      result === 'CtrlP',
      'test 1'
    );
    result = eventToString({
      type: 'keydown', ctrlKey: false, shiftKey: false, code: 'KeyP'
    });
    test.ok(
      result === 'P',
      'test 2'
    );
    result = eventToString({
      type: 'keydown', ctrlKey: true, code: 'Enter'
    });
    test.ok(
      result === 'CtrlEnter',
      'test 3'
    );
    result  = eventToString({type: 'click'});
    test.ok(
      result === '',
      'test 4'
    );
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
    if (reactionsClone.load) {
      runAll(reactionsClone.load);
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
    runAll(targetReactions);
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

  function safelySetTextarea(domElement, newValue) {
    if (isHidden(domElement)) {
      throw new Error('Do not set value on hidden items');
    }
    domElement.select();
    document.execCommand('insertText', false, newValue);
  }

  function safeSetter(domElement, name, newValue) {
    const currentValue = domElement.value;
    if (currentValue === newValue) {
      log.low(
      `No change to ${name}'.`,
    );
      return;
    }
    if(!EDITABLE_ELEMENT_TYPES.includes(domElement.type)) {
      throw new Error(`Cannot set value on ${domElement.type} elements`);
    }
    if (false && domElement.type === 'textarea') { // @todo
      safelySetTextarea(domElement, newValue);
    } else {
      domElement.value = newValue;
    }
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
          const {wrapper, hit, message} = when(...params);
          const category = (hit) ? color : 'ok';
          flag({wrapper, type, category, message});
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
      let message = [];
      let hit = false;
      if (min && min > length) {
        message.push('Value is too short');
        hit = true;
      }
      if (max && max < length) {
        message.push('Value is too long');
        hit = true;
      }
      return {wrapper, hit, message: message.join(', ')}
    }
  };

  function testDuplicates (wrapper, idx, group) {
    const filledIn = group.map(d => d.value).filter(v => v);
    const uniqueElements = new Set(filledIn).size;
    const totalElements = filledIn.length;
    const hit = (uniqueElements !== totalElements);
    const message = 'Duplicate values';
    return {wrapper, message, hit};
  };

  const fallThrough = (wrapper, idx, group) => {
    if (idx > 0) {
      return;
    }
    setTimeout(() => {
      group[1].value = wrapper.value;
      group[0].value = 'Moved';
    });
    log.notice('Fallthrough');
  };

  const toggleSelectYesNo = (wrapper) => {
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
        shared.redAlertOnDupe
    );
    wrap('textarea', [0,1,2], 'programmable', 'Text', {
      onFocusOut: textboxBundle,
      onLoad: textboxBundle,
      onPaste: textboxBundle,
    });

    wrap('textarea', [6,7,8], 'programmable', 'Text', {
      onFocusIn: shared.removeDashes,
      onFocusOut: shared.addDashes,
      onLoad: shared.addDashes,
      onPaste: shared.redAlertOnExceeding25Chars,
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
