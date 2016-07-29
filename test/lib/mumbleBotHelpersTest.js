'use strict'

require('mocha-cakes-2');
const expect = require('chai').expect;

const logger = require("../../lib/logger.js");
const fs = require('fs');
const config = require('exp-config');

const mumbleBotHelpers = require('../../lib/mumbleBotHelpers.js');

const client = require('../mocks/mumbleBot/client2UsersDire1UserRadiant.js');

describe('mumbleBot unit tests', () => {
	
	describe('getChannelWithMostUsers()', () => {

		describe('with 2 users in Dire and 1 user in Radiant Channel', () => {

			it('returns the channel with most users.', () => {
				let channel = mumbleBotHelpers.getChannelWithMostUsers(client);
				expect(channel.name).to.be.equal('Dire');
			});
		});
	});
});