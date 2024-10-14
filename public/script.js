const wordElement = document.getElementById('word');
const letterButtons = Array.from(document.getElementById('letters').children);
const playersList = document.getElementById('players');

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
/** @type {HTMLElement[]} */
let wordLetters = [];

const resize = () => {
  const mediaQuery = window.innerWidth >= 768;
  letterButtons.forEach(letter => {
    let ox = parseInt(letter.dataset.originalX);
    let oy = parseInt(letter.dataset.originalY);
    let x = mediaQuery ? ox / 4 : ox / 8;
    let y = mediaQuery ? oy / 4 : oy / 8;
    letter.style.backgroundPosition = `-${x}px -${y}px`;
  });

  wordLetters.forEach(letter => {
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
      wordLetters[index].classList.add('correct');
      wordLetters[index].dataset.originalX = e.target.dataset.originalX;
      wordLetters[index].dataset.originalY = e.target.dataset.originalY;
      wordLetters[index].style.backgroundPosition = e.target.style.backgroundPosition;
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
    html += `<div data-original-x='${ox} 'data-original-y='${oy}' style='${style}'class='letterBtn wordLetter'></div>`;
  }
  wordElement.innerHTML = html;
  wordLetters = Array.from(wordElement.getElementsByTagName('div'));
  resize();
}

const resetGame = () => {
  letterButtons.forEach(e => e.disabled = false);
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  document.getElementById('game-mode').classList.remove('hidde');
  wordElement.innerHTML = '';
  playersList.innerHTML = '';
}

const start = async () => {
  document.getElementById('game-mode').classList.add('hidde');

  const spriteIndex = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[spriteIndex];
  subtextures = await loadSubTextures(spriteIndex);

  word = words[Math.floor(Math.random() * words.length)];

  createGame(spritesheet, word.length, onLetterClick);
}

const updateGame = (usedLetters, correctLetters, errors) => {
  let letterBtnsUsed = letterButtons.filter(e => usedLetters.find(l => l == e.dataset.letter));
  letterBtnsUsed.forEach(e => { e.disabled = true });

  correctLetters.forEach((e, i) => {
    const letterBtn = letterButtons.find(l => l.dataset.letter == e);
    if (letterBtn) {
      wordLetters[i].dataset.originalX = letterBtn.dataset.originalX;
      wordLetters[i].dataset.originalY = letterBtn.dataset.originalY;
      wordLetters[i].style.backgroundPosition = letterBtn.style.backgroundPosition;
    }
  });

  const man = document.getElementsByClassName('man');
  for (let i = 0; i < errors; i++) {
    man[i].classList.add('fill');
  }
  if (errors == 6) {
    alert('Você perdeu!');
    socket.disconnect();
  }
}

const startMultiplayer = async () => {
  const playername = prompt('Digite seu nome')?.trim();
  if (playername == undefined || playername.length == 0) { return };

  document.getElementById('game-mode').classList.add('hidde');

  const spriteIndex = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[spriteIndex];
  subtextures = await loadSubTextures(spriteIndex);

  socket = io();
  socket.on('disconnect', resetGame);
  socket.emit('join', playername);

  socket.on('join', ({ wordLength, usedLetters, correctLetters, players, errors }) => {
    playersList.innerHTML = '';
    players.forEach(player => playersList.innerHTML += `<p>${player.name}</p>`);
    createGame(spritesheet, wordLength, (e) => socket.emit('guess', e.target.dataset.letter));
    updateGame(usedLetters, correctLetters, errors);
  });

  socket.on('update', ({ usedLetters, correctLetters, errors, players, win }) => {
    playersList.innerHTML = '';
    players.forEach(player => playersList.innerHTML += `<p>${player.name}</p>`);
    updateGame(usedLetters, correctLetters, errors);
    if (win) {
      alert(win);
      setTimeout(() => socket.disconnect(), 3000);
    }
  });
}

(async () => {
  const spriteIndex = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[spriteIndex];
  subtextures = await loadSubTextures(spriteIndex);
  createGame(spritesheet, 0, () => { });
})();

window.addEventListener('resize', resize);