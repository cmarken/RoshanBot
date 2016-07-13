'use strict'

var fs = require('fs');
var Log = require('log');
var log = new Log('debug', fs.createWriteStream('debug.log'));
var mumble = require('mumble');

var mumbleChecker = (settings, dataModel) => {
	mumble.connect(settings.mumbleURL, settings.mumbleOptions, (error, connection) => {
		if (error) {
			log.debug("Error in mumbleChecker: ", error);
			return;
		}

		connection.authenticate('Roshan');
		connection.on('initialized', () => {
    		log.debug("Connection to mumble initialized. Event emitted.");
    		dataModel.eventEmitter.emit("Connection to mumble initialized.");
		});

		connection.on('user-connect', (user) => {
			dataModel.eventEmitter.emit('User connected to mumble.', { userName: user.name } );
			log.debug(user.name, "have connected to mumble. Event emitted.");
		});
	});
}

module.exports = mumbleChecker;