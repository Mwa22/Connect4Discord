const config = require("config");
const view = require("../view/View");
const Game = require("../model/Game");
const PlayerType = require("../model/PlayerType");
const Room = require("../model/Room");

/**
 * A Controller of the Connect4 Game.
 */
class Controller {

	/**
	 * Initialize the game.
	 */
	constructor() {
		this._game = new Game();
		this._asking = [];
	}

	/**
	 * Create a new room.
	 * 
	 * @param {GuildChannel} channel - the channel where the room is created.
	 * @param {GuildMember} creator - the member who creates this room. 
	 * @param {GuildMember} opponent - the opponent (null if bot). 
	 */
	newRoom(channel, creator, opponent) {
		if (this._game.has(channel.id) || this._asking.includes(channel.id)) {
			view.showError(channel, "There is already a room in this channel"); return;
		}

		this._asking.push(channel.id);

		// Bot.
		if (opponent === undefined || opponent.user.bot || opponent.id === creator.id)
			this._botRoom(channel, creator);
		// Human.
		else
			this._humanRoom(channel, creator, opponent);
	}


	/**
	 * Handle bot room.
	 * 
	 * @param {Channel} channel - the channel where the room is created.
	 * @param {GuildMember} creator - the member who creates this room. 
	 */
	_botRoom(channel, creator) {
		view.askBot(channel, creator)
		.then(message => {
			const filter = (reaction, user) => Object.values(config.get("bots")).includes(reaction.emoji.name) && user.id === creator.id;
			const collector = message.createReactionCollector(filter, {time: 60000});

			collector.on("collect", r => {
				let botType;
				switch (r.emoji.name) {
					case (config.get("bots").easyBot):
						botType = PlayerType.EASY_BOT;
						break;
					case (config.get("bots").normalBot):
						botType = PlayerType.NORMAL_BOT;
						break;
					case (config.get("bots").stupidBot):
						botType = PlayerType.STUPID_BOT;
						break;
					case (config.get("bots").randomBot):
						botType = PlayerType.RANDOM_BOT;
						break;
					case (config.get("bots").cheatBot):
						botType = PlayerType.CHEAT_BOT;
						break;
				}

				this._game.newRoom(channel.id, creator, null, botType);
				collector.stop("stopped");
			});

			collector.on("end", (collected, reason) => {
				if (reason === "stopped") {
					const room = this._game.getRoom(channel.id);
					this._handlePlay(channel, view.showBoard(channel, room.getBoard(), room.currentPlayer), room);
				}
				else
					view.endAskBot(message, creator);

				this._asking.splice(this._asking.indexOf(channel.id), 1);
			});
		})
		.catch(err => view.showError(channel, `Couldn't start the game, retry ${config.get("prefix")}connect4.`));
	}

	/**
	 * Handle human room.
	 * 
	 * @param {GuildChannel} channel - the channel where the room is created.
	 * @param {GuildMember} creator - the member who creates this room. 
	 * @param {GuildMember} opponent - the opponent.
	 */
	_humanRoom(channel, creator, opponent) {
		view.askOpponent(channel, creator, opponent)
		.then(message => {
			const filter = (reaction, user) => (reaction.emoji.name === "🙋‍♂️" || reaction.emoji.name === "🙅‍♂️") && user.id === opponent.id;
			const collector = message.createReactionCollector(filter, {time: 60000});

			collector.on("collect", r => {
				if (r.emoji.name === "🙋‍♂️") {
					this._game.newRoom(channel.id, creator, opponent, PlayerType.HUMAN);
					collector.stop("stopped");
				}
			});

			collector.on("end", (collected, reason) => {
				if (reason === "stopped") {
					const room = this._game.getRoom(channel.id);
					this._handlePlay(channel, view.showBoard(channel, room.getBoard(), room.currentPlayer), room);
				}
				else
					view.endAskOpponent(message, creator, opponent);

				this._asking.splice(this._asking.indexOf(channel.id), 1);
			});
		})
		.catch(err => view.showError(channel, `Couldn't start the game, retry ${config.get("prefix")}connect4.`));
	}

	/**
	 * Handle the play reaction from a player.
	 * 
	 * @param {GuildChannel} channel - the channel where the room is created.
	 * @param {Promise<Message>} message - the board message.
	 * @param {Room} room - the room. 
	 */
	_handlePlay(channel, message, room) {
		message.then(message2 => {
			// Active cheat.
			//console.log(`Play '${this._game.getRoom(channel.id)._minimax(this._game.getRoom(channel.id).getBoard(), 8, -Infinity, Infinity, true, true)+1}' to win.`);
			
			const nums = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];
			let numsFree = [];
			// Set to null all the nums already used.
			Object.keys(nums).forEach(i => numsFree.push(room.getBoard().hasFreeSquare(parseInt(i))? nums[i] : null));
			
			const filter = (reaction, user) => numsFree.includes(reaction.emoji.name) && user.id === room.currentPlayer.id;
			const collector = message2.createReactionCollector(filter, {time: 60000});

			collector.on("collect", r => {
				// Remove the reaction.
				r.users.remove(room.currentPlayer.member);

				room.play(parseInt(Object.keys(numsFree).find(num => numsFree[num] === r.emoji.name)))
				.then(() => {
					
					if (room.isOver()) {
						view.updateBoard(message2, room.getBoard(), room.currentPlayer);
						view.showWinner(channel, room.getWinner());
						this._game.stop(channel.id);
					}
					else
						this._handlePlay(channel, view.updateBoard(message2, room.getBoard(), room.currentPlayer), room);
				});

				collector.stop("stopped");
			});

			collector.on("end", (collected, reason) => {
				if (reason !== "stopped" && this._game.has(channel.id)) {
					view.showInfo(channel, "Your turn is over, you have 1 minute to play.");
					room.passTurn()
					.then(() => {
						if (room.isOver()) {
							view.updateBoard(message2, room.getBoard(), room.currentPlayer);
							view.showWinner(channel, room.getWinner());
							this._game.stop(channel.id);
						}
						else
							this._handlePlay(channel, view.updateBoard(message2, room.getBoard(), room.currentPlayer), room)
					});
				}
			});
		})
		.catch(err => view.showError(channel, "A problem happend, restart the game !"));
	}

	/**
	 * Stop the room.
	 * 
	 * @param {Channel} channel - the channel where the room is created.
	 */
	stop(channel) {
		if (!this._game.has(channel.id) && !this._asking.includes(channel.id)) {
			view.showError(channel, "There is no room in this channel."); return;
		}

		if (this._asking.includes(channel.id))
			this._asking.splice(this._asking.indexOf(channel.id), 1);
		else 
			this._game.stop(channel.id);
		view.showInfo(channel, "The game has ended.");
	}

	/**
	 * Show a help message.
	 * 
	 * @param {Channel} channel - the channel where the room is created.
	 * @param {User} bot - the bot user.
	 */
	help(channel, bot) {
		view.showHelp(channel, bot);
	}
}

module.exports = new Controller();