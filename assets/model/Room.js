const Board = require("./Board");
const Player = require("./Player");
const PlayerType = require("./PlayerType");
const SquareType = require("./SquareType");


const CENTER_POINTS = 4;
const LINES2_POINTS = 2;
const LINES3_POINTS = 5;
const WIN_POINTS = 10000;
const OPP_LINES2_POINTS = -2;
const OPP_LINES3_POINTS = -5;
const OPP_WIN_POINTS = -1000;

/**
 * A room of the game.
 */
module.exports = class Room {

	/**
	 * Initialize the room.
	 * 
	 * @param {GuildMember} - the first player.
	 * @param {GuildMember} - the second player (null if bot).
	 * @param {PlayerType} - the second player type (human or bot).
	 */
	constructor(firstPlayer, secondPlayer, secondType) {
		this._board = new Board();
		this._players = [
			new Player(firstPlayer, PlayerType.HUMAN),
			new Player(secondPlayer, secondType)
		];
		this._currentPlayer = (secondType === PlayerType.HUMAN)? Math.floor(Math.random() * 2) : 0;

		this.currentPlayer.squareType = SquareType.BLUE;
		this.opponentPlayer.squareType = SquareType.RED;
	}

	/**
	 * Get the board.
	 * 
	 * @returns {Board} - the board.
	 */
	getBoard() {
		return this._board;
	}
	
	/**
	 * Get the current player.
	 * 
	 * @returns {Player} - the current player.
	 */
	get currentPlayer() {
		return this._players[this._currentPlayer];
	}

	/**
	 * Get the opponent player.
	 * 
	 * @returns {Player} - the opponent player.
	 */
	get opponentPlayer() {
		return this._players[(this._currentPlayer+1)%2];
	}

	/**
	 * Get the players.
	 * 
	 * @returns {Array<Player>} - the players.
	 */
	get players() {
		return this._players;
	}

	/**
	 * A player play.
	 * 
	 * @param {number} pos - the position to play.
	 * @throws {Error} - if the position is invalid.
	 * @returns {Promise} - when played.
	 */
	play(pos) {
		if (pos < 0 || pos >= this._board.cols)
			throw new Error("The position is invalid.");
		if (!this._board.hasFreeSquare(pos))
			throw new Error("The given position has no squares free.");

		return new Promise((resolve, reject) => {
			this._board.setSquare(pos, this._board.getFirstFreeSquarePos(pos), this.currentPlayer.squareType);

			if (!this.isOver()) {
				this.swapPlayer();

				// Bot's turn.
				switch (this.currentPlayer.type) {
					case (PlayerType.EASY_BOT):
						this.play(this._minimax(this._board, 1, -Infinity, Infinity, true, true));
						break;
					case (PlayerType.NORMAL_BOT):
						this.play(this._minimax(this._board, 3, -Infinity, Infinity, true, true));
						break;
					case (PlayerType.STUPID_BOT):
						this.play(this._board.getFree()[0]);
						break;
					case (PlayerType.RANDOM_BOT):
						const free = this._board.getFree();
						this.play(free[Math.floor(Math.random() * free.length)]);
						break;
					case (PlayerType.CHEAT_BOT):
						this.play(this._minimax(this._board, 8, -Infinity, Infinity, true, true));
						break;
				}
			}

			resolve();
		});
	}

	/**
	 * Play a random pos.
	 * 
	 * @returns {Promise} - when played.
	 */
	passTurn() {
		const free = this._board.getFree();
		return this.play(free[Math.floor(Math.random() * free.length)]);
	}

	/**
	 * Swap the player.
	 */
	swapPlayer() {
		this._currentPlayer = (this._currentPlayer+1) % this._players.length;
	}

	/**
	 * Game is over.
	 * 
	 * @param {Board} - a board.
	 * @returns {boolean} - true if the game is over.
	 */
	isOver(board) {
		if (board === undefined)
			board = this._board;
		return board.getFree().length === 0 || this._getSquareTypeWinner(board) !== null;
	}

	/**
	 * Minimax algorithm (thanks to https://www.youtube.com/watch?v=y7AKtWGOPAE).
	 * 
	 * @param {Board} board - the board.
	 * @param {number} depth - the depth.
	 * @param {number} alpha - alpha.
	 * @param {number} beta - beta.
	 * @param {boolean} isMaximizer - is maximizer.
	 * @param {boolean} first - the first time this method is called.
	 * @returns {number} - in the end the best position to play.
	 */
	_minimax(board, depth, alpha, beta, isMaximizer, first) {

		if (depth === 0 || this.isOver(board)) {
			if (this.isOver(board)) {
				switch (this._getSquareTypeWinner(board)) {
					case (this.currentPlayer.squareType):
						return WIN_POINTS;
					case (this.opponentPlayer.squareType):
						return OPP_WIN_POINTS;
					default:
						return 0;
				}
			}

			return this._getScore(board, this.currentPlayer);
		}

		if (isMaximizer) {
			let maxEval = -Infinity;
			let bestPos;
			for (let pos of board.getFree()) {
				let copy = board.copy();
				copy.setSquare(pos, copy.getFirstFreeSquarePos(pos), this.currentPlayer.squareType);

				let currentEval = this._minimax(copy, depth-1, alpha, beta, false, false);

				if (currentEval > maxEval) {
					maxEval = currentEval;
					bestPos = pos;
				}
				alpha = Math.max(alpha, currentEval);
				if (beta <= alpha)
					break;
			}

			if (first)
				return bestPos;

			return maxEval;
		}
		else {
			let minEval = Infinity;
			for (let pos of board.getFree()) {
				let copy = board.copy();
				copy.setSquare(pos, copy.getFirstFreeSquarePos(pos), this.opponentPlayer.squareType);

				let currentEval = this._minimax(copy, depth-1, alpha, beta, true, false);
				minEval = Math.min(currentEval, minEval);
				beta = Math.min(beta, currentEval);
				if (beta <= alpha)
					break;
			}

			return minEval;
		}
	}

	/**
	 * Get the score of the board.
	 * 
	 * @param {Board} board - a board.
	 * @param {Player} player - the current player.
	 * @returns {number} - the score of the board. 
	 */
	_getScore(board, player) {
		const squares = board._squares;

		// Center.
		let center_points = 0;
		for (let y=board.rows-1; y >= 0; y--) {
			if (squares[Math.floor(board.cols/2)][y].type === player.squareType)
				center_points += CENTER_POINTS;
		}

		// Vertical.
		let vertical_points = 0;
		for (let x=0; x < board.cols; x++) {
			for (let y=board.rows-1; y > 2; y--) {
				let cpt = y;
				let nb_empty = 0;;
				let nb_player_square = 0;

				while (cpt > y-4) {
					if (squares[x][cpt].isEmpty())
						nb_empty++;
					else if (squares[x][cpt].type === player.squareType)
						nb_player_square++;
					cpt--;	
				}

				vertical_points += this._calcScore(nb_empty, nb_player_square);
			}
		}

		// Horizontal.
		let horizontal_points = 0;
		for (let y=board.rows-1; y >= 0; y--) {
			for (let x=0; x < board.cols-3; x++) {
				let cpt = x;
				let nb_empty = 0;;
				let nb_player_square = 0;

				while (cpt < x+4) {
					if (squares[cpt][y].isEmpty())
						nb_empty++;
					else if (squares[cpt][y].type === player.squareType)
						nb_player_square++;
					cpt++;	
				}

				horizontal_points += this._calcScore(nb_empty, nb_player_square);
			}
		}

		// Diagonal.
		let diagonal_points = 0;
		for (let x=0; x < board.cols-3; x++) {
			for (let y=board.rows-1; y > 2; y--) {
				let cpt = y;
				let nb_empty = 0;;
				let nb_player_square = 0;

				while (cpt > y-4) {
					if (squares[x+(y-cpt)][cpt].isEmpty())
						nb_empty++;
					else if (squares[x+(y-cpt)][cpt].type === player.squareType)
						nb_player_square++;
					cpt--;	
				}

				diagonal_points += this._calcScore(nb_empty, nb_player_square);
			}
		}

		// Anti-Diagonal.
		let anti_diagonal_points = 0;
		for (let x=board.cols-1; x > 2; x--) {
			for (let y=board.rows-1; y > 2; y--) {
				let cpt = y;
				let nb_empty = 0;;
				let nb_player_square = 0;

				while (cpt > y-4) {
					if (squares[x-(y-cpt)][cpt].isEmpty())
						nb_empty++;
					else if (squares[x-(y-cpt)][cpt].type === player.squareType)
						nb_player_square++;
					cpt--;	
				}

				anti_diagonal_points += this._calcScore(nb_empty, nb_player_square);
			}
		}

		//console.log(`Center: ${center_points} | Vertical: ${vertical_points} | Horizontal: ${horizontal_points} | Diagonal: ${diagonal_points} | Anti-Diagnoal: ${anti_diagonal_points}`);
		return center_points + vertical_points + horizontal_points + diagonal_points + anti_diagonal_points;
	}
	
	/**
	 * Calcul the score of 4 squares.
	 * 
	 * @param {number} nb_empty - number of empty squares.
	 * @param {number} nb_square - number of square of a player.
	 * @returns {number} - the score.
	 */
	_calcScore(nb_empty, nb_square) {
		switch (nb_empty) {
			case 0:
				switch (nb_square) {
					case 0:
						return OPP_WIN_POINTS;
					case 4:
						return WIN_POINTS;
				}
				break;
			case 1:
				switch (nb_square) {
					case 0:
						return OPP_LINES3_POINTS;
					case 3:
						return LINES3_POINTS;
				}
				break;
			case 2:
				switch (nb_square) {
					case 0:
						return OPP_LINES2_POINTS;
					case 2:
						return LINES2_POINTS;
				}
				break;
		}
		return 0;
	}

	/**
	 * Get the type of square who wins.
	 * 
	 * @param {Board} - a board.
	 * @returns {SquareType} - the square type (null if no winner).
	 */
	_getSquareTypeWinner(board) {
		if (board === undefined)
			board = this._board;

		const squares = board._squares;

		// Vertical.
		for (let x=0; x < board.cols; x++) {
			for (let y=board.rows-1; y > 2; y--) {
				let cpt = y;
				let currentType = squares[x][cpt].type;
				while (cpt > y-4 && !squares[x][cpt].isEmpty() && squares[x][cpt].type === currentType)
					cpt--;

				if (cpt === y-4)
					return currentType;
			}
		}

		// Horizontal.
		for (let y=board.rows-1; y >= 0; y--) {
			for (let x=0; x < board.cols-3; x++) {
				let cpt = x;
				let currentType = squares[cpt][y].type;
				while (cpt < x+4 && !squares[cpt][y].isEmpty() && squares[cpt][y].type === currentType)
					cpt++;
	
				if (cpt === x+4)
					return currentType;
			}
		}

		// Diagonal.
		for (let x=0; x < board.cols-3; x++) {
			for (let y=board.rows-1; y > 2; y--) {
				let cpt = y;
				let currentType = squares[x][cpt].type;
				while (cpt > y-4 && !squares[x+(y-cpt)][cpt].isEmpty() && squares[x+(y-cpt)][cpt].type === currentType)
					cpt--;
	
				if (cpt === y-4)
					return currentType;
			}
		}

		// Anti-Diagonal.
		for (let x=board.cols-1; x > 2; x--) {
			for (let y=board.rows-1; y > 2; y--) {
				let cpt = y;
				let currentType = squares[x][cpt].type;
				while (cpt > y-4 && !squares[x-(y-cpt)][cpt].isEmpty() && squares[x-(y-cpt)][cpt].type === currentType)
					cpt--;
	
				if (cpt === y-4)
					return currentType;
			}
		}

		return null;
	}

	/**
	 * Get the winner.
	 * 
	 * @returns {Player} - the player (null if equality).
	 */
	getWinner() {
		if (!this.isOver())
			throw new Error("Cannot get the winner while the game is in progress.");

		const typeWinner = this._getSquareTypeWinner();
		if (typeWinner === null) return null;
		return (this._players[0].squareType === typeWinner)? this._players[0] : this._players[1];
	}
}