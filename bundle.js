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
   * Results are logged to the console.
   */

  let /** boolean */ testsEnabled = false;
  let /** boolean */ allGood = false;

  /** Turn tests on or off from this point on. */
  const enable = (/**boolean */ on = true) => testsEnabled = on;

  const debug = (/** string */ m) => console.debug(`%c${m}`, 'color: grey');
  const log = (/** string */ m) => console.debug(`%c${m}`, 'color: grey');
  const logOk = (/** string */ m) => console.debug(`%c${m}`, 'color: green');
  const logFail = (/** string */ m) => console.debug(`%c${m}`, 'color: red');

  /**
   * Define a test, which can include many test items.
   * @param {?string} groupDesc - Commonly the name of the
   * function being tested.
   * @param {function} func - Function body that contains the
   * test items.
   */
  const group = (groupDesc, func) => {
    if (!testsEnabled) {
      debug(`${groupDesc} tests disabled`);
      return;
    }
    if (typeof func !== 'function') {
      throw new Error('Test requires a function');
    }
    allGood = true;
    log(`===== ${groupDesc}`);
    func();
    const verdict = (allGood) ? 'OK' : 'FAIL';
    log(`===== ${verdict}`);
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
 
 return {enable, group, ok, fizzle, solid};
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

  return {isDomElement};
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
   * @param {boolean} long - Return a long format or short
   * format timestamp: 12:34:56 or :34
   * @return {string}
   */
  function timestamp (long) {
    const d = new Date();
    const lead = (/** number */n) /** string */ => ('0' + n).slice(-2);
    const hrs = lead(d.getHours());
    const min = lead(d.getMinutes());
    const sec = lead(d.getSeconds());
    const longstamp = `${hrs}:${min}:${sec}`;
    const shortstamp = `:${min}`;
    return (long) ? longstamp : shortstamp;
  }
  test.group('timestamp', () => {
    test.ok(timestamp().length === 3, 'Short length');
    test.ok(/:\d\d/.test(timestamp()), 'Short format');
    test.ok(timestamp(true).length === 8, 'Long length');
    test.ok(/\d\d:\d\d:\d\d/.test(timestamp(true)), 'Long format');
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
    baseName: 'twoTwenty',
    /**
     * @param {string} itemName - Name of the item in localStorage
     * @return {Object} Object
     * Will return undefined if no item by this name exists.
     */
    get(itemName) {
      const item = localStorage.getItem(this.baseName + itemName);
      return (item) ? JSON.parse(item) : {};
    },
    /**
     * @param {string} itemName - Name of the item in localStorage
     * @param {object} obj - Object, string or number to be stored.
     * Will overwrite previously stored values.
     * @todo Log changes to stored values.
     */
    set(itemName, obj = {}) {
      localStorage.setItem(this.baseName + itemName, JSON.stringify(obj))
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
          `Resetting counter ${name} from ${allCounts[name]}`
        );
        allCounts[name] = 0;
      } else {
        log.notice('Resetting all counters');
        log.notice(JSON.stringify(allCounts));
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
   * concerns look like this: {wrapper, desc, ok}
   */
  const flag = (function flaggerMiniModule() {
    let concerns = [];

    function removeMatching (newConcern) {
      return concerns.filter(concern => {
        const sameWrapper = (concern.wrapper === newConcern.wrapper);
        const sameDesc = (concern.desc === newConcern.desc);
        if (sameWrapper && sameDesc) {
          return false;
        }
        return true;
      })
    }

    function update(concern) {
      concerns = removeMatching(concern);
      concerns.push(concern);
      updateGui({concerns});
    }
    return {update};
  })();

  /**
  * Object with methods to log events.
  * @example log.notice('msg') prints '12:34:56) msg' to
  * the console.
  * @todo Implement a persistent log
  */
  const log = (function logMiniModule() {
    function write(note, timeColor, noteColor) {
      const ts = timestamp();
      console.log(
        `%c${ts})%c ${format(note)}`,
        `color: ${timeColor}`,
        `color: ${noteColor}`,
      );
      return '';
    }
    const spacer = ' '.repeat(5);
    const format = (str) => str.replace(/\n/g, '\n' + spacer);
    return {
      log: (note) => write(note, 'grey', 'black'),
      notice: (note) => write(note, 'grey', 'blue'),
      warn: (note) => write(note, 'grey', 'orange'),
      ok: (note) => write(note, 'grey', 'green'),
      low: (note) => write(note, 'grey', 'Gainsboro'),

      changeValue: (note) => write(note, 'grey', 'pink'),
    }
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
   * update function,
   */

  let guiState = {
    stage: undefined,
    counters: {},
    concerns: [],
  };

  function update(packet) {
    guiState = {...guiState, ...packet};
    console.log(JSON.stringify(guiState));
  }

  function addGuiUpdateListener() {
    document.addEventListener('guiUpdate', ({detail}) => {
      const packet = detail;
      update(packet);
    }, false);
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

  /** WeakMap - Maps DOM elements to reaction objects. */
  const reactionMap = new WeakMap();

  /** Array<string>} */
  const supportedEvents = Object.freeze([
    'change',
    'click',
    'focusin',
    'focusout',
    'keydown',
    'paste',
    /** load is handled separately */
    /** interact is handled separately */
  ]);

  /** Array<string>} */
  const interactEvents = Object.freeze([
    'click',
    'focusin',
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
   * Run an array of functions.
   * @param {Array<function>} functions.
   */
  function runAll(functions) {
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
      const simpleType =
          type.replace(/^on/, '').toLowerCase();
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
        {click: [func1, func2], paste: [func1]};
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
   * @todo Wrap interact in a throttled wrapper.
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
    for (let type of interactEvents) {
      unpacked[type] = reactionsClone.interact;
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
    reactionMap.set(
      domElement,
      mergeReactions(prior, additional)
    );
  }

  const globalReactions = new Map();
  function setGlobalReactions(type, reaction) {
    //console.log(type, reaction);
  }

  function getTargetReactions(event) {
    const eventString = eventToString(event);
    const general = `${event.type}`;
    const specific = `${event.type}_${eventString}`;
    const target = event.relatedTarget || event.target;
    const targetReactions = reactionMap.get(target);
    if (!targetReactions) {
      return [];
    }
    return [
      ...targetReactions[specific] || [],
      ...targetReactions[general] || [],
      ]
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
    for (let type of supportedEvents) {
      document.addEventListener(type, genericEventHandler);
    }
  }

  (function addCheatCode() {
    const code = [
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
      (e.code === code[idx]) ? idx++ : idx = 0;
      if (idx === code.length) {
        console.log('cheat mode');
      }
    }
    document.addEventListener('keydown', cheatCodeHandler);
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

  test.enable();

  const domElementWeakMap = new WeakMap();
  const editableElementTypes =
      Object.freeze(['textarea', 'select', 'text']);

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
    domElement.focus();
    domElement.select();
    document.execCommand('insertText', false, newValue);
  }

  function safeSetter(domElement, name, newValue) {
    const currentValue = domElement.value;
    if (currentValue === newValue) {
      log.low(
      `No change to ${name}'.`
    );
      return;
    }
    if(!editableElementTypes.includes(domElement.type)) {
      throw new Error(`Cannot set value on ${domElement.type} elements`);
    }
    if (domElement.type === 'textarea') {
      safelySetTextarea(domElement, newValue);
    } else {
      domElement.value = newValue;
    }
    log.changeValue(
      `Changing '${name}' from '${currentValue}' to '${newValue}'.`
    );
  }

  function getWrapper(domElement, mode, name, elementSelector) {
    const cached = domElementWeakMap.get(domElement);
    if (cached && mode === 'fresh') {
      mode = cached.mode;
    } else if (cached) {
      if (cached.mode !== mode) {
        log.warn(`Didn't change ${name} element mode from ${cached.mode}.`)
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
        console.log(string);
        domElement.style.cssText = string;
      },
      click() {
        domElement.click();
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
    if (domElements.length < 1) {
      log.warn('No elements found');
    }
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
// WORKFLOW module

/**
 * @todo Implement global event handlers in eventListenersModule
 * @todo Throttle onInteract
 */

var {detectWorkflow, flows} = (function workflowModule() {
  // @todo Ought to check the dom for telltale signs (ideally using wrap).
  function detectWorkflow() {
    return 'ab';
  }

  function ab() {
    wrap('input', [2], 'programmable', 'Search Box',{
      onChange: (wrapper) => wrapper.value = wrapper.value + ':',
    });

    setGlobalReactions({
      onClick: () => console.log(new Date()),
    });
    return '';
  }

  const flows = {ab};

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
  if (name === 'splash') {
    log.notice('Splash screen loaded');
  } else {
    log.notice('Task screen loaded');
  }
};

main();
