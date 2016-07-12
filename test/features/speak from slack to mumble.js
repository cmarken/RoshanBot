'use strict';

require('mocha-cakes-2');
var expect = require('chai').expect;
var sinon = require('sinon');
var Promise = require('bluebird');
var nock = require('nock');
var fs = require('fs');

var init = require('../../lib/init.js');

/*Feature("As a mumble and slack user i want to be able to make the bot speak in the mumble 
			channel so that I can notify my friends when i'm close to be able to play", () => {
		before ( () => {
		});

		Given("", () => {
		});
	});
});*/