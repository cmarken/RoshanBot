'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
var nock = require('nock');
var fs = require('fs');
var config = require('exp-config');
const logger = require("../../lib/logger.js");

var mumble = require('mumble');

var mumbleBot = require('../../lib/mumbleBot.js');
var init = require('../../lib/init.js');
var slackBot = require('../../lib/slackBot.js');

Feature("Notify on Slack when someone connects to Mumble", () => {		
	Scenario("1 user (Lina) connects to mumble", () => {
		var dataModel = null;
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

		And("The mumbleBot is ready.", (done) => {
			var fn = () => {
				dataModel.mumbleClient = mumbleBot.mumbleClient;
				expect(dataModel.mumbleClient).to.not.be.null;
				dataModel.eventEmitter.removeListener('mumble-ready', fn);
				done();
			};

			dataModel.eventEmitter.on('mumble-ready', fn);

			mumbleBot.init(dataModel);
		});

		When("The bot notices Lina logs in.", (done) => {
			dataModel.eventEmitter.on('mumble-user-connect', (args) => {
				done();
			});

			mumble.connect(config.mumbleURL, {}, (error, testClient) => {
				if (error) { throw new Error(error); }
	    	
	    	testClient.on('ready', () => {
	    	});

	    	testClient.authenticate('Lina');
			});
		});

		Then("A message is posted on slack.", (done) => {
			var fn = (message) => {
				if (message.type === "message" && message.text === "Lina connected to mumble. Maybe it's game on!?") {
					dataModel.slackBot.removeListener('message', fn);
					done();
				}
			};

			dataModel.slackBot.on('message', fn);
		});
	});
});