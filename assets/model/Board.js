const Square = require("./Square");
const SquareType = require("./SquareType");

/**
 * A board of the game.
 */
module.exports = class Board {

	/**
	 * Initialize the board.
	 */
	constructor() {
		this._rows = 6;
		this._cols = 7;

		// [[COL_0], [COL_1], [COL_2], ..., [COL_6]]
		this._squares = [];
		for (let x=0; x < this._cols; x++) {
			let col = [];
			for (let y=0; y < this._rows; y++) {
				col.push(new Square());
			}
			this._squares.push(col);
		}
	}

	/**
	 * Get the number of rows of the board.
	 * 
	 * @returns {number} - the number of rows of the board.
	 */
	get rows() {
		return this._rows;
	}

	/**
	 * Get the number of columns of the board.
	 * 
	 * @returns {number} - the number of columns of the board.
	 */
	get cols() {
		return this._cols;
	}

	/**
	 * Set a square's type.
	 * 
	 * @param {number} x - the x pos of a square (0 to 6).
	 * @param {number} y - the y pos of a square (0 to 5).
	 * @param {SquareType} type - the type of the square.
	 * @throws {Error} - if one of the params is invalid.
	 * @throws {Error} - if the square is not empty.
	 */
	setSquare(x, y, type) {
		if (isNaN(x) || x < 0 || x >= this._cols) 
			throw new Error("X pos of the square invalid.");
		if (isNaN(y) || y < 0 || y >= this._rows)
			throw new Error("Y pos of the square invalid.");
		if (type === SquareType.EMPTY)
			throw new Error("Cannot set the value of a square as empty.");
		if (!this._squares[x][y].isEmpty())
			throw new Error("The square is not empty.");
		if (type !== SquareType.RED && type !== SquareType.BLUE)
			throw new Error("Invalid type of square.");

		this._squares[x][y].setType(type);
	}

	/**
	 * Get a square.
	 * 
	 * @param {number} x - the x pos of a square (0 to 6).
	 * @param {number} y - the y pos of a square (0 to 5).
	 * @throws {Error} - if one of the params is invalid.
	 * @returns {Square} - the square.
	 */
	getSquare(x, y) {
		if (isNaN(x) || x < 0 || x >= this._cols) 
			throw new Error("X pos of the square invalid.");
		if (isNaN(y) || y < 0 || y >= this._rows)
			throw new Error("Y pos of the square invalid.");

		return this._squares[x][y];
	}

	/**
	 * Get all the free columns (one square empty in the column).
	 * 
	 * @returns {Array<number>} - the position of the free columns.
	 */
	getFree() {
		let free = [];
		for (let x=0; x < this._cols; x++) {
			if (this.hasFreeSquare(x))
				free.push(x);
		}
		return free;
	}

	/**
	 * The column has free square.
	 * 
	 * @param {number} col - the column.
	 * @throws {Error} - if the column is invalid.
	 * @returns {boolean} - true if there is one free square in the column.
	 */
	hasFreeSquare(col) {
		if (isNaN(col) || col < 0 || col >= this._cols) 
			throw new Error("Column invalid.");
			
		for (let y=0; y < this._rows; y++) {
			if (this._squares[col][y].isEmpty())
				return true;
		}

		return false;
	}

	/**
	 * Get the first free square of the column.
	 * 
	 * @param {number} col - the column.
	 * @throws {Error} - if the column is invalid.
	 * @throws {Error} - if there is no free square in this column.
	 * @returns {number} - the first free square position.
	 */
	getFirstFreeSquarePos(col) {
		if (isNaN(col) || col < 0 || col >= this._cols) 
			throw new Error("Column invalid.");
		if (!this.hasFreeSquare(col))
			throw new Error("There is no free square in this column.");
		
		for (let y=this._rows-1; y >= 0; y--) {
			if (this._squares[col][y].isEmpty())
				return y;
		}
	}

	/**
	 * Copy the board.
	 * 
	 * @returns {Board} - a copy of the board.
	 */
	copy() {
		let copy = new Board();
		for (let x=0; x < this._cols; x++) {
			for (let y=0; y < this._rows; y++) {
				copy._squares[x][y] = new Square();
				if (!this.getSquare(x, y).isEmpty())
					copy._squares[x][y].setType(this.getSquare(x, y).type);
			}
		}
		return copy;
	}
}