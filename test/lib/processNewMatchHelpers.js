

require('mocha-cakes-2');
var nock = require('nock');
var fs = require('fs');

var expect = require('chai').expect;

var config = require('exp-config');

var processNewMatchHelpers = require('../../lib/processNewMatchHelpers.js');

describe("Unit tests for processNewMatch functions", () => {
	var steamAPIKey = config.steamAPIKey;

	describe("The match 2182095092 is sent to processNewMatch", () => {
		var match;
		var registeredUsers = [];
		var heroes = [];
		var mods = [];
		var players = [];
		var playerSummaries = [];

		before ( () => {
			nock('http://api.steampowered.com')
			.get('/ISteamUser/GetPlayerSummaries/v0002/?key=' + steamAPIKey + '&steamids=76561198040499748,76561198037537150,76561197961406443,76561197978458500,76561202255233023,76561198091760595,76561202255233023,76561202255233023,76561198161220496,76561198084269087')
			.reply(200, fs.readFileSync('test/mocks/reportNewGameOnSlack/GetPlayerSummariesForMatch2182095092.json', 'utf8'));

			heroes = JSON.parse(fs.readFileSync('test/mocks/heroes.json')).heroes;
			mods = JSON.parse(fs.readFileSync('test/mocks/mods.json')).mods;
			playerSummaries = JSON.parse(fs.readFileSync('test/mocks/reportNewGameOnSlack/GetPlayerSummariesForMatch2182095092.json', 'utf8')).response.players;
		});

		it("The match json is loaded correctly", () => {
			match = JSON.parse(fs.readFileSync('test/mocks/reportNewGameOnSlack/getMatchDetailsFor2182095092.json', 'utf8')).result;

			expect(match).to.be.an('object');
			expect(match).to.contain.all.keys('radiant_win', 'players', 'duration', 'start_time', 'match_id', 'game_mode');
			expect(match.match_id).to.be.equal(2182095092);
		});

		it("A users is registered", () => {
			registeredUsers.push( {"steamId": 76561197978458500, "steamNick": "herr arken"} );
		
			expect(registeredUsers[0].steamId).to.be.equal(76561197978458500);
			expect(registeredUsers[0].steamNick).to.be.equal('herr arken');
		});

		it("Calling getOurTeam()", () => {
			var team = processNewMatchHelpers.getOurTeam(match, registeredUsers);
			
			expect(team).to.be.equal('radiant');
		});

		it("Calling getMatchResult()", () => {
			var matchResult = processNewMatchHelpers.getMatchResult(match, 'radiant');
			
			expect(matchResult).to.be.equal('Lose');
		});

		it("Calling getPlayerBoard()", () => {
			var expectedResult =	"Radiant\n" +
									"20 3 12 13 Lord PackMan (Magnus)\n" + 
									"21 10 11 16 Lady PackMan (Gyrocopter)\n" +
									"20 11 8 16 Kolossos (Pugna)\n" +
									"22 9 7 13 herr arken (Troll Warlord)\n" +
									"20 6 12 13 Anonymous (Keeper of the Light)\n" +		
									"\n" +
									"Dire\n" +
									"17 4 8 15 Злой Енот ^.^ (Lion)\n" +
									"16 10 12 23 Anonymous (Shadow Shaman)\n" +
									"25 15 3 5 Anonymous (Legion Commander)\n" +
									"21 13 8 7 God in Dota (Shadow Fiend)\n" +
									"17 5 9 19 batman (Venomancer)\n";

			return processNewMatchHelpers.getPlayerBoard(match, steamAPIKey, heroes).then(function (playerBoard) {
				expect(playerBoard).to.equal(expectedResult);
			});
		});

		it("Calling getDuration()", () => {
			var duration = processNewMatchHelpers.getDuration(match);

			expect(duration).to.be.equal('45:50 min');
		});

		it("Calling getHeroName()", () => {
			var hero = processNewMatchHelpers.getHeroName(95, heroes);

			expect(hero).to.be.equal('Troll Warlord');
		});

		it("Calling getGameMode()", () => {
			var gameMode = processNewMatchHelpers.getGameMode(match, mods);

			expect(gameMode).to.be.equal('Single Draft');
		});

		it("Calling getPlayerRow()", () => {
			var playerRow0 = processNewMatchHelpers.getPlayerRow(match.players[0], playerSummaries, heroes);
			var playerRow4 = processNewMatchHelpers.getPlayerRow(match.players[4], playerSummaries, heroes);
			
			expect(playerRow0).to.equal('20 3 12 13 Lord PackMan (Magnus)');
			expect(playerRow4).to.equal('20 6 12 13 Anonymous (Keeper of the Light)');
		});

		it("Calling getPlayerRow() with strange characters", () => {
			var playerRow5 = processNewMatchHelpers.getPlayerRow(match.players[5], playerSummaries, heroes);
			
			expect(playerRow5).to.equal('17 4 8 15 Злой Енот ^.^ (Lion)');	
		});
	});
});