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

export {
  lettersElement,
  letterButtons,
  wordElement,
  playersElement,
  startMenuElement,
  resultElement,
  menuButton,
  nextButton,
  startButton,
  startMultiplayerButton,
  hintElement,
  formName,
}