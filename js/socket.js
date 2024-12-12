import { io } from "socket.io-client";

/** 
* @callback onNewPlayerJoinCallback
* @param {Player[]} players 
* @callback onJoin
* @callback onUpdate
*/

export const createSocket = () => {
  const socket = io('http://localhost:3000');
  /** @param {string} playername @param {onJoin} callback */
  const join = (playername, callback) => socket.emit('join', playername, callback);
  /** @param {onUpdate} callback */
  const onUpdate = callback => socket.on('update', callback);
  /** @param {onNewPlayerJoinCallback} callback */
  const onNewPlayerJoin = (callback) => socket.on('newPlayerJoin', callback);
  /** @param {string} letter */
  const guess = (letter) => socket.emit('guess', letter);
  /** @param {onNewPlayerJoinCallback} callback */
  const onPlayerDisconnect = callback => socket.on('playerDisconnect', callback);

  return {
    guess,
    join,
    onUpdate,
    onNewPlayerJoin,
    onPlayerDisconnect
  }
}