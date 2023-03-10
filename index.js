const
	fs = require("fs"),
	cron = require("cron"),
	Discord = require('discord.js'),
	{ GatewayIntentBits, Partials } = require('discord.js'),
	{ discord_token } = require("./modules/token.js"),
	{ prefix, blocked_users } = require('./config.json'),
	config = require('./config.json'),
	command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js')),
	{ ll_user_id, ll_game_shows: llgs, brobot_user_id, brobot_test_server } = require('./databases/ids.json'),
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
	});

client.commands = new Discord.Collection();

for (const file of command_files) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', async () => {
	const
		Game = require("./modules/game.js"),
		Players = require("./modules/players.js"),
		LLPointManager = require("./modules/llpointmanager.js");

	config.isOn = true;
	fs.writeFileSync("./config.json", JSON.stringify(config));

	global.Roles = require("./modules/roles");
	global.Game = new Game( new Players() );
	global.LLPointManager = new LLPointManager();
	await global.LLPointManager.updateViewersFromDatabase();

	console.log(global);

	client.user.setPresence({
		status: 'online',
		activity: {
			name: "LL Game Shows!",
			type: 'WATCHING',
			url: "https://www.youtube.com/LLGameShows"
		}
	});

	const llgs_server = client.guilds.cache.get(llgs.server_id);
	const daily_controversial_msg = new cron.CronJob(
		'00 30 18 */1 * *',
		() => {
			let messages = JSON.parse(fs.readFileSync("./databases/messages.json"));

			const
				controversial_question_index = Math.floor( Math.random() * messages.controversial_talk.length ),
				controversial_channel = llgs_server.channels.cache.get(llgs.controversial_channel_id),
				controversial_question = messages.controversial_talk[controversial_question_index];

			controversial_channel.send( controversial_question );

			messages.controversial_talk.splice(controversial_question_index, 1);
			fs.writeFileSync("./databases/messages.json", JSON.stringify(messages));
		},
		null,
		true,
		"America/Mexico_City"
	);

	const daily_philosophy_msg = new cron.CronJob(
		'00 30 12 */1 * *',
		() => {
			let messages = JSON.parse(fs.readFileSync("./databases/messages.json"));

			const
				philosophy_question_index = Math.floor( Math.random() * messages.philosophy.length ),
				philosophy_channel = llgs_server.channels.cache.get(llgs.channels.philosophy),
				philosophy_question = messages.controversial_talk[philosophy_question_index];

			philosophy_channel.send( philosophy_question );

			messages.philosophy.splice(philosophy_question_index, 1);
			fs.writeFileSync("./databases/messages.json", JSON.stringify(messages));
		},
		null,
		true,
		"America/Mexico_City"
	);

	daily_philosophy_msg.start();
	daily_controversial_msg.start();

	console.log('Ready!');
});

// Message Reader
client.on('messageCreate', async(msg) => {

	// Log DMs
	if (!msg.guild) {
		let brobot_server = client.guilds.cache.get(brobot_test_server.server_id),
			dm_channel = brobot_server.channels.cache.get(brobot_test_server.dm_channel_id),
			recipient_message;

		// From BroBot
		if (msg.author.id === brobot_user_id) {
			recipient_message = `<@${brobot_user_id}> ??? <@${msg.channel.recipient.id}>\n\`Brobot ??? ${msg.channel.recipient.username}\``;
		}
		// To Brobot
		else {
			recipient_message = `<@${msg.channel.recipient.id}> ??? <@${brobot_user_id}>\n\`${msg.channel.recipient.username} ??? Brobot\``;
		}

		dm_channel.send(
			`${recipient_message}\n` +
			`DM Channel ID: \`${msg.channel.id}\`\n` +
			`Message ID: \`${msg.id}\`\n` +
			`\n` +
			`\`\`\`${msg.content}\`\`\``
		)
	}

	if (
		!msg.content.startsWith(prefix) ||
		msg.author.bot ||
		blocked_users.includes(msg.author.id)
	) return; // Stop

	// Get array of args seperated by space
	const args = msg.content.slice(prefix.length).trim().split(/ +/);
	const command_name = args.shift().toLowerCase();

	// Get command file from name/alias
	const command = client.commands.get(command_name)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));

	// Stop if command doesn't exist
	if (!command || (command.isRestrictedToMe && msg.author.id != ll_user_id)) return;

	console.log("");
	console.log(msg.content); // Log command

	// Check if turned off
	if (
		!config.isOn &&
		command_name != 'togglestatus' &&
		msg.author.id != ll_user_id
	) {
		return msg.channel.send(`Someone's messing with my code. Hold on a moment.`)
	}

	// Server only command?
	if ( (command.isServerOnly || command.required_servers) && msg.channel.type === 'dm' )
		return msg.channel.send('I can\'t do that in DMs!');

	// Has the requried permissions?
	/* https://discord.js.org/#/docs/main/stable/class/Permissions?scrollTo=s-FLAGS */
	if (command.required_permission) {
		const author_perms = msg.channel.permissionsFor(msg.author);

		if (!author_perms || !author_perms.has(command.required_permission)) {
			return msg.channel.send('You don\'t have a permission required to do this.');
		}
	}

	// In The Required Server?
	if (command.required_servers && !command.required_servers.includes(msg.guild.id))
		return msg.channel.send("This command doesn't work on this server.");

	// In The Required Channel?
	if (command.required_channels && !command.required_channels.includes(msg.channel.id))
		return msg.channel.send("This command doesn't work in this channel");

	// In The Requried Category?
	if (command.required_categories && !command.required_categories.includes(msg.channel.parent.id))
		return msg.channel.send("This command doesn't work in this channel category");

	// Has The Required Role(s)?
	let user_roles = msg.member.roles.cache.map(r => r.name);
	if (
		command.required_roles &&
		!command.required_roles.every( role => user_roles.includes(role) )
	) {
		return msg.channel.send('You don\'t have the role(s) required to do this.');
	}

	// Do they need arguments?
	if (command.args) {
		if (args.length == 0) {
			let message = `You need to provide arguments.`;

			if (command.usages) {
				for (let usage of command.usages) {
					message += `\nYou gotta do this: \`${prefix}${command.name} ${usage}\``;
				}
			}

			return msg.channel.send(message);
		}

		if (command.arg_count && args.length != command.arg_count) {
			let message = `You have to give ${command.arg_count} arguments.`;

			if (command.usages) {
				for (let usage of command.usages) {
					message += `\nYou gotta do this: \`${prefix}${command.name} ${usage}\``;
				}
			}

			return msg.channel.send(message);
		}
	}

	if (command.hasCommaArgs) {
		if (args.length == 0) {
			let message = `You need to provide arguments.`;

			if (command.usages) {
				for (let usage of command.usages) {
					message += `\nYou gotta do this: \`${prefix}${command.name} ${usage}\``;
				}
			}

			return msg.channel.send(message);
		}

		let comma_args = args.join(' ').split(', ');

		if (command.comma_arg_count && comma_args.length != command.comma_arg_count) {
			let message = `You have to give ${command.comma_arg_count} arguments.`;

			if (command.usages) {
				for (let usage of command.usages) {
					message += `\nYou gotta do this: \`${prefix}${command.name} ${usage}\``;
				}
			}

			return msg.channel.send(message);
		}
	}

	// Executing Command
	try {
		command.execute(msg, args);
	}
	catch (error) {
		console.error(error);
		msg.channel.send(`Uh oh! <@${ll_user_id}> Something broke...`);
	}
});

// login to Discord with your app's token
client.login(discord_token);
