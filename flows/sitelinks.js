  flows.sitelinks = (function slModule() {

    /** string - Describes the current stage */
    let stage;
    let taskId;

    function init() {
      if (taskId === environment.taskId()) {
        return;
      } else {
        taskId = environment.taskId();
      }
      setupReactions();
      toStage('start');
    }

    const stages = {
      async start() {
        util.attention(ref.approvalButtons, 1, 'click');
        shared.comment.removeInitials();
        shared.guiUpdate('Ready to edit');
      },

      async approve() {
        util.attention(ref.approvalButtons, 0, 'click');
        completeScreenshots();
        util.attention(ref.finalCommentBox, 0, 'focus');
        shared.tabs.close();
        if (!(ref.submitButton[0].disabled)) {
          shared.comment.addInitials();
          shared.guiUpdate('Approved');
        } else {
          toStage('start');
          user.log.warn(
            'Not ready to Approve',
            {save: false, print: false, toast: true},
          );
        }
      },

      async submit() {
        if (ref.submitButton[0].disabled) {
          user.log.warn('Just a sec', {save: false, print: false});
          await util.wait(100);
          if (ref.submitButton[0].disabled) {
            toStage('start');
            user.log.warn('Task is not ready');
            return;
          }
        }
        const submitted = await shared.submit();
        if (submitted) {
          await util.wait(1000);
          shared.guiUpdate('Press Start');
        } else {
          toStage('approve');
        }
      }
    };

    const stageIs = (...p) => p.includes(stage);

    async function toStage(name) {
      stage = name;
      stages[name]();
    }

    const approve = () => stageIs('start') && toStage('approve');
    const submit = () => stageIs('approve') && toStage('submit');
    const start = () => stageIs('approve') && toStage('start');

    function focusItem(n) {
      util.attention(ref.addDataButton, 0, 'click'),
      util.attention(ref.editButton, 0, 'click, scrollIntoView');
      util.attention(ref.textAreas, n - 1, 'focus');
    }

    /**
     * Before starting a task, decide whether to skip it or to open all
     * tabs.
     */
    function beginTask() {
      if (shared.is.ownTask()) {
        shared.skipTask();
        return;
      }
      shared.tabs.refresh();
      util.attention(ref.addDataButton, 0, 'focus');
      util.attention(ref.editButton, 0, 'focus');
      util.attention(ref.creative, 0, 'scrollIntoView');
    }
    
    // const status = (function statusMiniModule() {
    //   // return object:
    //   return {
    //     get() {},
    //     canExtract() {},
    //     insufficient() {},
    //     pageError() {},
    //     dynamic() {},
    //     geo() {},
    //     // ...
    //   }
    // });

    /**
     * Set the current task status, by changing the values in the
     * dropdown menus.
     *
     * @param {string} type
     * @ref {statusDropdown}
     * @ref {canOrCannotExtractButtons}
     */
    function setStatus(type) {
      const keys = {
        'canExtract':    [0, 2, 0],
        'insufficient':  [1, 2, 1],
        'pageError':     [1, 2, 2],
        'dynamic':       [1, 2, 4],
        'geo':           [1, 2, 3],
        'nonLocale':     [1, 2, 5],
        'supernatural':  [1, 2, 10],
        'pII':           [1, 2, 12],
        'other':         [1, 2, 0],
        'drugDomain':    [4, 1, 3],
        'alcoholDomain': [4, 1, 4],
        'adultDomain':   [4, 1, 6],
        'gambling':      [4, 1, 5],
        'emptyCreative': [1, 2, 0, 'Creative Not Available/Comprehendable'],
        'urlsUnchanged': [1, 2, 0, 'URLs Not Changing/Tabs On Same Page'],
        'urlMismatch':   [1, 2, 0, 'Visible URL/LP URL Mismatch'],
      };
      if (!ref.statusDropdown) {
        throw new Error('No status dropdown menus selected.');
      }
      function clickAndFocus(type) {
        const n = (type === 'canExtract') ? 0 : 1;
        util.attention(ref.canOrCannotExtractButtons, n, 'click');
        if (type === 'canExtract') {
          util.attention(ref.editButton, 0, 'click');
          util.attention(ref.addDataButton, 0, 'click, scrollIntoView');
          if (ref.extractionPage.value) {
            focusItem(1);
          } else {
            util.attention(ref.extractionPage, 0, 'focus');
          }
        } else {
          util.attention(ref.invalidScreenshot, 0, 'focus');
        }
      }
      async function setTo() {
        if (!keys[type]) {
          return user.log.warn('Invalid status type: ' + type);
        }
        const [b, c, d, message] = keys[type] || [];
        const dropdowns = ref.statusDropdown;
        dropdowns[0].value = b;
        dropdowns[c].value = d;
        clickAndFocus(type);
        shared.comment.setStatus(message);
      }
      return setTo;
    }

    /**
     * Ensure that all screenshot boxes are filled in. Fills in blank
     * boxes with the first screenshot link found, starting from the left.
     *
     * @ref {screenshots}
     */
    function completeScreenshots() {
      const screenshots = ref.screenshots;
      const link =
          screenshots[0].value ||
          screenshots[1].value ||
          screenshots[2].value ||
          screenshots[3].value ||
          screenshots[4].value;
      if (!link) {
        return;
      }
      for (let screenshot of screenshots) {
        if (!screenshot.value && !screenshot.disabled) {
          screenshot.value = link;
        }
      }
    }

    /**
     * Move the focus to the prior proxy in the group, if possible.
     * When moving out of an empty box, mark the corresponding item
     * as 'Leave Blank'.
     *
     * @param {Object} _
     * @param {number} idx
     * @param {Object[]} group
     */
    function moveLeft(_, idx, group) {
      if (idx < 1) {
        return;
      }
      if (group[idx].value === '') {
        util.attention(ref.leaveBlank.slice(-3), idx - 2, 'click');
      }
      util.attention(group, idx - 1, 'focus');
    }

    /**
     * Move the focus to the next proxy in the group, if possible.
     * When moving into an empty box, mark the corresponding item
     * as 'Add Item'.
     *
     * @param {Object} _
     * @param {number} idx
     * @param {Object[]} group
     */
    function moveRight(_, idx, group) {
      if (idx - 1 > group.length) {
        return;
      }
      if (group[idx + 1] && group[idx + 1].disabled) {
        util.attention(ref.addItem.slice(-3), idx - 1, 'click');
      }
      util.attention(group, idx + 1, 'focus');
    }

    /**
     * Swap the values of the currently selected item with the item to
     * the left, if possible.
     *
     * @param {Object} _
     * @param {number} idx
     * @param {Object[]} group
     * @ref {textAreas}
     * @ref {linkAreas}
     * @ref {screenshots}
     */
    function swapLeft(_, idx) {
      const text = ref.textAreas;
      const link = ref.linkAreas;
      const screenshot = ref.screenshots;
      if (idx < 1) {
        return;
      }
      [text[idx].value, text[idx - 1].value] =
          [text[idx - 1].value, text[idx].value];
      [link[idx].value, link[idx - 1].value] =
          [link[idx - 1].value, link[idx].value];
      [screenshot[idx].value, screenshot[idx - 1].value] =
          [screenshot[idx - 1].value, screenshot[idx].value];
      text[idx - 1].focus();
      user.log.ok('Swapped items', {print: false, save: false});
    }

    /**
     * Swap the values of the currently selected item with the item to
     * the right, if possible. Does not swap with disabled items.
     *
     * @param {Object} _
     * @param {number} idx
     * @ref {textAreas}
     * @ref {linkAreas}
     * @ref {screenshots}
     */
    function swapRight(_, idx) {
      const text = ref.textAreas;
      const link = ref.linkAreas;
      const screenshot = ref.screenshots;
      if (idx + 1 > text.length || text[idx + 1].disabled) {
        return;
      }
      [text[idx].value, text[idx + 1].value] =
          [text[idx + 1].value, text[idx].value];
      [link[idx].value, link[idx + 1].value] =
          [link[idx + 1].value, link[idx].value];
      [screenshot[idx].value, screenshot[idx + 1].value] =
          [screenshot[idx + 1].value, screenshot[idx].value];
      text[idx + 1].focus();
      user.log.ok('Swapped items', {print: false, save: false});
    }

    /**
     * Remove the values of the currently selected item.
     *
     * @param {Object} _
     * @param {number} idx
     * @ref {textAreas}
     * @ref {linkAreas}
     * @ref {screenshots}
     */
    function deleteItem(_, idx) {
      const text = ref.textAreas;
      const link = ref.linkAreas;
      const screenshot = ref.screenshots;

      text[idx].value = '';
      link[idx].value = '';
      screenshot[idx].value = '';
      text[idx].focus();
      user.log.ok('Deleted item', {print: false, save: false});
    }

    function deleteAllItems() {
      util.attention(ref.editButton, 0, 'click');
      for (let idx in [0,1,2,3,4]) {
        deleteItem(null, idx);
      }
    }

    function moveFocusToText(_, idx) {
      util.attention(ref.editButton, 0, 'click');
      util.attention(ref.textAreas, idx, 'focus');
    }

    function leaveAllBlank() {
      const blank = ref.leaveBlank.slice(-3)
      util.attention(blank, 0, 'click');
      util.attention(blank, 1, 'click');
      util.attention(blank, 2, 'click');
    }

    function checkDomainMismatch() {
      const getTrimmedDomain = (url) => {
        const domain = util.getDomain(url).toLowerCase();
        const n = (/co.uk/.test(url)) ? 3 : 2;
        return domain.split('.').slice(-n).join('.');
      }
      const one = getTrimmedDomain('https://' + ref.creative[1].textContent);
      const two = getTrimmedDomain(ref.openInTabs.slice(-1)[0].value);
      const three = getTrimmedDomain(ref.finalUrl[0].value);
      const links = [one, two, three].filter(o => o);

      const packet = {proxy: ref.creative[1], issueType: 'Creative domain mismatch'};
      if (new Set(links).size !== 1) {
        packet.issueLevel = 'medium';
        packet.message = links.join(', ');
      }
      util.dispatch('issueUpdate', packet);
    }
    checkDomainMismatch = util.debounce(checkDomainMismatch);

    /**
     * Raise an issue if the creative contains no text.
     *
     * @param {Object} proxy
     * @param {number} _
     * @param {Object[]} group
     */
    function checkEmptyCreative(proxy, __, group) {
      const packet = {proxy, issueType: 'Empty creative'};
      if (group.every(el => !el.textContent)) {
        packet.issueLevel = 'medium';
        packet.message = 'Creative is empty';
      }
      util.dispatch('issueUpdate', packet);
    }
    checkEmptyCreative = util.debounce(checkEmptyCreative);

    /**
     * Set up event handlers.
     */
    function setupReactions() {
      
      const innocuousTerm = shared.is.analystTask()
          ? {
              text: [1, 5, 9, 13, 17],
              link: [2, 6, 10, 14, 18],
              dashes: [4, 8, 12, 16, 20],
              linkLP: [2, 6, 10, 14, 18, 0],
              fall: [[1, 2],[5, 6],[9, 10],[13, 14],[17, 18]],
              remain: [0, 8, 17, 26, 35],
            }
          : {
              text: [1, 4, 7, 10, 13],
              link: [2, 5, 8, 11, 14],
              dashes: [3, 6, 9, 12, 15],
              linkLP: [2, 5, 8, 11, 14, 0],
              fall: [[1, 2],[4, 5],[7, 8],[10, 11],[13, 14]],
              remain: [0, 6, 13, 20, 27],
            };

      const maybeNoMoreThan12Chars = (proxy) => {
        if (!user.config.get('12 character limit')) {
          return;
        }
        shared.noMoreThan12Chars(proxy);
      }

      ー({
        name: 'Text',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.text,
        onClick: (proxy, idx) => {
          util.attention(ref.addItem.slice(-3), idx - 2, 'click');
          util.attention([proxy], 0, 'focus');
        },
        onFocusout: [
          shared.trim,
          shared.removeQuotes,
        ],
        onInteract: [
          shared.checkCapitals,
          shared.noMoreThan25Chars,
          maybeNoMoreThan12Chars,
          shared.noDuplicateValues,
          shared.noDuplicateVerbs,
          shared.noForbiddenPhrase,
        ],
        onKeydown_CtrlShiftAltArrowLeft: swapLeft,
        onKeydown_CtrlShiftAltArrowRight: swapRight,
        onKeydown_CtrlAltArrowLeft: moveLeft,
        onKeydown_CtrlAltArrowRight: moveRight,
        onKeydown_CtrlDelete: deleteItem,
        onLoad: [
          shared.trim,
          shared.checkCapitals,
          shared.noMoreThan25Chars,
          maybeNoMoreThan12Chars,
          shared.noDuplicateValues,
          shared.noDuplicateVerbs,
          shared.noForbiddenPhrase,
        ],
        ref: 'textAreas',
      });

      ー({
        name: 'Link',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.link,
        onFocusout: [
          shared.requireUrl,
          shared.removeScreenshot,
        ],
        onKeydown_CtrlAlt: moveFocusToText,
        onLoad: [
          shared.disableSpellcheck,
          shared.keepAlive,
        ],
        onPaste: [
          shared.requireUrl,
          shared.removeBannedDomains,
          shared.removeScreenshot,
        ],
        ref: 'linkAreas',
      });
      
      if (shared.is.analystTask()) {
        ー({
          name: 'Screenshot',
          rootSelect: '#extraction-editing',
          select: 'textarea',
          pick: [3, 7, 11, 15, 19],
          onFocusout: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          onKeydown_CtrlAlt: moveFocusToText,
          onLoad: shared.disableSpellcheck,
          onPaste: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          ref: 'screenshots',
        });

      } else {
        ー({
          name: 'Screenshot',
          rootSelect: '.extraction-screenshots',
          select: 'textarea',
          pick: [0, 1, 2, 3, 4],
          onFocusout: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          onKeydown_CtrlAlt: moveFocusToText,
          onLoad: shared.disableSpellcheck,
          onPaste: [
            shared.requireUrl,
            shared.requireScreenshot,
          ],
          ref: 'screenshots',
        });
      }

      ー({
        name: 'Dashes',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.dashes,
        onFocusin: shared.removeDashes,
        onFocusout: shared.addDashes,
        onLoad: [
          shared.addDashes,
          shared.tabOrder.remove,
          shared.disableSpellcheck,
        ],
        ref: 'dashes',
      });

      ー({
        name: 'Analyst Comment',
        select: '.feedback-display-text',
        pick: [0],
        ref: 'analystComment',
      });

      ー({
        name: 'Extraction Page Url',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: [0],
        onKeydown_CtrlAltArrowRight: [
          () => util.attention(ref.editButton, 0, 'click'),
          () => focusItem(1),
        ],
        onLoad: [
          shared.prefill,
          shared.removeScreenshot,
          shared.requireUrl,
        ],
        ref: 'extractionPage',
      });

      ー({
        name: 'LinksAndLP',
        rootSelect: '#extraction-editing',
        select: 'textarea',
        pick: innocuousTerm.linkLP,
        onInteract: [
          shared.noDomainMismatch,
          shared.noDuplicateValues,
        ],
        onLoad: [
          shared.noDomainMismatch,
          shared.noDuplicateValues,
        ],
        onPaste: [
          shared.noDomainMismatch,
          shared.noDuplicateValues,
        ],
        ref: 'openInTabs',
      });

      ー({
        name: 'Final Url',
        select: 'textarea',
        pick: [65],
        ref: 'finalUrl',
      });

      ー({
        name: 'InvalidScreenshot',
        rootSelect: '.errorbox-good',
        rootNumber: 1,
        select: 'textarea',
        onKeydown_CtrlAltArrowRight: [
          () => util.attention(ref.finalCommentBox, 0, 'focus'),
        ],
        onLoad: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        onPaste: [
          shared.requireUrl,
          shared.requireScreenshot,
        ],
        ref: 'invalidScreenshot',
      });

      ー({
        name: 'Creative',
        rootSelect: '.context-item',
        rootNumber: [2],
        select: '*',
        pick: [3, 6, 8],
        onLoad: [
          checkEmptyCreative,
          checkDomainMismatch,
        ],
        ref: 'creative',
      });

      for (let pair of innocuousTerm.fall) {
        ー({
          name: 'Fall',
          rootSelect: '#extraction-editing',
          select: 'textarea',
          pick: pair,
          onPaste: shared.fallThrough,
        });
      }

      for (let rootNumber of innocuousTerm.remain) {
        ー({
          name: 'Remaining',
          rootSelect: '.extraction-item table',
          rootNumber,
          select: 'div, textarea',
          pick: [2, 3],
          onChange: shared.updateCharacterCount,
          onFocusin: shared.updateCharacterCount,
          onKeydown: shared.updateCharacterCount,
          onLoad: shared.updateCharacterCount,
        });
      }

      ー({
        name: 'StatusDropdown',
        select: 'select',
        pick: [0, 1, 2],
        ref: 'statusDropdown',
      });

      ー({
        name: 'Add Data',
        rootSelect: '.extraction',
        select: 'label',
        withText: 'Add Data',
        onKeydown_CtrlAltArrowRight: () => {
          util.attention(ref.addDataButton, 0, 'click');
          focusItem(1);
        },
        ref: 'addDataButton',
      });

      ー({
        name: 'Edit',
        rootSelect: '.extraction',
        select: 'label',
        withText: 'Edit',
        onKeydown_CtrlAltArrowRight: () => {
          util.attention(ref.editButton, 0, 'click');
          focusItem(1);
        },
        onLoad: shared.tabOrder.add,
        ref: 'editButton',
      });

      ー({
        name: 'Add Item',
        rootSelect: '#extraction-editing',
        select: 'label',
        withText: 'Add Item',
        ref: 'addItem',
      });

      ー({
        name: 'Leave Blank',
        rootSelect: '#extraction-editing',
        select: 'label',
        withText: 'Leave Blank',
        ref: 'leaveBlank',
      });

      ー({
        name: 'ApprovalButtons',
        rootSelect: '.primaryContent',
        rootNumber: 3,
        select: 'label',
        pick: [0, 1],
        ref: 'approvalButtons',
      });

      ー({
        name: 'Comment Box',
        rootSelect: '.addComments',
        select: 'textarea',
        pick: [0],
        onFocusout: util.delay(start, 200),
        onKeydown_CtrlAltArrowRight: () => focusItem(1),
        ref: 'finalCommentBox',
      });

      ー({
        name: 'CanOrCannotExtract',
        select: 'label',
        pick: [0, 1],
        onKeydown_CtrlAltArrowRight: () => focusItem(1),
        ref: 'canOrCannotExtractButtons',
      });
      
      ー({
        name: 'Visit LP',
        select: '.lpButton button',
        pick: [0],
        css: {opacity: 1},
      });
      
      function manualSubmit() {
        const msg =
            'Please use the Submit Hotkey instead of clicking manually.';
        user.log.warn(
          msg,
          {save: true, print: true, toast: true}
        );
        alert(msg);
      };
      manualSubmit = util.debounce(manualSubmit, 4000);

      ー({
        name: 'SubmitButton',
        select: '.submitTaskButton',
        pick: [0],
        css: {opacity: 1},
        onFocusin: manualSubmit,
        ref: 'submitButton',
      })[0].textContent = 'Ready to submit';

      ー({
        name: 'Skip Button',
        select: '.taskIssueButton',
        pick: [0],
        ref: 'skipButton'
      });

      ー({
        name: 'Task Title',
        select: '.taskTitle',
        ref: 'taskTitle'
      });

      ー({
        name: 'TabRemove',
        select: 'label, button',
        onLoad: shared.tabOrder.remove,
      });

      ー({
        name: 'Extractions2And3',
        select: '.extraction',
        pick: [1, 2],
        css: {display: 'none'},
      });

      ー({
        name: 'Preview Extractions',
        select: '.extraction-preview',
        pick: [1, 2],
        css: {display: 'none'},
      });

      const statusReactions = {
        onKeydown_CtrlAltDigit0: setStatus('canExtract'),
        onKeydown_CtrlAltDigit1: setStatus('insufficient'),
        onKeydown_CtrlAltDigit2: setStatus('pageError'),
        onKeydown_CtrlAltDigit3: setStatus('dynamic'),
        onKeydown_CtrlAltDigit4: setStatus('nonLocale'),
        onKeydown_CtrlAltDigit5: setStatus('other'),
        onKeydown_CtrlAltDigit6: setStatus('pII'),
        onKeydown_CtrlAltDigit7: setStatus('drugDomain'),
        onKeydown_CtrlAltDigit8: setStatus('alcoholDomain'),
        onKeydown_CtrlAltDigit9: setStatus('adultDomain'),
        onKeydown_CtrlShiftAltDigit0: setStatus('canExtract'),
        onKeydown_CtrlShiftAltDigit1: setStatus('other'),
        onKeydown_CtrlShiftAltDigit2: setStatus('urlsUnchanged'),
        onKeydown_CtrlShiftAltDigit3: setStatus('urlMismatch'),
        onKeydown_CtrlShiftAltDigit4: setStatus('emptyCreative'),
      };
      
      const experimentalEscapeApprove = () => {
        if (user.config.get('use escape-key to approve')) {
          approve();
        }
      };
      
      const experimentalSubmit = () => {
        if (user.config.get('use escape-key to approve')) {
          submit();
        }
      };
      
      const nordicLayout = {
        onKeydown_CtrlAltBracketLeft: shared.resetCounter,
        onKeydown_CtrlAltBracketRight: shared.skipTask,
        onKeydown_Backslash: approve,
        onKeydown_Escape: experimentalEscapeApprove,
      };
      
      const submitKeys = {
        onKeydown_CtrlEnter: submit,
        onKeydown_CtrlAltEnter: submit,
        onKeydown_CtrlNumpadEnter: submit,
        onKeydown_CtrlShiftEscape: experimentalSubmit,
      };

      eventReactions.setGlobal({
        onKeydown_Backquote: beginTask,
        onKeydown_CtrlAltBackquote: beginTask,
        
        onKeydown_NumpadSubtract: shared.skipTask,
        onKeydown_NumpadAdd: approve,
        
        onKeydown_CtrlShiftDelete: deleteAllItems,
        
        ...statusReactions,
        ...nordicLayout,
        ...submitKeys,
      });
    }

    return {init};
  })();
