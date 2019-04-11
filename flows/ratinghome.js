flows.home = (function homeModule() {

  function init() {

    shared.guiUpdate('Rating Home Loaded');
    user.log.ok('TwoTwentyOne loaded');

    /**
     * Click the 'Acquire next task' button.
     */
    async function clickAcquire() {
      util.attention(ref.firstButton, 0, 'click');
      try {
        await util.retry(clickContinue, 50, 150)();
      } catch (e) {
        user.log.warn('Continue button did not appear.', {print: false});
      }
    }

    /**
     * Click the 'Continue to Task' button if it exists.
     */
    function clickContinue() {
      const continueButton = ref.fresh('firstButton');
      if (continueButton && /Continue/.test(continueButton.textContent)) {
        continueButton.click();
        return true;
      }
      return false;
    }

    /**
     * Trigger the onClick toggle of yes/no select HTMLElements with the
     * keyboard.
     *
     * @param {number} key - Number representing the number key pressed.
     */
    function toggleSelectWithKey(key) {
      return function toggle() {
        util.attention(ref.select, key - 1, 'click');
      }
    }

    ー({
      name: 'Select',
      select: 'select',
      onClick: shared.toggleSelectYesNo,
      ref: 'select',
    });

    ー({
      name: 'First Button',
      select: 'button',
      pick: [0],
      onClick: clickAcquire,
      ref: 'firstButton',
    });

    eventReactions.setGlobal({
      onKeydown_CtrlAltDigit1: toggleSelectWithKey(1),
      onKeydown_CtrlAltDigit2: toggleSelectWithKey(2),
      onKeydown_CtrlAltDigit3: toggleSelectWithKey(3),
      onKeydown_CtrlAltDigit4: toggleSelectWithKey(4),
      onKeydown_CtrlAltDigit5: toggleSelectWithKey(5),
      onKeydown_CtrlAltDigit6: toggleSelectWithKey(6),
      onKeydown_CtrlAltDigit7: toggleSelectWithKey(7),
      onKeydown_CtrlAltDigit8: toggleSelectWithKey(8),
      onKeydown_CtrlAltDigit9: toggleSelectWithKey(9),
      onKeydown_CtrlAltDigit0: () => {
        for (let idx = 0; idx < 10; idx++) {
          toggleSelectWithKey(idx)();
        }
      },
      onKeydown_Enter: clickAcquire,
      onKeydown_NumpadEnter: clickAcquire,
      onKeydown_Space: clickAcquire,
      onKeydown_CtrlAltBracketLeft: shared.resetCounter,
    });

  }
  return {init};
})();
