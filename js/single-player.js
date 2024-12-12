import Game from './game.js';
import { keyboard, startMenuDialog, startButton, resultDialog, nextButton } from './elements.js';
import { updateUI, createUI, showLose, showWin } from './utils.js';

const origin = 'https://jogo-da-forca-multiplayer-server.glitch.me/';

/** @type {Game} */
let game;
let score = 0;

const next = () => {
  resultDialog.close();
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
  startMenuDialog.close();
  /** @type {{value:string; hint:string}} word  */
  const word = await (await fetch(`${origin}/random-word`)).json();
  game = new Game(word);
  createUI(word.value.length, word.hint, onLetterClick);
}

startButton.onclick = start;
nextButton.onclick = next;