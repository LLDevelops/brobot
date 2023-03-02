// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————
const fs = require('fs');

module.exports = {
    name: 'sacrifice',
    description: 'Sacrifice items or LL Points at a church of the religion your following in order to have Little Luigi Land\'s limitations be removed. You can replace `<item-name>` with "LL Points" if you want sacrifice LL Points.',
    isServerOnly: true,
    args: true,
    aliases: ['sac', 'offer'],
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
    usages: ['<item-name>, <amount-of-item>'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        let commaArgs = args.join(' ').split(', '),
            userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase(),
            objects = JSON.parse(fs.readFileSync('databases/objects.json')),
            locations = JSON.parse(fs.readFileSync('databases/locations.json')),
            items = JSON.parse(fs.readFileSync('items.json')),
            players = JSON.parse(fs.readFileSync('databases/players.json')),
            religions = JSON.parse(fs.readFileSync('databases/religions.json')),
            thePlayer = players[userName],
            other_land_channel = message.guild.channels.cache.get('851233573604032544'),
			item_name = commaArgs[0].toLowerCase(),
			item_amount = commaArgs[1],
            playerLocation = players[userName]['location'].join(', '),
            insideLocation = players[userName]['inside'].toLowerCase(),
            insideStatus = players[userName]['inside'] != "",
			building_properties,
			religion_of_church,
			exp_gained,
			requestRoomMessage,
			other_land_message;
		function toTitleCase(string) { // Magic Function DO NOT TOUCH
			return string.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

        // Processing
        message.channel.send(`Processing...`)


		// Checks
		if (!insideStatus) {
			return message.channel.send(`You have to be inside a church to sacrifice items or LL Points for a religion.`)
		}
		building_properties = locations[playerLocation]['layers'][insideLocation]

		if (building_properties['information']['type'] != 'church') {
			return message.channel.send(`You have to be inside a church to sacrifice items or LL Points for a religion.`)
		}
		religion_of_church = building_properties['information']['religion']

		if (players[userName]['following'] != religion_of_church) {
			return message.channel.send(`You need to be following the religion of **${religion_of_church}** in order to sacrifice here.`)
		}

		if(!Object.keys(items).includes(item_name) && item_name != 'll points') {
			return message.channel.send(`That's not a real item.`)
		}

		if (item_name != 'll points') {
			if (!Object.keys(thePlayer['inventory']).includes(item_name)) {
				return message.channel.send(`You don't have any **${item_name}**`)
			}

			if (thePlayer['inventory'][item_name]['amount'] < item_amount) {
				return message.channel.send(`You don't have enough **${item_name}**. You only have \`${thePlayer['inventory'][item_name]['amount']}\``)
			}

			players[userName]['inventory'][item_name]['amount'] -= item_amount

			players[userName]['inventory']['space'][0] -= item_amount

			religions[religion_of_church]['sacrifices'][item_name] = item_amount
		} else {
			if (players[userName]['LL Points'] < item_amount) {
				return message.channel.send(`You don't have enough LL Points. You only have \`${players[userName]['LL Points']}\``)
			}

			players[userName]['LL Points'] -= item_amount

			religions[religion_of_church]['sacrifices'][item_name] = item_amount
		}

		exp_gained = 2 + Math.floor( Math.random() * 4 )
		players[userName]['experience'] += exp_gained

        requestRoomMessage = `You've sacrificed **${toTitleCase(item_name)}**\`(x${item_amount})\` to the religion, **${toTitleCase(religion_of_church)}**`
        other_land_message = `**${userName}** sacrificed **${toTitleCase(item_name)}**\`(x${item_amount})\` to the religion, **${toTitleCase(religion_of_church)}**`

        // Overwrite JSON file
            fs.writeFileSync('databases/objects.json', JSON.stringify(objects))
            fs.writeFileSync('databases/players.json', JSON.stringify(players))
            fs.writeFileSync('databases/religions.json', JSON.stringify(religions))
            fs.writeFileSync('databases/locations.json', JSON.stringify(locations))

        // Confirmation Message
            message.channel.send(requestRoomMessage)
            other_land_channel.send(other_land_message)
			if (exp_gained) {
				message.channel.send(`\`+${exp_gained} XP\``)
			}

	},
};