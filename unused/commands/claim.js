// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————

const fs = require('fs');

module.exports = {
    name: 'claim',
    description: 'Claims the location you\'re currently at and names it',
    usages: ['<name-for-location>'],
    isServerOnly: true,
    args: true,
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        var locations = JSON.parse(fs.readFileSync('databases/locations.json'))
        var players = JSON.parse(fs.readFileSync('databases/players.json'))
		let userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase()
        var location = players[userName]['location']

        // Have 0 claims?
            if (players[userName]['claims'] <= 0) {
                return message.channel.send(`You used up all your claims. Buy more at the shop.`)
            }

        if (locations[`${location[0]}, ${location[1]}`]['owner']) {
            return message.channel.send (`Sorry, someone owns this location already.`)
        }

        // Confirmation Message
                message.channel.send(`You just claimed the location at \`(${location[0]}, ${location[1]})\` and called it **${args.join(' ')}**. Here's what it looks like:`, {
                    files: [locations[`${location[0]}, ${location[1]}`]['image'][0]]
                })

                locations[`${location[0]}, ${location[1]}`]['owner'] = userName
                players[userName]['owns'].push(`${location[0]}, ${location[1]}`)
                players[userName]['claims'] = players[userName]['claims']-1
                locations[`${location[0]}, ${location[1]}`]['name'] = args.join(' ').toLowerCase()
                fs.writeFileSync('databases/locations.json', JSON.stringify(locations))
                fs.writeFileSync('databases/players.json', JSON.stringify(players))


                let landchannel = message.guild.channels.cache.get('851233573604032544')
                landchannel.send(`**${message.guild.members.cache.get(message.author.id).displayName}** just claimed the location at \`(${location[0]}, ${location[1]})\` and called it **${args.join(' ')}**.`, {
                    files: [locations[`${location[0]}, ${location[1]}`]['image'][0]]
                })

                let heyluigichannel = message.guild.channels.cache.get('850537726561353758')
                heyluigichannel.send(`**${message.guild.members.cache.get(message.author.id).displayName}** just claimed the location at \`(${location[0]}, ${location[1]})\` and called it **${args.join(' ')}**.`)
        }
};