const words = require('../words.json');

class Game {
  constructor() {
    this.word = words[Math.floor(Math.random() * words.length)];
    this.errors = 0;
    this.correctLetters = Array(this.word.value.length).fill('');
    this.usedLetters = [];
  }
  /** @param {string} letter  */
  useLetter(letter) {
    this.usedLetters.push(letter);
    if (this.word.value.search(letter) != -1) {
      const regexp = new RegExp(letter, 'g');
      const regexpstringInterator = this.word.value.matchAll(regexp);
      let data;
      while (!(data = regexpstringInterator.next()).done) {
        const index = data.value['index'];
        this.correctLetters[index] = letter;
      }
    } else {
      this.errors += 1;
    }
  }
  isWin() {
    return this.correctLetters.join('') == this.word.value;
  }
  isEnd() {
    return this.correctLetters.join('') == this.word.value || this.errors == 6
  }
}

module.exports = Game;