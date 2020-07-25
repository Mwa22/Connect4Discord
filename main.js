/*
Copyright (C) 2020 Thomas MICHEL

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const Discord = require("discord.js");
const config = require("config");

const client = new Discord.Client();

client.on("ready", () => {
	console.log("Logged in as");
	console.log(client.user.tag);
	console.log("------");

	client.user.setPresence({activity: {name: `${config.get("prefix")}help, ${config.get("prefix")}h`}, status: "online"});
});

const controller = require("./assets/controller/Controller");

client.on("message", message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(config.get("prefix"))) return;
	if (message.channel.type === "dm") return;

	let args = message.content.substr(config.get("prefix").length, message.content.length);
	args = args.trim().split(" ");
	let command = args.shift().toLowerCase();

	if (command === "connect4" || command === "c4" || command === "puissance4") {
		controller.newRoom(message.channel, message.member, message.mentions.members.first());
	}

	if (command === "stop") {
		controller.stop(message.channel);
	}

	if (command === "help" || command === "h") {
		controller.help(message.channel, client.user);
	}
});

client.login(config.get("token"));