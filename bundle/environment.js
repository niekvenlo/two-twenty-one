  var environment = (function environmentModule() {
    'use strict';
  
    /**
     * @fileoverview Provides access to variables about the current workflow.
     */
  
    /**
     * @return {string} Description of the current workflow.
     */
    function detectWorkflow() {
      const firstButton = ー({
        name: 'First Button',
        select: 'button',
        pick: [0],
      })[0];
      const header = ー({
        name: 'Header',
        select: 'h1',
        pick: [0],
      })[0];
      const title = ー({
        name: 'Title',
        select: '.taskTitle',
        pick: [0],
      })[0];
      const buttonText = firstButton && firstButton.textContent;
      const headerText = header && header.textContent;
      const titleText = title && title.textContent;
      if (/Acquire/.test(buttonText)) {
        return 'home';
      }
      if (/Continue/.test(buttonText)) {
        return 'home';
      }
      if (/Sitelinks/.test(headerText)) {
        return 'sitelinks'
      }
      if (/Snippets/.test(headerText)) {
        return 'ss'
      }
      if (/Curated Creatives/.test(titleText)) {
        return 'as'
      }
      if (/#activeevals\/subpage=labels/.test(document.location.href)) {
        return 'labels';
      }
      if (headerText || titleText) {
        return 'unsupported';
      }
      return '';
    }
  
    /**
     * Checks DOM for locale indicators.
     * @return {string}
     */
    function detectLocale() {
      const header = ー({
        name: 'Header',
        select: 'h1',
        pick: [0],
      })[0];
      const headerText = header && header.textContent;
      if (!headerText) {
        return;
      }
      return headerText.trim().split(/\s+/).pop();
    }
  
    function detectTaskId() {
      if (util.isDev()) {
        return {
          encoded: 'fffff',
          decoded: '555' + Math.round(Math.random() * 1e11),
        };
      }
      const currentTask =
          Object.entries(JSON.parse(localStorage.acquiredTask))[0] ||
              ['', ''];
      return {
        encoded: currentTask[0],
        decoded: currentTask[0],
      };
    }
  
    return {
      flowName: detectWorkflow,
      locale: detectLocale,
      taskId: detectTaskId,
    };
  })();
  
