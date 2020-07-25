const PlayerType = require("./PlayerType");
const SquareType = require("./SquareType");

/**
 * A Player of the game.
 */
module.exports = class Player {

	/**
	 * Initialize the player.
	 * 
	 * @param {GuildMember} member - a member of the guild.
	 * @param {PlayerType} type - the type of the player.
	 */
	constructor(member, type) {
		this._id = (type === PlayerType.HUMAN)? member.id : -1;
		this._member = member;
		this._type = type;
		this._squareType = null;
	}

	/**
	 * Get the id of the player.
	 * 
	 * @returns {number} - the id of the player.
	 */
	get id() {
		return this._id;
	}

	/**
	 * Get the member object of the player.
	 * 
	 * @returns {GuildMember} - the member object of the player.
	 */
	get member() {
		return this._member;
	}

	/**
	 * Get the type of the player.
	 * 
	 * @returns {PlayerType} - the type.
	 */
	get type() {
		return this._type;
	}

	/**
	 * Get the square type of a player.
	 * 
	 * @returns {squareType} - the square type.
	 */
	get squareType() {
		return this._squareType;
	}

	/**
	 * Set the square type of a player.
	 * 
	 * @param {squareType} - the square type.
	 * @throws {Error} - the type is invalid.
	 */
	set squareType(type) {
		if (type !== SquareType.RED && type !== SquareType.BLUE)
			throw new Error("Invalid type of square.");

		this._squareType = type;
	}

}