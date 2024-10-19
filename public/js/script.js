import { createSocket } from './socket.js';
import { playerElements, startMultiplayerButton, formName, menuButton, startMenuElement, formContainer } from './elements.js';
import { playMusic, resize, updateUI, createUI, resetUI, showResultMultiplayer, loadAssets } from './utils.js';


const createPlayerElement = (name) => {

  const personSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
</svg>`;

  return `
<div class='players__player'>
  <div>${personSvg}</div>
  <div>${name}</span>
</div>`
}

const updatePlayersList = (players) => {
  players.length > 0 ? playerElements.classList.remove('hidde') : playerElements.classList.add('hidde');
  playerElements.innerHTML = `<p style='text-align:center;'>Jogadores</p>`;
  players.forEach(player => playerElements.innerHTML += createPlayerElement(player));
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

(async () => await loadAssets())();

const onStartMultiplayerClick = () => {
  formContainer.classList.remove('hidde');
  startMenuElement.classList.add('hidde');
}

formName.addEventListener('submit', e => {
  e.preventDefault();
  const { value } = e.target.name;
  if (value == undefined || value.length == 0 && value.length <= 10) { return };
  startMultiplayer(value);
  formContainer.classList.add('hidde');
});

formName.onreset = () => {
  formContainer.classList.add('hidde');
  startMenuElement.classList.remove('hidde');
};

window.onresize = resize;
menuButton.onclick = resetUI;
startMultiplayerButton.onclick = onStartMultiplayerClick;

window.addEventListener('keydown', e => (e.ctrlKey == e.shiftKey && e.key == 'I') || e.key == 'F12' && e.preventDefault());
window.oncontextmenu = e => e.preventDefault();
