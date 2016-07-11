'use strict'

var init = require('./lib/init.js');
var processNewMatch = require('./lib/processNewMatch.js');
var matchChecker = require('./lib/matchChecker.js');
var Log = require('log');
var fs = require('fs');

var log = new Log('debug', fs.createWriteStream('debug.log'));

var settings = {
	token: '',
	name: 'Roshan',
	reportedMatchesDB: './reportedMatches.json',
	registeredUsersDB: './registeredUsers.json',
	reportChannel: 'dev-test',
	shoutChannel: 'dev-test',
	steamAPIKey: ''
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

	matchChecker({
		state: 'start',
		interval: 1000*60*5,
		},
		dataModel);
});