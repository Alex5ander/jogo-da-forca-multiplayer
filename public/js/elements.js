/** buttons */
const startButton = document.getElementById('start');
const keyboard = document.getElementById('keyboard');
const startMultiplayerButton = document.getElementById('start-multiplayer');
const menuButton = document.getElementById('menu');
const nextButton = document.getElementById('next');

/** containers */
const playerElements = document.getElementById('players');
const startMenuElement = document.getElementById('start-menu');
const resultElement = document.getElementById('result');
const hintElement = document.getElementById('hint');
const formContainer = document.getElementById('form-container');
const formName = document.getElementById('form-name');
const wordElement = document.getElementById('word');

/** text */
const gameOverText = document.getElementById('game-over');
const youWinText = document.getElementById('you-win');
const playerWinText = document.getElementById('player-win');

export {
  keyboard,
  wordElement,
  playerElements,
  startMenuElement,
  resultElement,
  gameOverText,
  youWinText,
  playerWinText,
  menuButton,
  nextButton,
  startButton,
  startMultiplayerButton,
  hintElement,
  formContainer,
  formName,
}