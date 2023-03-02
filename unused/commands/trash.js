// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————

const fs = require('fs');

module.exports = {
    name: 'trash',
    description: 'Gets rid of an item you have.',
    isServerOnly: true,
    args: true,
    aliases: ['tr', 'trsh'],
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
    usages: ['<item-name> <amount>'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        let commaArgs = args.join(' ').split(', ');
		let item_name = commaArgs[0].toLowerCase();
		let item_amount = parseFloat(commaArgs[1]);
        let players = JSON.parse(fs.readFileSync('databases/players.json'))
        let userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase()
		function toTitleCase(string) { // Magic Function DO NOT TOUCH
			return string.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

		// Comma Args Check
			if (commaArgs.length < 2) {
				return message.channel.send(`Make sure you have all your arguments. <trash \`<item-name>\` \`<amount>\``)
			}

		// Checks if you own the item you are trashing
			if (
				!Object.keys(players[userName]['inventory']).includes(item_name) ||
				players[userName]['inventory'][item_name]['amount'] < item_amount ||
				!Number.isInteger(item_amount) ||
				item_amount < 0 ||
				item_name === 'space'
			) {
				return message.channel.send(`You don't have \`${item_amount}\` **${toTitleCase(item_name)}**`)
			}

            players[userName]['inventory'][item_name]['amount'] -= item_amount

            players[userName]['inventory']['space'][0] -= item_amount

            fs.writeFileSync('databases/players.json', JSON.stringify(players))

            message.channel.send(`You threw away \`${item_amount}\` **${toTitleCase(item_name)}**`)
        }
};