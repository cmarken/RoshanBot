'use strict'

var fs = require('fs');
var config = require('exp-config');
const logger = require("./lib/logger.js");

var init = require('./lib/init.js');
var matchChecker = require('./lib/matchChecker.js');
var mumbleBot = require('./lib/mumbleBot.js');
var slackBot = require('./lib/slackBot.js');

var dataModel;

init().then(function (res) { 
	dataModel = res;
	logger.debug("Done Initializing...\n");
}).then( () => {
	dataModel.eventEmitter.on('slack-open', () => {
		dataModel.slackBot = slackBot.slackBot;
		dataModel.slackBot.postMessage("Hello World! I am " + config.botName + ".");
	});
	slackBot.init(dataModel);
}).then( () => {
	dataModel.eventEmitter.on('mumble-ready', () => {
		dataModel.mumbleClient = mumbleBot.mumbleClient;
	});
	mumbleBot.init(dataModel);
}).then(function () {				
	matchChecker( { state: 'start', interval: 1000*60*5 }, dataModel);
});