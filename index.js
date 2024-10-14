import express from 'express';
import { Server, Socket } from 'socket.io';
import http from 'http';

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const io = new Server(server);

const words = ['BANANA', 'UVA', 'ABACAXI', 'LARANJA', 'PITAIA', 'MELANCIA', 'CAQUI'];

class Player {
  constructor(name, id) {
    this.id = id;
    this.name = name;
  }
}

let errors = 0;
let word = '';
let correctLetters = '';
let usedLetters = [];
/** @type {Player[]} */
let players = [];

const newWord = () => {
  if (word == '') {
    console.log('new word');
    word = words[Math.floor(Math.random() * words.length)];
    correctLetters = '';
    correctLetters = correctLetters.padStart(word.length).split('');
    usedLetters = [];
  }
}

/** @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const update = (socket) => {
  const player = players.find(e => e.id == socket.id);
  io.emit('update', {
    worldLength: word.length,
    players,
    errors,
    usedLetters,
    correctLetters,
    win: correctLetters.join('') == word ? player.name : null,
  });
  if (correctLetters.join('') == word || errors == 6) {
    word = '';
    errors = 0;
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

    if (!usedLetters.includes(letter) && errors != 6 && word.length != 0) {
      usedLetters.push(letter);
      if (word.search(letter) != -1) {
        const regexp = new RegExp(letter, 'g');
        const regexpstringInterator = word.matchAll(regexp);
        let data;
        while (!(data = regexpstringInterator.next()).done) {
          const index = data.value['index'];
          correctLetters[index] = letter;
        }
      } else {
        errors += 1;
      }
      update(socket);
    }
  });
}

/**  @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const onDisconnect = (socket) => {
  socket.on('disconnect', () => {
    const player = players.find(e => e.id == socket.id);
    console.log(`player: ${player?.name} disconnected`);
    players = players.filter(e => e.id != socket.id);
    if (players.length == 0) {
      word = '';
      errors = 0;
    } else {
      update(socket);
    }
  });
}

/**  @param {Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} socket */
const onJoin = (socket) => {
  socket.on('join', name => {
    const player = new Player(name, socket.id);
    console.log(`player: ${name} connected`);
    players.push(player);
    socket.emit('join', { players, wordLength: word.length });
    update(socket);
  });
}

io.on('connection', socket => {
  newWord();
  onJoin(socket)
  onDisconnect(socket);
  onGuess(socket);
});

server.listen(PORT);