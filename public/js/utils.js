import { wordElement, hintElement, startMenuElement, playerElements, resultElement, menuButton, nextButton, keyboard, youWinText, gameOverText, playerWinText } from "./elements.js";
/** @type {HTMLAudioElement} */

/** 
 * @param {number} length
 * @param {string} hint
 */
export const createUI = async (length, hint, onclick) => {
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
  startMenuElement.classList.remove('hidde');
  wordElement.innerHTML = '';
  playerElements.innerHTML = '';
  playerElements.classList.add('hidde');
  hintElement.classList.add('hidde');
  wordElement.classList.add('hidde');
  resultElement.classList.add('hidde');
}

export const showWin = () => {
  resultElement.classList.remove('hidde');
  youWinText.classList.remove('hidde');
  gameOverText.classList.add('hidde');
  playerWinText.classList.add('hidde');

  menuButton.classList.add('hidde');
  nextButton.classList.remove('hidde');
}

export const showLose = () => {
  resultElement.classList.remove('hidde');
  youWinText.classList.add('hidde');
  gameOverText.classList.remove('hidde');
  playerWinText.classList.add('hidde');

  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}


/** @param {string} name */
export const showResultMultiplayer = (name) => {
  [...keyboard.childNodes].forEach(e => { e.disabled = true; e.onclick = null });
  resultElement.classList.remove('hidde');
  youWinText.classList.add('hidde');
  gameOverText.classList.add('hidde');
  playerWinText.classList.remove('hidde');
  playerWinText.innerText = name;
  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}