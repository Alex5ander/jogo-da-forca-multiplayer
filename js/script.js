import { createSocket } from './socket.js';
import { playerElements, startMultiplayerButton, formName, menuButton, startMenuDialog, formNameDialog, loader } from './elements.js';
import { updateUI, createUI, resetUI, showResultMultiplayer } from './utils.js';


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

const onJoin = ({ hint, length, players, usedLetters, correctLetters, errors }, callback) => {
  createUI(length, hint, callback);
  updateUI(usedLetters, correctLetters, errors);
  updatePlayersList(players);
  loader.close();
}

const onUpdate = ({ usedLetters, correctLetters, errors, result }) => {
  updateUI(usedLetters, correctLetters, errors);
  result && showResultMultiplayer(result);
}

const callbackFactory = (socket) => {
  return ({ name }) => {
    loader.showModal();
    socket.guess(name, (response) => {
      onUpdate(response);
      loader.close();
    })
  }
}

const startMultiplayer = async (name) => {
  loader.showModal();
  const socket = createSocket();
  socket.join(name, (data) => onJoin(data, ({ target }) => callbackFactory(socket)(target)));
  socket.onUpdate(onUpdate);
  socket.onNewPlayerJoin(updatePlayersList);
  socket.onPlayerDisconnect(updatePlayersList);
}

const onStartMultiplayerClick = () => {
  formNameDialog.showModal();
  startMenuDialog.close();
}

formName.addEventListener('submit', e => {
  e.preventDefault();
  const { value } = e.target.name;
  if (value == undefined || value.length == 0 && value.length <= 10) { return };
  startMultiplayer(value);
  formNameDialog.close();
});

formName.onreset = () => {
  formNameDialog.close();
  startMenuDialog.showModal();
};

menuButton.onclick = resetUI;
startMultiplayerButton.onclick = onStartMultiplayerClick;

window.addEventListener('keydown', e => (e.ctrlKey == e.shiftKey && e.key == 'I') || e.key == 'F12' && e.preventDefault());
window.oncontextmenu = e => e.preventDefault();
