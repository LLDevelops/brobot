const
	Discord = require('discord.js'),
	{ GatewayIntentBits, Partials } = require('discord.js'),
	client = new Discord.Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.DirectMessages,
		],
		partials: [
			Partials.Channel,
			Partials.Message,
		]
	}),
	{ discord_token } =  require("../modules/token.js");

client.login(discord_token);

const functions = {
	toTitleCase(string) {
		return string.replace(
			/\w\S*/g,
			function(txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	},

	changeAttrValue: function changeAttrValue(obj, ...properties) {
		let property = properties[0],
			value = properties.slice(-1)[0];

		properties = properties.slice(0, -1);

		if (properties.length <= 1) {
			obj[property] = value
			return obj;
		}

		if (!obj[property])
			obj[property] = {}

		changeAttrValue(
			obj[properties[0]],
			...properties.slice(1),
			value
		)
	},

	pushItemToObj: function pushItemToObj(obj, ...properties) {
		let property = properties[0],
			value = properties.slice(-1)[0];

		properties = properties.slice(0, -1);

		if (properties.length <= 1) {
			if ( obj[property] )
				obj[property].push(value)
			else
				obj[property] = [value]

			return obj;
		}

		if (!obj[property])
			obj[property] = {}

		pushItemToObj(
			obj[properties[0]],
			...properties.slice(1),
			value
		)
	},

	shuffleArray(array) {
		let current_index = array.length,
			rand_index;

		// While there remain elements to shuffle.
		while (current_index != 0) {

			// Pick a remaining element.
			rand_index = Math.floor( Math.random() * current_index );
			current_index--;

			// And swap it with the current element.
			[ array[current_index], array[rand_index] ] =
				[ array[rand_index], array[current_index] ];
		}

		return array;
	},

	getRandArrayItem(array) {
		return array[ Math.floor( Math.random() * array.length ) ]
	},

	getChannelCategorys(guild) {
		return guild.channels.filter(
			(channel) => {
				return channel.type === "category";
			}
		);
	},

	autocomplete(entry, valid_entries) {
		return valid_entries.find(valid_entry => valid_entry.toLowerCase().startsWith(entry.toLowerCase()));
	},

	getJSONFromObj: function getJSONFromObj(obj) {
		let json_obj = {};

		for (let property in obj) {
			if (property.startsWith("_") || property === "class")
				continue;

			if (typeof obj[property] === "object") {
				if (Array.isArray(obj[property]))
					json_obj[property] = Object.values( getJSONFromObj(obj[property]) );
				else
					json_obj[property] = getJSONFromObj(obj[property]);
			} else
				json_obj[property] = obj[property];
		}

		return json_obj;
	},

	async getCategoryChildren(guild, category_id) {
		let all_channels = await guild.channels.fetch();

		return await all_channels.filter(
			(channel) => {
				return channel.parentId == category_id && channel.type == 0
			}
		);
	},

	async getChannel(guild, channel_id) {
		return await guild.channels.fetch(channel_id);
	},

	async getGuild(guild_id) {
		return await client.guilds.fetch(guild_id);
	},

	async getGuildMember(guild, user_id) {
		return await guild.members.fetch(user_id);
	},

	async getRole(guild, role_name) {
		let all_roles = await guild.roles.fetch();

		return await all_roles.find(role => role.name === role_name);
	},

	async addRole(guild_member, role) {
		await guild_member.roles.add(role).catch(console.error());
	},

	async removeRole(guild_member, role) {
		await guild_member.roles.remove(role).catch(console.error());
	},

	logColor(message, color) {
		let reset = "\x1b[0m",
			color_start;

		switch (color.toLowerCase()) {
			case "cyan":
				color_start = "\x1b[36m"
				break;

			case "red":
				color_start = "\x1b[31m"
				break;
		}

		console.log(color_start + message + reset);
	},

	wait(time_amount, unit = "ms") {
		let milliseconds = 0;

		switch (unit.toLowerCase()) {
			case "h":
			case "hour":
			case "hours":
				milliseconds = time_amount * 60 * 60 * 1000;
				break;

			case "m":
			case "min":
			case "mins":
			case "minute":
			case "minutes":
				milliseconds = time_amount * 60 * 1000;
				break;

			case "s":
			case "sec":
			case "secs":
			case "second":
			case "seconds":
				milliseconds = time_amount * 1000;
				break;

			default:
				milliseconds = time_amount;
				break;
		}

		return new Promise(
			resolve => setTimeout(resolve, milliseconds)
		);
	},

	getUnixTimestamp() {
		return Math.round((new Date()).getTime() / 1000);
	},

	doesValueMatchType: function doesValueMatchType(value, type) {
		const isValueInRange = (value, range) => { return (value < range[0] || value > range[1]) };
		const isValueInList = (value, list) => { return list.includes(value) };
		const isValueFromClass = (value, class_name) => { return value.class == class_name };
		const doAllItemsMatchType = (array, type) => { return array.every(item => doesValueMatchType(item, type)) };

		if (typeof value !== type.base)
			return false;

		if (type.values && !isValueInList(value, type.values))
			return false;

		if (type.range && isValueInRange(value, type.range))
			return false;

		if (type.class && !isValueFromClass(value, type.class))
			return false;

		switch (type.subtype) {
			case "integer": {
				if (!Number.isInteger(value))
					return false;

				break;
			}

			case "array": {
				if (!Array.isArray(value)) {
					return false;
				}

				if (!doAllItemsMatchType(value, type.item_type)) {
					return false;
				}
			}
		}

		return true
	},

	addPropertyToObj: function(obj, property) {
		let doesValueMatchType = require("./functions.js");

		Object.defineProperty(
			obj,
			property.name,
			{
				get: function() { return this['_' + property.name] },
				set: function(new_value) {
						if (doesValueMatchType(new_value, property.type)) {
							this['_' + property.name] = new_value;
						}
						else {
							console.log({obj, property});
							console.log("Must match the following type:");
							console.log(property.type);
							throw new Error(`Invalid value for property ${property.name}: ${new_value}.`);
						}
					},
				enumerable: true,
				configurable: true,
			}
		);
	},
}

module.exports = functions;