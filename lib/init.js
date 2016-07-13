'use strict'

var Slackbot = require('slackbots');
var fs = require('fs');
var requestPromise = require('request-promise');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

function init (settings) {
	return new Promise (function (resolve, reject) {
		var slackBot =  new Slackbot({ 
			token: settings.token,
			name: settings.name});

		var eventEmitter = new EventEmitter();

		var reportChannel = settings.reportChannel;
		var shoutChannel = settings.shoutChannel;
		var steamAPIKey = settings.steamAPIKey;

		var heroes = [];
		var mods = [];

		var reportedMatches = JSON.parse(fs.readFileSync(settings.reportedMatchesDB));
		var registeredUsers = JSON.parse(fs.readFileSync(settings.registeredUsersDB));

		requestPromise('https://raw.githubusercontent.com/kronusme/dota2-api/master/data/heroes.json').then(function (res) {
			heroes = JSON.parse(res).heroes;
			return requestPromise('https://raw.githubusercontent.com/kronusme/dota2-api/master/data/mods.json');
		}).then(function (res) {
			mods = JSON.parse(res).mods;
		}).then(function() {
			resolve({
				slackBot: slackBot,
				eventEmitter: eventEmitter,
				mods: mods,
				reportedMatches: reportedMatches,
				registeredUsers: registeredUsers,
				reportedMatchesDB: settings.reportedMatchesDB,
				registeredUsersDB: settings.registeredUsersDB,
				heroes: heroes,
				reportChannel: reportChannel,
				shoutChannel: shoutChannel,
				steamAPIKey: steamAPIKey
			});
		});	
	});
}

module.exports = init;