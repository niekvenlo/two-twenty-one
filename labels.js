flows.labels = (function labelsModule() {

  function init() {
    util.dispatch('guiUpdate', {stage: 'Trying to count'});
    countTasks();
  }

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
      util.dispatch('guiUpdate', {stage: 'Counting tasks', counters});
      return dataLoaded;
    } catch (e) {
      user.log.warn('Labels flow encountered an error.');
      return false;
    }
  }

  return {init};
})();