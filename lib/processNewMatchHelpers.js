var Bignumber = require('bignumber.js');
var requestPromise = require('request-promise');
var fs = require('fs');
var Log = require('log');

var log = new Log('debug', fs.createWriteStream('debug.log'));

function getOurTeam (match, registeredUsers) {
	var ourTeam = 'undefined';
	
	for (var playerNr = 0; playerNr < match.players.length; playerNr++) {
		for (var userNr = 0; userNr < registeredUsers.length; userNr++) {
			if (new Bignumber(match.players[playerNr].account_id).plus('76561197960265728') == registeredUsers[userNr].steamId) {
				if (match.players[playerNr].player_slot < 128) {
					if (ourTeam === 'dire') {
						return 'Both sides';
					} else {
						ourTeam = 'radiant';
					}
				} else if (match.players[playerNr].player_slot > 128) {
					if (ourTeam === 'radiant') {
						return 'Both sides';
					} else {
						ourTeam = 'dire';
					}
				}
			}
		}
	}

	return ourTeam;
}

function getMatchResult (match, ourTeam) {
	if (match.radiant_win == true && ourTeam === 'radiant') {
		return 'Win';
	} else if (match.radiant_win == true && ourTeam === 'dire') {
		return 'Lose';
	} else if (match.radiant_win == false && ourTeam === 'dire') {
		return 'Win';
	} else if (match.radiant_win == false && ourTeam === 'radiant') {
		return 'Lose';
	} else {
		return 'Registered users on both teams';
	}
}

function getPlayerBoard (match, steamAPIKey, heroes) {
	var playerBoard = '';
	var steamIds64String = '';

	for (var i = 0; i < match.players.length; i++) {
	    var steamId64 = new Bignumber(match.players[i].account_id).plus('76561197960265728').toString();
   		steamIds64String += steamId64;
    	if (i < match.players.length - 1) {
        	steamIds64String += ",";
        }
    }

    return requestPromise('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + steamAPIKey + '&steamids=' + steamIds64String)
	.then(function (playerSummariesString) {
		var playerSummaries = JSON.parse(playerSummariesString).response.players;

		playerBoard += 'Radiant\n';
		
		for (var i = 0; i < match.players.length; i++) {
			if (match.players[i].player_slot == 128) {
				playerBoard += '\nDire\n';
			}

			playerBoard += getPlayerRow(match.players[i], playerSummaries, heroes) + '\n';
		}

		return playerBoard;
	});
}

function getPlayerRow (player, playerSummaries, heroes) {
	var playerRow = '';

	playerRow += player.level + " " + player.kills + " " + player.deaths + " " + player.assists + " ";

	var foundName = false;
	for(var i = 0; i < playerSummaries.length; i++) {
		if (new Bignumber(player.account_id).plus('76561197960265728') == playerSummaries[i].steamid) {
			playerRow += playerSummaries[i].personaname + ' ';
			foundName = true;
		}
	}
	if (!foundName) {
		playerRow += 'Anonymous ';
	}

	playerRow += '(' + getHeroName(player.hero_id, heroes) + ')';

	return playerRow;
}

function getDuration (match) {
	var minutes = Math.floor(match.duration / 60);
	var seconds = match.duration % 60;

	return minutes + ':' + seconds + ' min'; 
}

function getHeroName (id, heroes) {
	for (var i = 0; i < heroes.length; i++) {
		if (id == heroes[i].id) {
			return heroes[i].localized_name;
		}
	}
	return 'Unkown Hero';
}

function getGameMode (match, mods) {
	for (var i = 0; i < mods.length; i++) {
		if (mods[i].id == match.game_mode) {
			return mods[i].name;
		}
	}
	return 'Undefined';
}

function getTimeAgo (match) {
	return Math.round((new Date() - new Date((match.start_time + match.duration) * 1000)) / 60000) + " min";
}

module.exports = {
	getHeroName: getHeroName,
	getMatchResult: getMatchResult,
	getOurTeam: getOurTeam,
	getDuration: getDuration,
	getGameMode: getGameMode,
	getPlayerRow: getPlayerRow,
	getPlayerBoard: getPlayerBoard,
	getTimeAgo: getTimeAgo
}