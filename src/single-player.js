const { Router } = require('express');
const Game = require('./game');

/** @type {Game} */
let game;

const app = Router();

app.get('/new-game', (_, res) => {
  game = new Game();
  res.json({ length: game.word.value.length, hint: game.word.hint });
});

app.get('/letter/:letter', (req, res) => {
  if (game && !game.isEnd()) {
    const { letter } = req.params;
    if (letter.length == 1 && isNaN(letter)) {
      game.useLetter(letter);
    }
    res.json({ usedLetters: game.usedLetters, errors: game.errors, correctLetters: game.correctLetters, win: game.isWin() ? '1' : null });
  } else {
    res.status(404).json({ error: 'Nenhum jogo iniciado' });
  }
});

module.exports = app;
