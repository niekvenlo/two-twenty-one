chrome.storage = (function chromeLocalStorageModule() {
  const mockStore = {
    Configuration: {initials: '__'},
    BrandCapitalisation: {},
    CommonReplacementsDutch: {},
    ForbiddenPhrases: {},
    ForbiddenPhrasesDutch: {},
    LogBook: [],
  };
  return {
    local: {
      /**
       * @param {(string|string[]|null)}
       * @param {function} callback
       */
      get(param, callback) {
        if (param === null) {
          return {...mockStore};
        }
        const ret = {};
        if (Array.isArray(param)) {
          for (let el of param) {
            if (mockStore[el]) {
              ret[el] = mockStore[el];
            }
          }
        } else {
          ret[param] = mockStore[param];
        }
        if (typeof callback === 'function') {
          callback(ret);
        }
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
