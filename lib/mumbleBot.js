'use strict'

var fs = require('fs');
const logger = require("./logger.js");
var mumble = require('mumble');
var config = require('exp-config');
var mumbleBotHepers = require('./mumbleBotHelpers.js');

var mumbleClient;

var init = (dataModel) => {
	mumble.connect(config.mumbleURL, {}, (error, client) => {
		if (error) {
			logger.debug("Error in mumbleBot.init: ", error);
			return;
		}

		client.on('ready', (user) => {
			logger.debug("mumbleBot.init: cought ready event.");
			module.exports.mumbleClient = mumbleClient = client;

		 	var channel = mumbleBotHepers.getChannelWithMostUsers(client);
			client.channelByName(channel.name).join();

			dataModel.eventEmitter.emit("mumble-ready", user);
		});

		client.on('user-connect', (user) => {
			logger.info("mumbleBot.init: cought user-connect event (" + user.name + ")");
			
			var channel = mumbleBotHepers.getChannelWithMostUsers(client);
			client.channelByName(channel.name).join();
		
			dataModel.eventEmitter.emit('mumble-user-connect', { userName: user.name } );
		});

		client.on('user-move', (user) => {
			logger.info("mumbleBot.init: cought user-move event (" + user.name + ")");

			var channel = mumbleBotHepers.getChannelWithMostUsers(client);
			client.channelByName(channel.name).join();

			dataModel.eventEmitter.emit('mumble-user-move', user);
		});

		client.on('user-disconnect', (user) => {
			logger.info("mumbleBot.init: cought user-disconnect event (" + user.name + ")");

			var channel = mumbleBotHepers.getChannelWithMostUsers(client);
			client.channelByName(channel.name).join();

			dataModel.eventEmitter.emit('mumble-user-disconnect', user);
		});

		client.on('message', (message, user, scope) => {
			logger.info("mumbleBot.init: cought message event (" + message + ")");

		});

		client.authenticate(config.botName);
	});
}

module.exports = {
	init: init
};