// Require modules
var Discord = require('discord.js');
var ytdl = require('ytdl-core');

// Config files
const config = require('./config.json');

var queue = [];

var currentTrack = null;

var bot = new Discord.Client();

function queueHandler() {
	var voice = bot.channels.get("336431398401343489");
	if (typeof voice == "undefined") {
		message.channel.sendMessage("Music voice channel not found.");
	} else {
		if (queue.length == 0) {
			currentTrack = null;
			voice.leave();
		} else {
			voice.join().then(function (connection) {
				currentTrack = connection.playStream(ytdl(queue[0], { filter: 'audioonly' }));
				currentTrack.on("end", function () {
					queueHandler();
				});
			});
		}
	}
}


bot.on('ready', () => {
	console.log("Ready!");
	console.log("https://discordapp.com/api/oauth2/authorize?client_id=" + config.appId + "&scope=bot&permissions=" + config.permissions + "");
});

bot.on('message', message => {
	if (message.content.startsWith("!play ") && message.channel.id == "336423695222571008") {
		var url = message.content.substr("!play ".length);
		var voice = bot.channels.get("336431398401343489");
		if (typeof voice == "undefined") {
			message.channel.sendMessage("Music voice channel not found.");
		} else {
			if (currentTrack == null) {
				voice.join().then(function (connection) {
					currentTrack = connection.playStream(ytdl(url, { filter: 'audioonly' }));
					currentTrack.on("end", function () {
						queueHandler();
					});
				});
			} else {
				queue.push(url);
			}
		}
	} else if (message.content.trim() == "!stop" && message.channel.id == "336423695222571008") {
		var voice = bot.channels.get("336431398401343489");
		if (typeof voice == "undefined") {
			message.channel.sendMessage("Music voice channel not found.");
		} else {
			if (currentTrack == null){
				voice.leave();
			} else {
				queue = [];
				currentTrack.end();
			}
		}
	}
});

bot.login(config.token);