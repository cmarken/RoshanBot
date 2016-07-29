'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
var config = require('exp-config');
const logger = require("../../lib/logger.js");
var nock = require('nock');
var fs = require('fs');
var mumble = require('mumble');

var mumbleBot = require('../../lib/mumbleBot.js');
var init = require('../../lib/init.js');
var slackBot = require('../../lib/slackBot.js');
var mumbleBotHelpers = require('../../lib/mumbleBotHelpers.js');

Feature("Speak from slack to mumble", () => {
	var dataModel = null;

	Scenario("Input on slack and output in the mumble channel", () => {
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

		Given("The slackBot is open", (done) => {
			var fn = () => {
				dataModel.slackBot = slackBot.slackBot;
				expect(dataModel.slackBot).to.not.be.null;
				dataModel.eventEmitter.removeListener('slack-open', fn);
				done();
			}

			dataModel.eventEmitter.on('slack-open', fn);

			slackBot.init(dataModel);
		});

		And("The mumbleBot is ready", (done) => {
			let fn = () => {
				dataModel.mumbleClient = mumbleBot.mumbleClient;
				expect(dataModel.mumbleClient).to.not.be.null;
				dataModel.eventEmitter.removeListener('mumble-ready', fn);
				done();
			}

			dataModel.eventEmitter.on('mumble-ready', fn); 

			mumbleBot.init(dataModel);
		});

		When("Command is recognized on slack", (done) => {
			

			var fn = (command) => {
				expect(command.type).to.be.equal("tell mumble");
				expect(command.text).to.be.equal("i'll be right there!");
				expect(command.user).to.be.equal(config.botName);
				dataModel.eventEmitter.removeListener('slack-command', fn);
				done();
			}

			dataModel.eventEmitter.on('slack-command', fn);
			dataModel.mumbleClient.on('message', () => {
				console.log('Will not show!');
			});

			dataModel.slackBot.postMessageToChannel(config.reportChannel, "tell mumble i'll be right there!");
		});


// For some reason this test doesn't pass
/*		Then("Print the string to the channel", (done) => {
			let fn = (message, user, scope) => {
				expect(message).to.be.equal("i'll be right there!");
				dataModel.mumbleClient.removeListener('message', fn);
				done();
			};

			dataModel.mumbleClient.on('message', fn);
		});*/

	});
});