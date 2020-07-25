const config = require("config");
const { MessageEmbed } = require("discord.js");
const SquareType = require("../model/SquareType");
const Player = require("../model/Player");
const PlayerType = require("../model/PlayerType");

/**
 * A View of the Connect4 Game.
 */
class View {

	/**
	 * Send a message to get the players of the game.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {GuildMember} creator - the creator of the room.
	 * @returns {Promise<Message>} - the message with the reactions of the players.
	 */
	askBot(channel, creator) {
		let msg = channel.send(this._createAskBotEmbed(creator, false));
		msg.then(message => {
			// add default reactions.
			Object.values(config.get("bots")).forEach(emoji => {
				message.react(emoji);
			});
		});
		return msg;
	}

	/**
	 * Time's up.
	 * 
	 * @param {GuildChannel} message - the channel.
	 * @param {GuildMember} creator - the creator of the room.
	 */
	endAskBot(message, creator) {
		message.edit(this._createAskBotEmbed(creator, true));
	}

	/**
	 * Create an embed message.
	 * 
	 * @param {GuildMember} creator - the creator of the room.
	 * @param {boolean} end - true if the time's up.
	 */
	_createAskBotEmbed(creator, end) {
		let embed = new MessageEmbed()
		.setTitle("Connect4")
		.setColor(end? "EA2027" : "2c3e50")
		.setAuthor(creator.displayName, creator.user.displayAvatarURL());

		let botMsg = `Press ${config.get("bots").easyBot} to play against the **easy bot**.\n
					Press ${config.get("bots").normalBot} to play against the **normal bot**.\n
					Press ${config.get("bots").stupidBot} to play against the **stupid bot**.\n
					Press ${config.get("bots").randomBot} to play against the **random bot**.\n
					Press ${config.get("bots").cheatBot} to play against the **cheat bot**.`;
		if (end)
			botMsg += "\n\n🚫 Time's up.";

		embed.setDescription(botMsg);
		return embed;
	}

	/**
	 * Send a message to get the players of the game.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {GuildMember} creator - the creator of the room.
	 * @param {GuildMember} opponent - the opponent.
	 * @returns {Promise<Message>} - the message with the reactions of the players.
	 */
	askOpponent(channel, creator, opponent) {
		let msg = channel.send(this._createAskOpponentEmbed(creator, opponent, false));
		msg.then(message => {
			// add default reactions.
			message.react("🙋‍♂️");
			message.react("🙅‍♂️");
		});
		return msg;
	}

	/**
	 * Time's up.
	 * 
	 * @param {Channel} message - the channel.
	 * @param {GuildMember} creator - the creator of the room.
	 * @param {GuildMember} opponent - the opponent.
	 */
	endAskOpponent(message, creator, opponent) {
		message.edit(this._createAskOpponentEmbed(creator, opponent, true));
	}

	/**
	 * Create an embed message.
	 * 
	 * @param {GuildMember} creator - the creator of the room.
	 * @param {GuildMember} opponent - the opponent.
	 * @param {boolean} end - true if the time's up.
	 */
	_createAskOpponentEmbed(creator, opponent, end) {
		let embed = new MessageEmbed()
		.setColor(end? "EA2027" : "2c3e50")
		.setTitle("Connect4")
		.setAuthor(creator.displayName, creator.user.displayAvatarURL());

		let opponentMsg = `⚔️ ${creator.displayName} wants to play against you ${opponent.displayName} !`;
		if (end)
			opponentMsg += "\n\n🚫 Time's up.";

		embed.setDescription(opponentMsg);
		return embed;
	}

	/**
	 * Show the board.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {Board} board - the board.
	 * @param {Player} player - the current player.
	 * @returns {Promise<Message>} - the message sent.
	 */
	showBoard(channel, board, player) {
		let msg = channel.send(this._createBoardEmbed(board, player));
		msg.then(message => {
			const nums = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣"];
			nums.forEach(num => message.react(num));
		});
		return msg;
	}

	/**
	 * Update the board.
	 * 
	 * @param {Message} message - the message of the board.
	 * @param {Board} board - the board.
	 * @param {Player} player - the current player.
	 * @returns {Promise<Message>} - the message edited.
	 */
	updateBoard(message, board, player) {
		return message.edit(this._createBoardEmbed(board, player));
	}

