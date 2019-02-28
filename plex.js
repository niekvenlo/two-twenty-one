(function screenshotModule() {
  const visible = (domElement) => getComputedStyle(domElement).display !== 'none';
  
  const body = document.body;
  const canvas = document.getElementById('canvas');
  const hist = document.getElementById('annotation-history');
  const img = document.getElementById('screenshot_image');
  const promo = document.getElementById('promo');
  const title = document.getElementById('title');
  const toolbox = document.getElementById('toolbox');
  
  body.style.backgroundColor = '#eee'
  canvas.style.filter = [
    'drop-shadow(-2px -2px 1px white)',
    'drop-shadow(2px 2px 1px grey)',
    'hue-rotate(-40deg)',
  ].join(' ');
  canvas.style.padding = '0 10em 0 0';
  hist.style.opacity = '0.5';
  img.style.filter = 'saturate(80%)';
  promo.style.opacity = '0';
  title.style.backgroundColor = '#eee';
  toolbox.style.opacity = '0.5';
  
  window.scrollTo({top: 30, left: 50});
  
  if (!visible(toolbox)) {
    return;
  }
  function toggleTool() {
    switchTool = false;
    if (toolbox.children[0].className === '') {
      toolbox.children[0].click();
    } else {
      toolbox.children[3].click();
    }
  }
  const editingText = () => !!document.querySelector('input.textbox');
  let switchTool = false;
  let mouseDown = false;
  document.addEventListener('mousedown', (e) => mouseDown = true);
  document.addEventListener('mouseup', (e) => {
    mouseDown = false;
    if (switchTool) {
      toggleTool();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !editingText()) {
      e.preventDefault();
      if (mouseDown) {
        switchTool = true;
        return;
      }
      toolbox.children[3].click();
    }
    if (e.code === 'Backspace' && !editingText()) {
      try {
        hist.lastElementChild.lastElementChild.firstElementChild.click();
      } catch (e) {
        if (!(e instanceof TypeError)) {
          throw e;
        }
      }
    }
  });
  document.addEventListener('keyup', (e) => {
    if (mouseDown) {
      switchTool = true;
      return;
    }
    toolbox.children[0].click();
  });
})();
