chrome.storage = (function chromeLocalStorageModule() {
  const mockStore = {
    Configuration: {initials: '__'},
    BrandCapitalisation: [
      "AdWords",
      "iPhone",
      "iPad",
      "iPod",
      "iMac",
      "iBook",
      "iTunes",
      "MacBook",
      "YouTube"
    ],
    CommonReplacementsDutch: [],
    ForbiddenPhrases: [],
    ForbiddenPhrasesDutch: [],
    LogBook: [],
  };
  return {
    local: {
      /**
       * @param {(string|string[]|null)}
       * @param {function} callback
       */
      get(param, callback) {
        const ret = (param === null) ? {...mockStore} : {};
        if (Array.isArray(param)) {
          for (let el of param) {
            if (mockStore[el]) {
              ret[el] = mockStore[el];
            }
          }
        } else if (param !== null) {
          ret[param] = mockStore[param];
        }
        if (typeof callback === 'function') {
          callback(ret);
        }
        return false; // No return value
      },

      /**
       * @param {(string|string[]|null)}
       * @param {function} callback
       */
      remove(param) {
        delete mockStore[param]
      },

      /**
       * @param {(string|string[]|null)}
       * @param {function} callback
       */
      set(param) {
        for (let key in param) {
          mockStore[key] = param[key];
        }
      },
    }
  }
})();
