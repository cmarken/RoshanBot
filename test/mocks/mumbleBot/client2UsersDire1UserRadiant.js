'use strict'

let users = () => {
	let array = [ 
		{ 
			name: "Lina", 
			channel: 
			{ 
				name: "Dire" 
			}
		},
		{ 
			name: "Luna",
			channel:
			{
				name: "Dire"
			}
		},
		{
			name: "Bristleback",
			channel: 
			{
				name: "Radiant"
			}
		}
	];

	return array;
	
}

let channelByName = (name) => {
	if (name === 'Dire') {
		return {
			name: 'Dire'
		};
	} else if (name === 'Radiant') {
		return {
			name: 'Radiant'
		};
	} else {
		throw new Error ("That channel name has not been mocked");
	}
}

module.exports = {
	users: users,
	channelByName: channelByName
}