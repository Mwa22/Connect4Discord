const Room = require("./Room");

/**
 * The connect4 game.
 */
module.exports = class Game {

	/**
	 * Initalize the rooms.
	 */
	constructor() {
		this._rooms = [];
	}

	/**
	 * Set a new room.
	 * 
	 * @param {number} id - the id of the room.
	 * @param {GuildMember} - the first player.
	 * @param {GuildMember} - the second player (null if bot).
	 * @param {PlayerType} - the second player type (human or bot).
	 * @throws {Error} - if the id is invalid.
	 * @throws {Error} - if the id already exists.
	 */
	newRoom(id, firstPlayer, secondPlayer, secondType) {
		if (id == undefined || isNaN(id))
			throw new Error("Invalid id.");
		if (Object.keys(this._rooms).includes(id))
			throw new Error("This room already exists.");
			
		this._rooms[id] = new Room(firstPlayer, secondPlayer, secondType);
	}

	/**
	 * Get a room by his id.
	 * 
	 * @param {number} id - the id of the room.
	 * @throws {Error} - if the id is invalid.
	 */
	getRoom(id) {
		if (id == undefined || isNaN(id))
			throw new Error("Invalid id.");
		return this._rooms[id];
	}

	/**
	 * The game has the room.
	 * 
	 * @param {number} id - the id.
	 * @throws {Error} - if the id is invalid.
	 * @returns {boolean} - if this room exists.
	 */
	has(id) {
		if (id == undefined || isNaN(id))
			throw new Error("Invalid id.");
		return Object.keys(this._rooms).includes(id);
	}

	/**
	 * Stop the room.
	 * 
	 * @param {number} id - the id.
	 * @throws {Error} - if the id is invalid.
	 */
	stop(id) {
		if (id == undefined || isNaN(id))
			throw new Error("Invalid id.");
		
		delete this._rooms[id];
	}
}