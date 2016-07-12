'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
// var sinon = require('sinon');
//var Promise = require('bluebird');
//var nock = require('nock');
var fs = require('fs');

var SlackBot = require('slackbots');
var mumble = require('mumble');

//var init = require('../../lib/init.js');

Feature("As a mumble and slack user I want to be notified on slack when someone connects to mumble so that I know that a game is going to start soon", () => {		
	var slackBot;

	Scenario(false, "Someone connects to the mumble server and then Roshan posts in slack who connected.", () => {
		var mumbleOptions;
		var slackOptions;

		before ( () => {
			mumbleOptions = {
				key: fs.readFileSync('mumble-key.pem'),
				cert: fs.readFileSync('mumble-cert.pem')
			};

			slackOptions = {
				token: fs.readFileSync('slackToken.txt'),
    			name: 'Roshan'
			};
		});

		Given("The connection to mumble has been established.", (done) => {
			mumble.connect('mumble://example.org', mumbleOptions, (error, connection) => {
    			if (error) { throw new Error(error);}

    			connection.authenticate('Roshan');
    			
    			connection.on('initialized', () => {
    				done();
				});
			});
		});

		And("The connection to slack has been established.", (done) => {
			slackBot = new SlackBot(slackOptions);

			slackBot.on('open', () => {
				done();
			});
		});

		When("Someone logs on to mumble.");

		Then("A message is posted on slack.", (done) => {
			slackBot.on('message', (message) => {

			});
		});

	});
});