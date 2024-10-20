import { wordElement, letterButtons, hintElement, startMenuElement, playerElements, resultElement, menuButton, nextButton, keyboard, youWinText, gameOverText, playerWinText } from "./elements.js";
/** @type {HTMLAudioElement} */
let music;

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

let subtextures = [];

export const loadAssets = async () => {
  const src = await (await fetch('/music')).text();
  music = new Audio(src);

  const loadSpritesheet = async (spritesheet) => {
    const response = await fetch(spritesheet + '.xml');
    const text = await response.text();
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    const images = Array.from(xml.getElementsByTagName('SubTexture'));
    return images;
  };

  await Promise.all(spritesheets.map(async (spritesheet) => {
    const images = await loadSpritesheet(spritesheet);
    subtextures.push({ images, spritesheet });
  }));
};

export const playMusic = async () => {
  if (music.paused) {
    music.loop = true;
    music.volume = 0.05;
    music.play();
  }
}

export const resize = () => {
  const mediaQuery = window.innerWidth >= 768;

  [...letterButtons].forEach(letter => {
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

/** 
 * @param {number} length
 * @param {string} hint
 */
export const createUI = async (length, hint, onclick) => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  hint ? hintElement.classList.remove('hidde') : hintElement.classList.add('hidde');
  hintElement.innerText = hint ? `Dica: ${hint}` : '';

  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  const { images, spritesheet } = subtextures[Math.floor(Math.random() * subtextures.length)];

  for (let i = 0; i < letters.length; i++) {
    const letterSubTexture = images.find(e => e.getAttribute('name') == `letter_${letters[i]}.png`);
    if (letterSubTexture) {
      let ox = parseInt(letterSubTexture.getAttribute('x'));
      let oy = parseInt(letterSubTexture.getAttribute('y'));
      const letterBtn = letterButtons.namedItem(letters[i]);
      letterBtn.dataset.originalX = `${ox}`
      letterBtn.dataset.originalY = `${oy}`;
      letterBtn.name = letters[i];
      letterBtn.ariaLabel = letters[i];
      letterBtn.style.backgroundImage = `url(${spritesheet}.png)`;
      letterBtn.disabled = false;
      letterBtn.onclick = onclick;
    }
  }

  let html = '';
  const letterSubTexture = images.find(e => e.getAttribute('name') == `letter.png`);
  for (let i = 0; i < length; i++) {
    let ox = parseInt(letterSubTexture.getAttribute('x'));
    let oy = parseInt(letterSubTexture.getAttribute('y'));
    const style = `background-image: url(${spritesheet}.png);`;
    html += `<div data-original-x='${ox}' data-original-y='${oy}' style='${style}' class='letter'></div>`;
  }
  keyboard.classList.remove('hidde');
  wordElement.classList.remove('hidde');
  wordElement.innerHTML = html;
  resize();
}

/** 
 * @param {string[]} usedLetters
 * @param {string[]} correctLetters
 * @param {number} errors
 */
export const updateUI = (usedLetters, correctLetters, errors) => {
  usedLetters.forEach(e => letterButtons.namedItem(e).disabled = true);

  correctLetters.forEach((e, i) => {
    const letterBtn = letterButtons.namedItem(e);
    if (letterBtn) {
      wordElement.children[i].dataset.originalX = letterBtn.dataset.originalX;
      wordElement.children[i].dataset.originalY = letterBtn.dataset.originalY;
      wordElement.children[i].style.backgroundPosition = letterBtn.style.backgroundPosition;
      wordElement.children[i].classList.add('shake')
    }
  });

  const man = document.getElementsByClassName('man');
  for (let i = 0; i < errors; i++) {
    man[i].classList.add('fill');
  }
}

export const resetUI = () => {
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  keyboard.classList.add('hidde');
  [...letterButtons].forEach(e => { e.disabled = true; e.onclick = null });
  startMenuElement.classList.remove('hidde');
  wordElement.innerHTML = '';
  playerElements.innerHTML = '';
  playerElements.classList.add('hidde');
  hintElement.classList.add('hidde');
  wordElement.classList.add('hidde');
  resultElement.classList.add('hidde');
}

export const showWin = () => {
  resultElement.classList.remove('hidde');
  youWinText.classList.remove('hidde');
  gameOverText.classList.add('hidde');
  playerWinText.classList.add('hidde');

  menuButton.classList.add('hidde');
  nextButton.classList.remove('hidde');
}

export const showLose = () => {
  resultElement.classList.remove('hidde');
  youWinText.classList.add('hidde');
  gameOverText.classList.remove('hidde');
  playerWinText.classList.add('hidde');

  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}


/** @param {string} name */
export const showResultMultiplayer = (name) => {
  [...letterButtons].forEach(e => { e.disabled = true; e.onclick = null });
  resultElement.classList.remove('hidde');
  youWinText.classList.add('hidde');
  gameOverText.classList.add('hidde');
  playerWinText.classList.remove('hidde');
  playerWinText.innerText = name;
  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}