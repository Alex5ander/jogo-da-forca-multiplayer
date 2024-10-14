const wordElement = document.getElementById('word');
const letterButtons = Array.from(document.getElementsByClassName('letters__button'));
const playersElements = document.getElementById('players');
const gameStartMenuElement = document.getElementById('start-menu');
const gameResultElement = document.getElementById('result');

let socket;

const words = ['BANANA', 'UVA', 'ABACAXI', 'LARANJA', 'PITAIA', 'MELANCIA'];

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

let word = '';
const letters = 'ABCÇDEFGHIJKLMNOPQRSTUVWXYZ';

/** @type {HTMLElement[]} */
let subtextures = [];

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

const checkWin = () => {
  if (document.getElementsByClassName('correct').length == word.length) {
    setTimeout(() => {
      alert('Você venceu!');
      start();
    });
  }
}

const checkLose = () => {
  const man = document.querySelectorAll('.man:not(.fill)');
  if (man.length > 0) {
    man[0].classList.add('fill');
    if (man.length == 1) {
      setTimeout(() => {
        alert('Você perdeu!');
        start();
      });
    }
  }
}

const onLetterClick = (e) => {
  e.target.disabled = true;
  const letter = e.target.dataset.letter;

  if (word.search(letter) != -1) {
    const regexp = new RegExp(letter, 'g');
    const regexpstringInterator = word.matchAll(regexp);
    let data;
    while (!(data = regexpstringInterator.next()).done) {
      const index = data.value['index'];
      wordElement.children[index].classList.add('correct');
      wordElement.children[index].dataset.originalX = e.target.dataset.originalX;
      wordElement.children[index].dataset.originalY = e.target.dataset.originalY;
      wordElement.children[index].style.backgroundPosition = e.target.style.backgroundPosition;
    }
    checkWin();
  } else {
    checkLose();
  }
}

const loadSubTextures = async (index) => {
  const spritesheet = spritesheets[index];
  const response = await fetch(spritesheet + '.xml');
  const text = await response.text();
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  const subtextures = Array.from(xml.getElementsByTagName('SubTexture'));
  return subtextures;
}

const createGame = (spritesheet, wordLength, onclick) => {
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'))

  for (let i = 0; i < letters.length; i++) {
    const letterSubTexture = subtextures.find(e => e.getAttribute('name') == `letter_${letters[i]}.png`);
    if (letterSubTexture) {
      let ox = parseInt(letterSubTexture.getAttribute('x'));
      let oy = parseInt(letterSubTexture.getAttribute('y'));
      const letterBtn = letterButtons.find(e => e.dataset.letter == letters[i]);
      letterBtn.dataset.originalX = `${ox}`
      letterBtn.dataset.originalY = `${oy}`;
      letterBtn.style.backgroundImage = `url(${spritesheet}.png)`;
      letterBtn.onclick = onclick;
      letterBtn.disabled = false;
    }
  }

  let html = '';
  const letterSubTexture = subtextures.find(e => e.getAttribute('name') == `letter.png`);
  for (let i = 0; i < wordLength; i++) {
    let ox = parseInt(letterSubTexture.getAttribute('x'));
    let oy = parseInt(letterSubTexture.getAttribute('y'));
    let x = ox / 8;
    let y = oy / 8;
    const style = `background-position:-${x}px -${y}px;background-image: url(${spritesheet}.png);`;
    html += `<div data-original-x='${ox} 'data-original-y='${oy}' style='${style}'class='letters__button'></div>`;
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

  const spriteIndex = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[spriteIndex];
  subtextures = await loadSubTextures(spriteIndex);

  word = words[Math.floor(Math.random() * words.length)];

  createGame(spritesheet, word.length, onLetterClick);
}

const updateGame = (usedLetters, correctLetters, errors, win) => {
  let letterBtnsUsed = letterButtons.filter(e => usedLetters.find(l => l == e.dataset.letter));
  letterBtnsUsed.forEach(e => { e.disabled = true });

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

const onJoin = ({ spritesheet, wordLength, players }) => {
  playersElements.innerHTML = '';
  players.forEach(player => playersElements.innerHTML += `<p>${player.name}</p>`);
  createGame(spritesheet, wordLength, (e) => socket.emit('guess', e.target.dataset.letter));
}

const onUpdate = ({ usedLetters, correctLetters, errors, players, win }) => {
  playersElements.innerHTML = '';
  players.forEach(player => playersElements.innerHTML += `<p>${player.name}</p>`);
  updateGame(usedLetters, correctLetters, errors, win);
}

const startMultiplayer = async () => {
  const playername = prompt('Digite seu nome')?.trim();
  if (playername == undefined || playername.length == 0) { return };

  gameStartMenuElement.classList.add('hidde');

  const spriteIndex = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[spriteIndex];
  subtextures = await loadSubTextures(spriteIndex);

  socket = io();
  socket.emit('join', playername);
  socket.on('join', (data) => onJoin({ ...data, spritesheet }));
  socket.on('update', onUpdate);
}

(async () => {
  const spriteIndex = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[spriteIndex];
  subtextures = await loadSubTextures(spriteIndex);

  const data = await fetch('./forca.svg');
  const text = await data.text();
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(text, 'image/svg+xml');
  const svg = doc.querySelector("svg");
  document.getElementById('svg').appendChild(svg);
  createGame(spritesheet, 0, () => { });
})();

window.addEventListener('resize', resize);