'use strict'

var fs = require('fs');
const logger = require("./logger.js");
var SlackBots = require('slackbots');
var config = require('exp-config');

var slackBot;

var init = (dataModel) => {
	slackBot = new SlackBots( {token: config.slackToken, name: config.botName } );

	slackBot.on('message', (message) => {
		if (!message || !message.text) return;

		if (message.type === 'message' && message.text.toString().toLowerCase().match("tell mumble")) {
			slackBot.getUsers().then( (data) => {

				var command = {};
				command.type = 'tell mumble';
				command.text = message.text.toString().toLowerCase().replace("tell mumble ", "");
				
				if (message.username == undefined) {
				 	let user = data.members.find( (member) => {
	        		return (member.id == message.user);
	        });

	        command.user = user.name;
	      } else {
					command.user = message.username;
				}

				logger.debug('emitting slack-command event (' + command.type + ').');
				dataModel.eventEmitter.emit('slack-command', command);
			});
		}
	});

	slackBot.on('open', () => {
		logger.debug("slackBot.init: cought open event.");
		module.exports.slackBot = slackBot;
  	dataModel.eventEmitter.emit("slack-open");
	});
}

module.exports = {
	init: init
};