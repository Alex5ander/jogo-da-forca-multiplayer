import { wordElement, letterButtons, hintElement, startMenuElement, playersElement, resultElement, menuButton, nextButton } from "./elements.js";
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

const loadSubTextures = async () => {
  const index = Math.floor(Math.random() * spritesheets.length);
  const spritesheet = spritesheets[index];
  const response = await fetch(spritesheet + '.xml');
  const text = await response.text();
  const xml = new DOMParser().parseFromString(text, 'application/xml');
  const images = Array.from(xml.getElementsByTagName('SubTexture'));
  return { images, spritesheet };
}

export const playMusic = async () => {
  const src = await (await fetch('/music')).text();
  music = new Audio(src);
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
export const createUI = async (length, hint) => {
  const letters = 'ABCÇDEFGHIJKLMNOPQRSTUVWXYZ';
  hint ? hintElement.classList.remove('hidde') : hintElement.classList.add('hidde');
  hintElement.innerText = hint ? `Dica: ${hint}` : '';

  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  const { images, spritesheet } = await loadSubTextures();

  for (let i = 0; i < letters.length; i++) {
    const letterSubTexture = images.find(e => e.getAttribute('name') == `letter_${letters[i]}.png`);
    if (letterSubTexture) {
      let ox = parseInt(letterSubTexture.getAttribute('x'));
      let oy = parseInt(letterSubTexture.getAttribute('y'));
      const letterBtn = letterButtons.namedItem(letters[i]);
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
    }
  });

  const man = document.getElementsByClassName('man');
  for (let i = 0; i < errors; i++) {
    man[i].classList.add('fill');
  }
}

export const resetUI = () => {
  document.querySelectorAll('.fill').forEach(e => e.classList.remove('fill'));
  [...letterButtons].forEach(e => { e.disabled = false; e.onclick = null });
  startMenuElement.classList.remove('hidde');
  wordElement.innerHTML = '';
  playersElement.innerHTML = '';
  hintElement.classList.add('hidde');
  wordElement.classList.add('hidde');
  resultElement.classList.add('hidde');
  [...resultElement.children].forEach(e => e.classList.add('hidde'));
}

export const showWin = () => {
  resultElement.classList.remove('hidde');
  resultElement.children[0].classList.add('hidde')
  resultElement.children[1].classList.remove('hidde');
  menuButton.classList.add('hidde');
  nextButton.classList.remove('hidde');
}

export const showLose = () => {
  resultElement.classList.remove('hidde');
  resultElement.children[0].classList.remove('hidde')
  resultElement.children[1].classList.add('hidde');
  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}


/** @param {string} name */
export const showResultMultiplayer = (name) => {
  resultElement.classList.remove('hidde');
  resultElement.children[0].classList.add('hidde')
  resultElement.children[1].classList.add('hidde');
  resultElement.children[2].classList.remove('hidde');
  resultElement.children[2].innerText = name;
  menuButton.classList.remove('hidde');
  nextButton.classList.add('hidde');
}