	/**
	 * Create an embed message of the board.
	 * 
	 * @param {Board} board - the board.
	 * @param {Player} player - the current player.
	 * @returns {MessageEmbed} - the embed message.
	 */
	_createBoardEmbed(board, player) {
		let embed = new MessageEmbed()
		.setColor(3447003)
		//.setTitle(`${player.member.displayName}'s turn.`)
		//.setThumbnail(player.member.user.displayAvatarURL());
		.setTitle((player.type === PlayerType.HUMAN)? `${player.member.displayName}'s turn.` : "Bot's turn.")
		.setThumbnail((player.type === PlayerType.HUMAN)? player.member.user.displayAvatarURL() : "https://scx1.b-cdn.net/csz/news/800/2019/3-robot.jpg");
		
		let boardMsg = " ‎ ‎ ‎  ‎‎1";
		for (let x=2; x < board.cols+1; x++) {
			boardMsg += ` ‎  ‎  ‎ ‎ ‎ ‎ ‎ ‎  ‎‎${x}`;
		}

		boardMsg += "\n";
		for (let y=0; y < board.rows; y++) {
			for (let x=0; x < board.cols; x++) {
				const type = board.getSquare(x, y).type;
				boardMsg += (type === SquareType.BLUE)? '‎‎ ‎‎🔵‎ ‎‎' : (type === SquareType.RED)? '‎‎ ‎‎🔴‎ ‎‎' : ' ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎';
				if (x !== board.cols-1)
					boardMsg += " | ";
			}

			boardMsg += "\n";
			if (y !== board.rows-1)
				boardMsg += "----------------------------------------------\n";
		}

		boardMsg += " ‎ ‎ ‎  ‎‎1";
		for (let x=2; x < board.cols+1; x++) {
			boardMsg += ` ‎  ‎  ‎ ‎ ‎ ‎ ‎ ‎  ‎‎${x}`;
		}

		embed.setDescription(boardMsg);
		
		return embed;
	}

	/**
	 * Show the winner of the room.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {Player} winner - the winner.
	 */
	showWinner(channel, winner) {
		let embed = new MessageEmbed()
		.setColor("2ecc71")
		.setTitle((winner === null)? "🤜🤛 There is equality !" : (winner.type !== PlayerType.HUMAN)? `👑 The bot wins !` : `👑 The winner is ${winner.member.displayName} !`);

		channel.send(embed);
	}

	/**
	 * Show an information in the channel.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {string} info - a message. 
	 */
	showInfo(channel, info) {
		let embed = new MessageEmbed()
		.setColor(3447003)
		.setTitle("ℹ Information")
		.setDescription(info);

		channel.send(embed);
	}

	/**
	 * Show an error in the channel.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {string} error - an error message. 
	 */
	showError(channel, error) {
		let embed = new MessageEmbed()
		.setColor("EA2027")
		.setTitle("🚫 Error")
		.setDescription(error);

		channel.send(embed);
	}

	/**
	 * Show a help message.
	 * 
	 * @param {Channel} channel - the channel.
	 * @param {User} bot - the bot user.
	 */
	showHelp(channel, bot) {
		let embed = new MessageEmbed()
		.setColor("e67e22")
		.setAuthor(bot.username, bot.displayAvatarURL())
		.setTitle("💡 🇭🇪🇱🇵")
		.setDescription("A Connect 4 game on discord !");

		embed.addField("❗ Commands", 
			`**${config.get("prefix")}connect4**, **${config.get("prefix")}c4**, **${config.get("prefix")}puissance4** - to start a game against _a bot_.
			**${config.get("prefix")}connect4** __@member__ - to play against _another member of the server_.
			**${config.get("prefix")}stop** - to stop a game.
			**${config.get("prefix")}help**, **${config.get("prefix")}h** - to show this message.`,
			false);
		embed.addField("⚠️ Warnings",
			"You only have one minute to play, otherwise it will play a random position for you and skip your turn.",
			false);

		channel.send(embed);
	}
}

module.exports = new View();