'use strict'

const logger = require("./logger.js");
const config = require('exp-config');

var getChannelWithMostUsers = (client) => {
	let channels = {};
	let users = client.users();

	users.map( (user) => {
		if (!channels[user.channel.name]) {
			channels[user.channel.name] = 1;
		} else {
			channels[user.channel.name]++;
		}
	});

	let channelName = Object.keys(channels).reduce( (a, b) => { 
		return channels[a] > channels[b] ? a : b 
	});

	return client.channelByName(channelName);
}

module.exports = {
	getChannelWithMostUsers: getChannelWithMostUsers
}