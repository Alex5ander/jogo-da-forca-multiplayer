const express = require('express');
const { Server, Socket } = require('socket.io');
const http = require('http');
const Game = require('./src/game');
const SinglePlayer = require('./src/single-player');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(SinglePlayer);
app.get('/music', (_, res) => res.send(process.env.MUSIC || 'none'));

class Player {
  constructor(name, id) {
    this.id = id;
    this.name = name;
  }
}

/** @type {Player[]} */
let players = [];

/** @type {Game} */
let game;

const newWord = () => {
  if (!game) {
    console.log('new game');
    game = new Game();
  }
}

/** @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const update = (socket) => {
  const player = players.find(e => e.id == socket.id);
  io.emit('update', {
    worldLength: game.word.value.length,
    errors: game.errors,
    usedLetters: game.usedLetters,
    correctLetters: game.correctLetters,
    win: game.isWin() ? player.name : null,
  });
  if (game.isEnd()) {
    game = null;
    io.disconnectSockets();
  }
}

/** @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const onGuess = (socket) => {
  socket.on('guess', letter => {
    if (letter.length != 1 || !isNaN(letter)) {
      return socket.disconnect();
    }
    const player = players.find(e => e.id == socket.id);
    console.log(`player: ${player.name} send: ${letter}`);
    game.useLetter(letter);
    update(socket);
  });
}

/**  @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const onDisconnect = (socket) => {
  socket.on('disconnect', () => {
    const player = players.find(e => e.id == socket.id);
    console.log(`player: ${player?.name} disconnected`);
    players = players.filter(e => e.id != socket.id);
    if (players.length == 0) {
      game = null;
    } else {
      io.emit('playerDisconnect', players);
    }
  });
}

/**  @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const onJoin = (socket) => {
  socket.on('join', (name, callback) => {
    const player = new Player(name, socket.id);
    console.log(`player: ${name} connected`);
    players.push(player);
    callback({ players, length: game.word.value.length, hint: game.word.hint, usedLetters: game.usedLetters, errors: game.errors, correctLetters: game.correctLetters });
    socket.broadcast.emit('newPlayerJoin', players);
  });
}

io.on('connection', socket => {
  newWord();
  onJoin(socket);
  onDisconnect(socket);
  onGuess(socket);
});

server.listen(PORT);