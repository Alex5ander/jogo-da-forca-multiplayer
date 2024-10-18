import { createSocket } from './socket.js';
import { playersElement, startMultiplayerButton, formName, menuButton, startMenuElement } from './elements.js';
import { playMusic, resize, updateUI, createUI, resetUI, showResultMultiplayer, loadAssets } from './utils.js';

const updatePlayersList = (players) => {
  players.length > 0 ? playersElement.classList.remove('hidde') : playersElement.classList.add('hidde');
  playersElement.innerHTML = `<p style='text-align:center;'>Jogadores</p>`;
  players.forEach(player => playersElement.innerHTML += `<p class='players__player'>${player.name}</p>`);
}

const onJoin = async ({ hint, length, players, usedLetters, correctLetters, errors }, callback) => {
  updatePlayersList(players);
  await createUI(length, hint, callback);
  updateUI(usedLetters, correctLetters, errors);
}

const onUpdate = ({ usedLetters, correctLetters, errors, result }) => {
  updateUI(usedLetters, correctLetters, errors);
  result && showResultMultiplayer(result);
}

const startMultiplayer = async (name) => {
  startMenuElement.classList.add('hidde');

  const socket = createSocket();
  socket.join(name, (data) => onJoin(data, (e) => socket.guess(e.target.name)));
  socket.onUpdate(onUpdate);
  socket.onNewPlayerJoin(updatePlayersList);
  socket.onPlayerDisconnect(updatePlayersList);

  playMusic();
}

(async () => {
  await loadAssets();
  const data = await fetch('./forca.svg');
  const text = await data.text();
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(text, 'image/svg+xml');
  const svg = doc.querySelector("svg");
  document.body.insertBefore(svg, document.body.childNodes[0])
})();

const onStartMultiplayerClick = () => {
  formName.classList.remove('hidde');
  startMenuElement.classList.add('hidde');
}

formName.addEventListener('submit', e => {
  e.preventDefault();
  const { value } = e.target.name;
  if (value == undefined || value.length == 0 && value.length <= 10) { return };
  startMultiplayer(value);
  formName.classList.add('hidde');
});

formName.onreset = () => {
  formName.classList.add('hidde');
  startMenuElement.classList.remove('hidde');
};

window.onresize = resize;
menuButton.onclick = resetUI;
startMultiplayerButton.onclick = onStartMultiplayerClick;

window.addEventListener('keydown', e => (e.ctrlKey == e.shiftKey && e.key == 'I') || e.key == 'F12' && e.preventDefault());
window.oncontextmenu = e => e.preventDefault();