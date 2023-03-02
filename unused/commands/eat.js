// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————


const fs = require('fs');
var jimp = require('jimp');

module.exports = {
    name: 'eat',
    description: 'Makes you consume a food item in your inventory, restoring a certain amount of hunger points',
    isServerOnly: true,
    args: true,
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
    usages: ['<food-name>'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        var objects = JSON.parse(fs.readFileSync('databases/objects.json'))
        var players = JSON.parse(fs.readFileSync('databases/players.json'))
        var locations = JSON.parse(fs.readFileSync('databases/locations.json'))
        var userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase()
        var balance = players[userName]['LL Points']
        var currentLocationText = players[userName]['location'].join(', ')
        var allObjects = Object.keys(objects)
        var foodName = args.join(' ').toLowerCase()
        var theMessage = []
		function toTitleCase(string) { // Magic Function DO NOT TOUCH
			return string.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

        // Processing
        message.channel.send(`Processing...`)

        // Do you have the food
            if (!Object.keys(players[userName]['inventory']).includes(foodName)) {
                return message.channel.send(`You don't have \`${foodName}\``)
            }

        // Check if it's food
        if (players[userName]['inventory'][foodName]['type'] != 'food') {
            return message.channel.send(`That isn't food`)
        }

        // Check if the amount isn't 0
        if (players[userName]['inventory'][foodName]['amount'] <= 0) {
            return message.channel.send(`You don't have anymore \`${foodName}\``)
        }

        // Eat it
        // Subtract amount
        players[userName]['inventory'][foodName]['amount'] -= 1
		players[userName]['inventory']['space'][0] -= 1

        // Increase Hunger
        if (players[userName]['hunger'] >= 5) {
            players[userName]['hunger'] = players[userName]['hunger']+players[userName]['inventory'][foodName]['restore']
            if (players[userName]['hunger'] >= 6) {
                let HPRestores = Math.floor(players[userName]['hunger'] - 5)
                players[userName]['HP'] = players[userName]['HP'] + Math.floor(players[userName]['hunger'] - 5)
                players[userName]['hunger'] = players[userName]['hunger'] - Math.floor(players[userName]['hunger'] - 5)
                if (players[userName]['HP'] > 5) {
                    players[userName]['HP'] = 5
                    return message.channel.send(`You have 5 HP and are full so you can't restore anymore health or hunger from eating this. You now have \`${players[userName]['HP']}\` HP`)
                } else {
                    theMessage.push(`You've restored \`${HPRestores}\` HP and lost \`${HPRestores}\` hunger bars since you're full. You now have \`${players[userName]['HP']}\` HP`)
                }
            } else {
                theMessage.push(`If you eat and get 6+ hunger bars, you'll start restoring 1 HP for each hunger bar if your HP is under 5.`)
            }
        } else {
            players[userName]['hunger'] += players[userName]['inventory'][foodName]['restore']
        }

        theMessage.unshift(`You just ate your \`${toTitleCase(foodName)}\` and got \`${players[userName]['inventory'][foodName]['restore']}\` hunger points. You now have \`${players[userName]['hunger']}\` hunger points.`)

        // Overwrite JSON file
            fs.writeFileSync('databases/players.json', JSON.stringify(players))

        // Confirmation Message
            message.channel.send(theMessage.join('\n'))
	},
};