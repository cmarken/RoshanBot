'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
var fs = require('fs');
var config = require('exp-config');
var EventEmitter = require('events').EventEmitter;

var SlackBot = require('slackbots');
var mumble = require('mumble');

//var init = require('../../lib/init.js');
var mumbleChecker = require('../../lib/mumbleChecker.js');

Feature("As a mumble and slack user I want to be notified on slack when someone connects to mumble so that I know that a game is going to start soon", () => {		
	var slackBot;

	var dataModel = {
		eventEmitter: new EventEmitter()
	};

	Scenario("Someone connects to the mumble server and then Roshan posts in slack who connected.", () => {
		var mumbleOptions;
		var slackOptions;

		before ( () => {
			mumbleOptions = {};

			slackOptions = {
				token: config.slackToken,
    			name: 'Roshan'
			};
		});

		Given("The connection to mumble has been established.", (done) => {
			mumbleChecker({
				mumbleOptions: {},
				mumbleURL: config.mumbleURL
			},
			dataModel
			);

			dataModel.eventEmitter.on('Connection to mumble initialized.', () => {
				done();
			});
		});

		And("The connection to slack has been established.", (done) => {
			slackBot = new SlackBot(slackOptions);

			slackBot.on('open', () => {
				done();
			});
		});

		When("The bot notifies someone logs into mumble", (done) => {
			mumble.connect(process.env.MUMBLE_URL, mumbleOptions, (error, connection) => {
				if (error) { throw new Error(error);}
   			
   				connection.authenticate('Lina');

       			dataModel.eventEmitter.on('User connected to mumble.', (args) => {
 					slackBot.postMessageToChannel(config.reportChannel, args.userName + " connected to mumble. Maybe it's game on!?");
 					done();
    			});
			});
		});

		Then("A message is posted on slack.", (done) => {
			slackBot.on('message', (message) => {
				if (message.type === "message") {
					expect(message.text).to.be.equal("Lina connected to mumble. Maybe it's game on!?");
					done();
				}
			});
		});
	});
});
