import Game from './game.js';
import { keyboard, startMenuElement, startButton, resultElement, nextButton } from './elements.js';
import { playMusic, updateUI, createUI, showLose, showWin } from './utils.js';

/** @type {Game} */
let game;
let score = 0;

const next = () => {
  resultElement.classList.add('hidde');
  start();
}

/** @param {MouseEvent} e */
const onLetterClick = async (e) => {
  e.target.disabled = true;
  const letter = e.target.name;
  game.useLetter(letter);
  const { usedLetters, correctLetters, errors } = game;
  updateUI(usedLetters, correctLetters, errors);

  if (game.isEnd()) {
    [...keyboard.children].forEach(e => { e.disabled = true; e.onclick = null });
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
  createUI(word.value.length, word.hint, onLetterClick);
  playMusic();
}

startButton.onclick = start;
nextButton.onclick = next;