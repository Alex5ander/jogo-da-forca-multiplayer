import Game from './game.js';
import { letterButtons, startMenuElement, startButton, resultElement, nextButton, menuButton } from './elements.js';
import { playMusic, updateUI, createUI, showLose, showWin } from './utils.js';

/** @type {Game} */
let game;
let score = 0;

const next = () => {
  resultElement.classList.add('hidde');
  [...resultElement.children].forEach(e => e.classList.add('hidde'));
  start();
}

/** @param {MouseEvent} e */
const onLetterClick = async (e) => {
  e.target.disabled = true;
  const letter = e.target.name;
  game.useLetter(letter);
  const { usedLetters, correctLetters, errors } = game;
  updateUI(usedLetters, correctLetters, errors);

  if (errors == 6 || game.isWin()) {
    Array.from(letterButtons).forEach(e => e.onclick = null);
    resultElement.classList.remove('hidde');
  }
  if (errors == 6) {
    showLose();
    score = 0;
  } else if (game.isWin()) {
    showWin();
    score += 1;
  }
}

const start = async () => {
  /** @type {{value:string; hint:string}} word  */
  const word = await (await fetch('/random-word')).json();
  startMenuElement.classList.add('hidde');
  game = new Game(word);
  createUI(word.value.length, word.hint);
  [...letterButtons].forEach(e => e.onclick = onLetterClick);
  playMusic();
}

startButton.onclick = start;
nextButton.onclick = next;