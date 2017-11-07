'use strict'

var SlackBots = require('slackbots');
var fs = require('fs');
var requestPromise = require('request-promise');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var config = require('exp-config');

const logger = require("./logger.js");

var processNewMatch = require('./processNewMatch.js');

function init () {
	var dataModel = {};

	return new Promise (function (resolve, reject) {
		dataModel.slackBot = null;
		dataModel.mumbleClient = null;

		dataModel.eventEmitter = new EventEmitter();

		dataModel.eventEmitter.on('New match played', processNewMatch);
	
		dataModel.eventEmitter.on('New match processed', function (matchString) {
			if (!dataModel.slackBot) { throw new Error("slackBot not initialized, could not print matchString.");}
			
			logger.debug("Printing Match...\n");
			dataModel.slackBot.postMessageToChannel(config.reportChannel, matchString);
		});

		dataModel.eventEmitter.on('slack-command', (command) => {
			logger.debug('slack-command: ' + command.type + ' recognized.');
			
			if (command.type === 'tell mumble') {
				if (!dataModel.mumbleClient) { throw new Error("mumbleClient not initialized, could not print message from slack.");}

				dataModel.mumbleClient.user.channel.sendMessage(command.user + " says: " + command.text);
			}
		});

		dataModel.eventEmitter.on('mumble-user-connect', (args) => {
			if (!dataModel.slackBot) { throw new Error("slackBot not initialized, could not print user connected to mumble.");}			
			
			logger.debug("Printing that user " + args.userName + " connected to mumble.");
			dataModel.slackBot.postMessageToChannel(config.reportChannel, args.userName + " connected to mumble. Maybe it's game on!?");
		});

		dataModel.heroes = [];
		dataModel.mods = [];

		dataModel.reportedMatches = JSON.parse(fs.readFileSync(config.reportedMatchesDB));
		dataModel.registeredUsers = JSON.parse(fs.readFileSync(config.registeredUsersDB));

		requestPromise('https://raw.githubusercontent.com/kronusme/dota2-api/master/data/heroes.json').then(function (res) {
			dataModel.heroes = JSON.parse(res).heroes;
			return requestPromise('https://raw.githubusercontent.com/kronusme/dota2-api/master/data/mods.json');
		}).then(function (res) {
			dataModel.heroes.push( {"name": "monkey_king", "id": 114, "localized_name": "Monkey King"} );
                        dataModel.heroes.push( {"name": "dark_willow", "id": 119, "localized_name": "Dark Willow"} );
                        dataModel.heroes.push( {"name": "pangolier", "id": 120, "localized_name": "Pangolier"} );
			
			dataModel.mods = JSON.parse(res).mods;
		}).then(function() {
			resolve(dataModel);
		});	
	});
}

module.exports = init;

