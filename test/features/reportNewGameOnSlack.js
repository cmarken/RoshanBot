'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
var SlackBots = require('slackbots');
var sinon = require('sinon');
var Promise = require('bluebird');
var nock = require('nock');
var fs = require('fs');
var config = require('exp-config');

var init = require('../../lib/init.js');
var processNewMatch = require('../../lib/processNewMatch.js');
var matchChecker = require('../../lib/matchChecker.js');
var processNewMatchHelpers = require('../../lib/processNewMatchHelpers.js');

Feature("As a dotaplayer and slack user I want to get a match summary posted to slack within 5 minutes so that it is finnished so that i know the results", () => {
	var dataModel;

	var steamAPIKey = config.steamAPIKey;

	before( () => {
		nock('https://raw.githubusercontent.com')
		.get('/kronusme/dota2-api/master/data/heroes.json')
		.reply(200, fs.readFileSync('test/mocks/heroes.json', 'utf8'));    

		nock('https://raw.githubusercontent.com')
		.get('/kronusme/dota2-api/master/data/mods.json')
		.reply(200, fs.readFileSync('test/mocks/mods.json', 'utf8'));

		return init().then(function (res) { 
			dataModel = res;
		}).catch(function (error) {
			console.log(error);
		});
	});

	Given("The slackBot is open", (done) => {
		dataModel.slackBot = new SlackBots( { token: config.slackToken, name: config.botName } );
		dataModel.slackBot.on('open', () => {
			done();
		});
	});
		
	And("The list of previously reported matches are loaded", () => {
		expect(dataModel.reportedMatches).be.an('array');
	});

	And("The registered user is loaded", () => {
		expect(dataModel.registeredUsers).to.be.an('array');
		expect(dataModel.registeredUsers[0]).to.have.keys('steamId', 'steamNick');
	});

	And("The register of heroes is loaded", () => {
		expect(dataModel.heroes).to.be.an('array');
		expect(dataModel.heroes[0]).to.have.keys("name", "id", "localized_name");
	});

	And("The match types (mods) are loaded", () => {
		expect(dataModel.mods).to.be.an('array');
		expect(dataModel.mods[0]).to.have.keys('id', 'name');
	});

	Scenario("There is one (1) player registered but she have not allowed others to see her match history", function (done) {
		var matchCheckerSpy = sinon.spy(matchChecker);
		var processNewMatchSpy = sinon.spy(processNewMatch);
		var postMessageToChannelSpy = sinon.spy(SlackBots.postMessageToChannel);

		before( () => {
			nock('https://api.steampowered.com')
			.get('/IDOTA2Match_570/GetMatchHistory/V001/?key=' + steamAPIKey + '&account_id=76561197975000576&matches_requested=1')
			.times(100)
			.reply(200, fs.readFileSync('test/mocks/reportNewGameOnSlack/getMatchHistoryRequestFor76561197975000576.json', 'utf8')); 

		 	dataModel.reportedMatches = [];
			dataModel.registeredUsers = [];
			dataModel.registeredUsers.push(	{"steamId": "76561197975000576", "steamNick": "notan"} );
			
			dataModel.eventEmitter.on('New match played', processNewMatchSpy);
			dataModel.eventEmitter.on('New match processed', postMessageToChannelSpy);
		
			matchCheckerSpy( {
					state: 'start',
					interval: 100 //1000*60*5,
				},
				dataModel
			);
		});

		after( () => {
			matchCheckerSpy({
					state: 'stop',
					interval: null
				},
				dataModel
			);
		});

		Given("One (1) player is registered", () => {
			expect(dataModel.registeredUsers[0].steamId).to.be.equal('76561197975000576');
			expect(dataModel.registeredUsers).to.have.lengthOf(1);
		});

		When("The match checker is started", (done) => {
			setTimeout( () => {
				expect(matchCheckerSpy.called).to.be.true;
				done();
			}, 10);
		});

		Then("No match event should be emitted", (done) => {
			setTimeout( () => {
				expect(processNewMatchSpy.called).to.be.false;
				done();
			}, 10);
		});

		And("No message should be sent to slackbot", (done) => {
			setTimeout( () => {
				expect(postMessageToChannelSpy.called).to.be.false;	
				done();
			}, 10);
		});
	});

	Scenario("There is one (1) player registered and a new game has been played", function () {	
		var matchCheckerSpy = sinon.spy(matchChecker);
		var processNewMatchSpy = sinon.spy(processNewMatch);
		var postMessageToChannelSpy = sinon.spy(SlackBots.postMessageToChannel);
		
		before( () => {
			nock('https://api.steampowered.com')
			.get('/IDOTA2Match_570/GetMatchHistory/V001/?key=' + steamAPIKey + '&account_id=76561197978458500&matches_requested=1')
			.times(100)
			.reply(200, fs.readFileSync('test/mocks/reportNewGameOnSlack/getMatchHistoryRequestFor76561197978458500.json', 'utf8')); 

			nock('https://api.steampowered.com')
			.get('/IDOTA2Match_570/GetMatchDetails/V001/?key=' + steamAPIKey + '&match_id=2182095092')
			.times(100)
			.reply(200, fs.readFileSync('test/mocks/reportNewGameOnSlack/getMatchDetailsFor2182095092.json', 'utf8'));

			nock('http://api.steampowered.com')
			.get('/ISteamUser/GetPlayerSummaries/v0002/?key=' + steamAPIKey + '&steamids=76561198040499748,76561198037537150,76561197961406443,76561197978458500,76561202255233023,76561198091760595,76561202255233023,76561202255233023,76561198161220496,76561198084269087')
			.times(100)
			.reply(200, fs.readFileSync('test/mocks/reportNewGameOnSlack/GetPlayerSummariesForMatch2182095092.json', 'utf8'));

	 		dataModel.reportedMatches = [];
			dataModel.registeredUsers = [];

			dataModel.registeredUsers.push(	{"steamId": "76561197978458500", "steamNick": "herr arken"} );
			
			dataModel.eventEmitter.on('New match played', processNewMatchSpy);
			dataModel.eventEmitter.on('New match processed', postMessageToChannelSpy);

			matchCheckerSpy({
					state: 'start',
					interval: 100 //1000*60*5,
				},
				dataModel
			);
		});

		after( () => {
			matchCheckerSpy({
				state: 'stop',
				interval: null
				},
				dataModel
			);
		});

		Given("One (1) player is registered in the bot with the bot", () => {
			expect(dataModel.registeredUsers[0].steamId).to.be.equal('76561197978458500');
			expect(dataModel.registeredUsers).to.have.lengthOf(1);
		});

		And("The matchChecker has been started", () => {
			expect(matchCheckerSpy.called).to.be.true;
		});
		
		When("A new a game has been played processNewMatch has been called only once", () => {
			expect(processNewMatchSpy.calledOnce).to.be.true;
		});

		And("The matchid is added to reported list", () => {
			expect(dataModel.reportedMatches).to.include(2182095092);
		});

		And("The updated reported list has been save to file", () => {
			var array = JSON.parse(fs.readFileSync(config.reportedMatchesDB));
			expect(array).to.include(2182095092);
		});

		Then("Slackbot should get a correctly formated string to print", (done) => {
			setTimeout ( () => {
				var matchStub = { 	"start_time": 1456572994,
									"duration": 2750, };

				var matchString = 	"Single Draft Lose (45:50 min)\n" +
									"\n" +
									"Radiant\n" +
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
									"17 5 9 19 batman (Venomancer)\n" +
									"\n" +
									"Game was played " + processNewMatchHelpers.getTimeAgo(matchStub) + " ago.\n" +
									"\n" +
									"More info at: http://www.dotabuff.com/matches/2182095092";

				expect(postMessageToChannelSpy.calledWith(matchString)).to.be.true;				
				done();
			}, 10);
		});
	});
});