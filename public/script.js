import { createSocket } from './socket.js';
/** @type {HTMLAudioElement} */
let music;

const playMusic = async () => {
  if (!music) {
    const src = await (await fetch('/music')).text();
    music = new Audio(src);
    music.loop = true;
    music.volume = 0.25;
    music.play();
  }
}

const wordElement = document.getElementById('word');
const letterButtons = Array.from(document.getElementsByClassName('letters__letter'));
const playersElements = document.getElementById('players');
const gameStartMenuElement = document.getElementById('start-menu');
const gameResultElement = document.getElementById('result');
const startButton = document.getElementById('start');
const startMultiplayerButton = document.getElementById('start-multiplayer');
const menuButton = document.getElementById('menu');

const spritesheets = [
  'spritesheet/blue_spritesheet',
  'spritesheet/box_spritesheet',
  'spritesheet/brown_spritesheet',
  'spritesheet/marble_spritesheet',
  'spritesheet/metal_spritesheet',
  'spritesheet/solid_spritesheet',
  'spritesheet/wood_spritesheet',
  'spritesheet/yellow_spritesheet'
];

const letters = 'ABCÇDEFGHIJKLMNOPQRSTUVWXYZ';

const resize = () => {
  const mediaQuery = window.innerWidth >= 768;
  letterButtons.forEach(letter => {
    let ox = parseInt(letter.dataset.originalX);
    let oy = parseInt(letter.dataset.originalY);
    let x = mediaQuery ? ox / 4 : ox / 8;
    let y = mediaQuery ? oy / 4 : oy / 8;
    letter.style.backgroundPosition = `-${x}px -${y}px`;
  });

  [...wordElement.children].forEach(letter => {
    let ox = parseInt(letter.dataset.originalX);
    let oy = parseInt(letter.dataset.originalY);
    let x = mediaQuery ? ox / 4 : ox / 8;
    let y = mediaQuery ? oy / 4 : oy / 8;
    letter.style.backgroundPosition = `-${x}px -${y}px`;
  })
}

const onLetterClick = async (e) => {
  try {
    const letter = e.target.dataset.letter;
    const { usedLetters, correctLetters, errors, win } = await (await fetch(`/letter/${letter}`)).json();
    updateGame(usedLetters, correctLetters, errors, win);
  } catch (error) {
    console.error(error);
  }
}

const loadSubTextures = async () => {
  const index = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[index];
  const response = await fetch(spritesheet + '.xml');
  const text = await response.text();
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  const images = Array.from(xml.getElementsByTagName('SubTexture'));
  return { images, spritesheet };
}

const createGame = async (length) => {
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  const { images, spritesheet } = await loadSubTextures();

  for (let i = 0; i < letters.length; i++) {
    const letterSubTexture = images.find(e => e.getAttribute('name') == `letter_${letters[i]}.png`);
    if (letterSubTexture) {
      let ox = parseInt(letterSubTexture.getAttribute('x'));
      let oy = parseInt(letterSubTexture.getAttribute('y'));
      const letterBtn = letterButtons.find(e => e.dataset.letter == letters[i]);
      letterBtn.dataset.originalX = `${ox}`
      letterBtn.dataset.originalY = `${oy}`;
      letterBtn.style.backgroundImage = `url(${spritesheet}.png)`;
      letterBtn.disabled = false;
    }
  }

  let html = '';
  const letterSubTexture = images.find(e => e.getAttribute('name') == `letter.png`);
  for (let i = 0; i < length; i++) {
    let ox = parseInt(letterSubTexture.getAttribute('x'));
    let oy = parseInt(letterSubTexture.getAttribute('y'));
    let x = ox / 8;
    let y = oy / 8;
    const style = `background-position:-${x}px -${y}px;background-image: url(${spritesheet}.png);`;
    html += `<div data-original-x='${ox} 'data-original-y='${oy}' style='${style}'class='letters__letter'></div>`;
  }
  wordElement.innerHTML = html;
  resize();
}

const resetGame = () => {
  letterButtons.forEach(e => e.disabled = false);
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  gameStartMenuElement.classList.remove('hidde');
  wordElement.innerHTML = '';
  playersElements.innerHTML = '';
  gameResultElement.classList.add('hidde');
}

const start = async () => {
  gameStartMenuElement.classList.add('hidde');
  const word = await (await fetch('/new-game')).json();
  createGame(word.length);
  letterButtons.forEach(btn => btn.onclick = onLetterClick);
  playMusic();
}

const updateGame = (usedLetters, correctLetters, errors, win) => {
  let l = letterButtons.filter(e => usedLetters.find(l => l == e.dataset.letter));
  l.forEach(e => { e.disabled = true });

  correctLetters.forEach((e, i) => {
    const letterBtn = letterButtons.find(l => l.dataset.letter == e);
    if (letterBtn) {
      wordElement.children[i].dataset.originalX = letterBtn.dataset.originalX;
      wordElement.children[i].dataset.originalY = letterBtn.dataset.originalY;
      wordElement.children[i].style.backgroundPosition = letterBtn.style.backgroundPosition;
    }
  });

  const man = document.getElementsByClassName('man');
  for (let i = 0; i < errors; i++) {
    man[i].classList.add('fill');
  }
  const name = gameResultElement.children[0];

  if (errors == 6 || win) {
    gameResultElement.classList.remove('hidde');
  }
  if (errors == 6) {
    name.innerText = 'Fim do jogo!';
  } else if (win) {
    name.innerText = `Jogador: ${win} venceu!`;
  }
}

const updatePlayersList = (players) => {
  players.length > 0 ? playersElements.classList.remove('hidde') : playersElements.classList.add('hidde');
  playersElements.innerHTML = `<p style='text-align:center;'>Jogadores</p>`;
  players.forEach(player => playersElements.innerHTML += `<p class='players__player'>${player.name}</p>`);
}

const onJoin = async ({ length, players, usedLetters, correctLetters, errors }) => {
  updatePlayersList(players);
  await createGame(length);
  updateGame(usedLetters, correctLetters, errors);
}

const onUpdate = ({ usedLetters, correctLetters, errors, win }) => {
  updateGame(usedLetters, correctLetters, errors, win);
}

const startMultiplayer = async () => {
  const playername = prompt('Digite seu nome')?.trim();
  if (playername == undefined || playername.length == 0) { return };

  gameStartMenuElement.classList.add('hidde');

  const socket = createSocket();
  socket.join(playername, onJoin);
  socket.onUpdate(onUpdate);
  socket.onNewPlayerJoin(updatePlayersList);
  socket.onPlayerDisconnect(updatePlayersList);
  letterButtons.forEach(btn => btn.onclick = e => socket.guess(e.target.dataset.letter));

  playMusic();
}

(async () => {
  const data = await fetch('./forca.svg');
  const text = await data.text();
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(text, 'image/svg+xml');
  const svg = doc.querySelector("svg");
  document.getElementById('svg').appendChild(svg);
  createGame(0);
})();

window.addEventListener('resize', resize);
startButton.addEventListener('click', start);
startMultiplayerButton.addEventListener('click', startMultiplayer);
menuButton.addEventListener('click', resetGame);

window.addEventListener('keydown', e => (e.ctrlKey == e.shiftKey && e.key == 'I') || e.key == 'F12' && e.preventDefault());
window.oncontextmenu = e => e.preventDefault();