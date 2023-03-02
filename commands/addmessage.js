const
	fs = require("fs");


module.exports = {
	name: 'addmessage',
    aliases: ['addm', 'am'],
    description: 'Add message to controversial talk',
	isRestrictedToMe: true,
	usages: ["<message>"],
    required_permission: 'ADMINISTRATOR',
    required_roles: ["LL"],
	async execute(message, args) {

		let new_message = args.join(' ');

		let messages = JSON.parse(fs.readFileSync("./databases/messages.json"));

		messages.controversial_talk.push(new_message);

		fs.writeFileSync("./databases/messages.json", JSON.stringify(messages));
        message.channel.send( { files: ['databases/messages.json'] } );
		console.log("Added message");
		console.log({messages});

    }
};