const SquareType = require("./SquareType");

/**
 * A square of the game.
 */
module.exports = class Square {

	/**
	 * Initialize the square.
	 */
	constructor() {
		this._type = SquareType.EMPTY;
	}

	/**
	 * Get the type.
	 * 
	 * @returns {SquareType} - the type.
	 */
	get type() {
		return this._type;
	}

	/**
	 * The square is empty.
	 * 
	 * @returns {boolean} - true if the square is empty.
	 */
	isEmpty() {
		return this._type === SquareType.EMPTY;
	}

	/**
	 * Set the square's type.
	 * 
	 * @param {SquareType} type - the type of the square.
	 * @throws {Error} - if the square is not empty.
	 * @throws {Error} - the type is invalid.
	 */
	setType(type) {
		if (!this.isEmpty())
			throw new Error("The square is not empty.");
		if (type !== SquareType.RED && type !== SquareType.BLUE)
			throw new Error("Invalid type of square.");
		this._type = type;
	}
}