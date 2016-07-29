'use strict'

var requestPromise = require('request-promise');
var fs = require('fs');
const logger = require("./logger.js");
var config = require('exp-config');

var processNewMatch = require('../lib/processNewMatch.js')

function matchChecker(settings, dataModel) {
	var _fn = () => {
		for (var userNr = 0; userNr < dataModel.registeredUsers.length; userNr++) {
			logger.debug('Requesting last match for: ' + dataModel.registeredUsers[userNr].steamId);
			requestPromise('https://api.steampowered.com/IDOTA2Match_570/GetMatchHistory/V001/?key=' 
			+ config.steamAPIKey + '&account_id=' + dataModel.registeredUsers[userNr].steamId + '&matches_requested=1').then( (res) => {
				var parsed = JSON.parse(res);

				if (parsed.result.status == '15') {
					return new Promise( (resolve, reject) => {
						reject(parsed.result.statusDetail);
					});
				} else {
					for (var reportedMatchNr = 0; reportedMatchNr < dataModel.reportedMatches.length; reportedMatchNr++) {
						if (parsed.result.matches[0].match_id == dataModel.reportedMatches[reportedMatchNr]) {
							return new Promise(function (resolve, reject) {
								reject("Already reported match: " + parsed.result.matches[0].match_id);
							});
						}
					}
					dataModel.reportedMatches.push(parsed.result.matches[0].match_id);
					fs.writeFileSync(config.reportedMatchesDB, JSON.stringify(dataModel.reportedMatches), 'utf8');

					return requestPromise('https://api.steampowered.com/IDOTA2Match_570/GetMatchDetails/V001/?key=' + config.steamAPIKey + '&match_id=' + parsed.result.matches[0].match_id);
				}
			}).then(function (res) {
				var match = JSON.parse(res).result;
					
				dataModel.eventEmitter.emit('New match played', { dataModel: dataModel, match: match } );
				logger.debug('New match found and emitted: ' + match.match_id);
				return "New match found and emitted";	
			}).catch(function (e) {
				logger.debug("In matchChecker:", e);
			});
		}
	}

	if (settings.state === 'start') {
		logger.debug("Starting matchChecker");
		_fn();
		dataModel.matchCheckerTimerId = setInterval(_fn, settings.interval);
	} else if (settings.state == 'stop') {
		logger.debug("Stopping matchChecker.");
		clearTimeout(dataModel.matchCheckerTimerId);
	} else {
		throw new Error('Unkown state for matchChecker: ' + settings.state);
	}
}

module.exports = matchChecker;