/** buttons */
/** @type {HTMLButtonElement} */
const startButton = document.getElementById('start');
/** @type {HTMLButtonElement} */
const startMultiplayerButton = document.getElementById('start-multiplayer');
/** @type {HTMLButtonElement} */
const menuButton = document.getElementById('menu');
/** @type {HTMLButtonElement} */
const nextButton = document.getElementById('next');

const keyboard = document.getElementById('keyboard');

/** dialogs */
/** @type {HTMLDialogElement} */
const startMenuDialog = document.getElementById('start-menu');
startMenuDialog.showModal();
/** @type {HTMLDialogElement} */
const resultDialog = document.getElementById('result');
/** @type {HTMLDialogElement} */
const formNameDialog = document.getElementById('form-container');

const playerElements = document.getElementById('players');
const hintElement = document.getElementById('hint');
/** @type {HTMLFormElement} */
const formName = document.getElementById('form-name');
const wordElement = document.getElementById('word');
/** @type { HTMLInputElement} */
const inputColor = document.getElementById('input-color');

/** text */
const gameOverText = document.getElementById('game-over');
const youWinText = document.getElementById('you-win');
const playerWinText = document.getElementById('player-win');

/** @type {HTMLDialogElement} */
const loader = document.getElementById('loader');

export {
  loader,
  inputColor,
  keyboard,
  wordElement,
  playerElements,
  startMenuDialog,
  resultDialog,
  gameOverText,
  youWinText,
  playerWinText,
  menuButton,
  nextButton,
  startButton,
  startMultiplayerButton,
  hintElement,
  formNameDialog,
  formName,
}