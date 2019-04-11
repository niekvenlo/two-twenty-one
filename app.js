var flows = {};

(function appModule() {
  
  function startFlow() {
    util.dispatch('issueUpdate', {issueType: 'reset'});
    eventReactions.reset();
    
    const detectedFlowName = environment.flowName();
    if (!detectedFlowName) {
      shared.guiUpdate('No flow');
      return false;
    }
  
    eventReactions.setGlobal({
      onKeydown_Backquote: startFlow,
    });
    flows[detectedFlowName].init();
    return true;
  };
  
  function noWorkflowWarning() {
    const warning = 'No workflow identified';
    shared.guiUpdate(warning);
    user.log.warn(
      warning,
      {save: false, print: false, toast: true}
    );
  }

  var isNewUrl = (function() {
    let url = '';
    return () => {
      if (url !== window.location.href) {
        url = window.location.href;
        return true;
      }
      return false;
    }
  })();

  async function app() {
    if (isNewUrl()) {
      const success = await util.retry(startFlow, 100, 200, true)();
      if (!success) {
        noWorkflowWarning();
      }
    }
  };

  setInterval(app, 1000);
})()