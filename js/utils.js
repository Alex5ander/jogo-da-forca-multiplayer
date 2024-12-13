import { wordElement, hintElement, startMenuDialog, playerElements, resultDialog, menuButton, nextButton, keyboard, youWinText, gameOverText, playerWinText, inputColor } from "./elements.js";
/** @type {HTMLAudioElement} */

/** 
 * @param {number} length
 * @param {string} hint
 */
export const createUI = (length, hint, onclick) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  hint ? hintElement.classList.remove('hidde') : hintElement.classList.add('hidde');
  hintElement.innerText = hint ? `Dica: ${hint}` : '';

  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));

  for (let i = 0; i < letters.length; i++) {
    keyboard.children[i].name = letters[i];
    keyboard.children[i].ariaLabel = letters[i];
    keyboard.children[i].disabled = false;
    keyboard.children[i].onclick = onclick;
  }

  let html = '';
  for (let i = 0; i < length; i++) {
    html += `<div class='letter'></div>`;
  }
  keyboard.classList.remove('hidde');
  wordElement.classList.remove('hidde');
  wordElement.innerHTML = html;
}

/** 
 * @param {string[]} usedLetters
 * @param {string[]} correctLetters
 * @param {number} errors
 */
export const updateUI = (usedLetters, correctLetters, errors) => {
  usedLetters.forEach(e => keyboard.children.namedItem(e).disabled = true);

  correctLetters.forEach((e, i) => {
    if (e) {
      wordElement.children[i].innerText = e;
      wordElement.children[i].classList.add('shake');
    }
  });

  const man = document.getElementsByClassName('man');
  for (let i = 0; i < errors; i++) {
    man[i].classList.add('fill');
  }
}

export const resetUI = () => {
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  keyboard.classList.add('hidde');
  [...keyboard.children].forEach(e => { e.disabled = true; e.onclick = null });
  startMenuDialog.showModal();
  wordElement.innerHTML = '';
  playerElements.innerHTML = '';
  playerElements.classList.add('hidde');
  hintElement.classList.add('hidde');
  wordElement.classList.add('hidde');
  resultDialog.close();
}

export const showWin = () => {
  resultDialog.showModal();
  youWinText.classList.remove('hidde');
  gameOverText.classList.add('hidde');
  playerWinText.classList.add('hidde');

  menuButton.classList.add('hidde');
  nextButton.classList.remove('hidde');
}

export const showLose = () => {
  resultDialog.showModal();
  youWinText.classList.add('hidde');
  gameOverText.classList.remove('hidde');
  playerWinText.classList.add('hidde');

  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}


/** @param {string} name */
export const showResultMultiplayer = (name) => {
  [...keyboard.childNodes].forEach(e => { e.disabled = true; e.onclick = null });
  resultDialog.showModal();
  youWinText.classList.add('hidde');
  gameOverText.classList.add('hidde');
  playerWinText.classList.remove('hidde');
  playerWinText.innerText = name;
  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}

const changeStyle = async () => {
  const params = new URLSearchParams(window.location.search);
  const color = params.get('color');
  if (color) {
    document.documentElement.style.setProperty('--primary-color', decodeURIComponent(color));
    inputColor.value = decodeURIComponent(color);
  }
}

let lastTime = performance.now();

inputColor.oninput = () => {
  if (performance.now() - lastTime > 500) {
    history.replaceState({ color: inputColor.value }, "", `/jogo-da-forca-multiplayer/?color=${encodeURIComponent(inputColor.value)}`);
    changeStyle();
    lastTime = performance.now();
  }
}

changeStyle();