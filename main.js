'use strict'

process.env.MUMBLE_URL = "mumble.snakedesert.se";

var init = require('./lib/init.js');
var processNewMatch = require('./lib/processNewMatch.js');
var matchChecker = require('./lib/matchChecker.js');
var mumbleChecker = require('./lib/mumbleChecker.js');

var fs = require('fs');
var config = require('exp-config');

var Log = require('log');
var log = new Log('debug', fs.createWriteStream('debug.log'));

var settings = {
	token: config.slackToken,
	name: 'Roshan',
	reportedMatchesDB: './reportedMatches.json',
	registeredUsersDB: './registeredUsers.json',
	reportChannel: config.reportChannel,
	steamAPIKey: config.steamAPIKey
};

var dataModel;

init(settings)
.then(function (res) { 
	dataModel = res;
	log.debug("Done Initializing...\n");
	dataModel.slackBot.postMessageToChannel(dataModel.reportChannel, "Hello World!");
}).then(function () {				
	dataModel.eventEmitter.on('New match played', processNewMatch);
	
	dataModel.eventEmitter.on('New match processed', function (matchString) {
		log.debug("Printing Match...\n");
		dataModel.slackBot.postMessageToChannel(dataModel.reportChannel, matchString);
	});

	dataModel.eventEmitter.on('User connected to mumble.', (args) => {
		log.debug("Printing that user " + args.userName + " connected to mumble.");
		dataModel.slackBot.postMessageToChannel(dataModel.reportChannel, args.userName + " connected to mumble. Maybe it's game on!?");
	});

	matchChecker({
			state: 'start',
			interval: 1000*60*5,
		},
		dataModel);

	mumbleChecker({
			mumbleOptions: {},
			mumbleURL: config.mumbleURL,
		},
		dataModel);
});