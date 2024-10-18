/** buttons */
const startButton = document.getElementById('start');
const lettersElement = document.getElementById('letters');
const letterButtons = document.getElementsByClassName('letters__letter');
const startMultiplayerButton = document.getElementById('start-multiplayer');
const menuButton = document.getElementById('menu');
const nextButton = document.getElementById('next');

/** containers */
const playersElement = document.getElementById('players');
const startMenuElement = document.getElementById('start-menu');
const resultElement = document.getElementById('result');
const hintElement = document.getElementById('hint');
const formName = document.forms[0];
const wordElement = document.getElementById('word');

/** text */
const gameOverText = document.getElementById('game-over');
const youWinText = document.getElementById('you-win');
const playerWinText = document.getElementById('player-win');

export {
  lettersElement,
  letterButtons,
  wordElement,
  playersElement,
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
  formName,
}