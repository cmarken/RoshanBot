var fs = require('fs');
var helpers = require('./processNewMatchHelpers.js');

const logger = require("./logger.js");
var config = require('exp-config');

function processNewMatch (arguments) {
	var steamAPIKey = config.steamAPIKey;
	var matchString = '';

	var duration = helpers.getDuration(arguments.match);
	var ourTeam = helpers.getOurTeam(arguments.match, arguments.dataModel.registeredUsers);
	var gameMode = helpers.getGameMode(arguments.match, arguments.dataModel.mods);
	var timeAgo = helpers.getTimeAgo(arguments.match);
	var result = helpers.getMatchResult(arguments.match, ourTeam);

	helpers.getPlayerBoard(arguments.match, steamAPIKey, arguments.dataModel.heroes).then( (playerBoard) => {
		return matchString += 	gameMode + " " + result + " (" + duration + ")" + '\n' + 
								'\n' +
								playerBoard +
								'\n' +
								'Game was played ' + timeAgo + ' ago.\n' +
								'\n' +
								'More info at: http://www.dotabuff.com/matches/' + arguments.match.match_id;

	}).then( (matchString) => {
		logger.debug("New match processed, emitting matchString for match: " + arguments.match.match_id);
		arguments.dataModel.eventEmitter.emit('New match processed', matchString);
	});
}

module.exports = processNewMatch;