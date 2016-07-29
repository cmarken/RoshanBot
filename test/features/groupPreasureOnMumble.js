'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
var config = require('exp-config');
const logger = require("../../lib/logger.js");
var nock = require('nock');
var fs = require('fs');
var mumble = require('mumble');

var mumbleBot = require('../../lib/mumbleBot.js');
var slackBot = require('../../lib/slackBot.js');
var init = require('../../lib/init.js');
var mumbleBotHelpers = require('../../lib/mumbleBotHelpers.js');

Feature("Group preasure on mumble (Always be in the channel with most users).", () => {
	var dataModel = null;

	Scenario("2 users in Dire channel and 1 user in Radiant Channel. Bot logs in.", () => {
		let nockHeroesCTX, nockModsCTX;

		before ( () => {
			nockHeroesCTX = nock('https://raw.githubusercontent.com')
			.get('/kronusme/dota2-api/master/data/heroes.json')
			.reply(200, fs.readFileSync('test/mocks/heroes.json', 'utf8'));    

			 nockModsCTX = nock('https://raw.githubusercontent.com')
			.get('/kronusme/dota2-api/master/data/mods.json')
			.reply(200, fs.readFileSync('test/mocks/mods.json', 'utf8'));

			return init().then(function (res) { 
				dataModel = res;
			}).catch(function (error) {
				logger.error(error);
			});
		});

 		after ( () => {
 			nockModsCTX.done();
 			nockHeroesCTX.done();
 			dataModel = null;
 		});

		Given("The slackBot is open.", (done) => {
			var fn = () => {
				dataModel.slackBot = slackBot.slackBot;
				expect(dataModel.slackBot).to.not.be.null;
				dataModel.eventEmitter.removeListener('slack-open', fn);
				done();
			};

			dataModel.eventEmitter.on('slack-open', fn);

			slackBot.init(dataModel);
		});

		And("mumbleBot is logged in", (done) => {
			var fn = () => {
				dataModel.mumbleClient = mumbleBot.mumbleClient;
				expect(dataModel.mumbleClient).to.not.be.null;
//				expect(dataModel.mumbleClient.user.channel.name).to.be.equal('Root');
				dataModel.eventEmitter.removeListener('mumble-ready', fn);
				done();
			};

			dataModel.eventEmitter.on('mumble-ready', fn);
			mumbleBot.init(dataModel);
		});

		And("Lina is logged into Dire channel", (done) => {
			mumble.connect(config.mumbleURL, {}, (error, testClient) => {
				if (error) { throw new Error(error); }
	    	
				var fnReady = () => {
					var fnMove = (oldChannel, newChannel, actor) => {
						expect(newChannel.name).to.be.equal('Dire');
					
						testClient.user.removeListener('move', fnMove);
						testClient.removeListener('ready', fnReady);
						done();
					};

					testClient.user.on('move', fnMove);
					testClient.channelByName('Dire').join();
				};
				
				testClient.on('ready', fnReady);
	    	testClient.authenticate('Lina');
	    });
		});

		And("Bristleback is logged into Radiant channel", (done) => {
			mumble.connect(config.mumbleURL, {}, (error, testClient) => {
				if (error) { throw new Error(error); }
	    	
				var fnReady = () => {
					var fnMove = (oldChannel, newChannel, actor) => {
						expect(newChannel.name).to.be.equal('Radiant');
					
						testClient.user.removeListener('move', fnMove);
						testClient.removeListener('ready', fnReady);
						done();
					};

					testClient.user.on('move', fnMove);
					testClient.channelByName('Radiant').join();
				};
				
				testClient.on('ready', fnReady);
	    	testClient.authenticate('Bristleback');
	    });
		});

		When("Luna is loggs in and moves to Dire channel", (done) => {
			mumble.connect(config.mumbleURL, {}, (error, testClient) => {
				if (error) { throw new Error(error); }
	    	
				var fnReady = () => {
					var fnMove = (oldChannel, newChannel, actor) => {
						expect(newChannel.name).to.be.equal('Dire');
					
						testClient.user.removeListener('move', fnMove);
						testClient.removeListener('ready', fnReady);
						done();
					};

					testClient.user.on('move', fnMove);
					testClient.channelByName('Dire').join();
				};
				
				testClient.on('ready', fnReady);
	    	testClient.authenticate('Luna');
	    });
		});

		Then('mumbleBot has moved to the channel with most users.', (done) => {
			var fn = () => {
				expect(dataModel.mumbleClient.user.channel.name).to.be.equal('Dire');
				dataModel.eventEmitter.removeListener('mumble-user-move', fn);
				done();
			}
			
			dataModel.eventEmitter.on('mumble-user-move', fn);
			});
	});
});