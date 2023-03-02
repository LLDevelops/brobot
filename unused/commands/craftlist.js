// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————

const fs = require('fs');

module.exports = {
    name: 'craftlist',
    description: 'Lists every item you can currently craft and smelt',
    isServerOnly: true,
    aliases: ['crl'],
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        let userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase(),
            items = JSON.parse(fs.readFileSync('items.json')),
            players = JSON.parse(fs.readFileSync('databases/players.json')),
            smeltList = JSON.parse(fs.readFileSync('smelt list.json')),
            thePlayer = players[userName];

		function toTitleCase(string) { // Magic Function DO NOT TOUCH
			return string.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}

        var theMessage = []

        // Processing
        message.channel.send(`Processing...`)


        Object.entries(items).forEach(entry => {
            let item = entry[0]
            let itemProperties = entry[1]
            let canCraft = true
            let theItemsNeeded = []
            let requiredItems

            if(itemProperties['required']) {
                requiredItems = itemProperties['required']
            }


            if (itemProperties['craftable']){
                theItemsNeeded.push(`__**${toTitleCase(item)}**__`)

                Object.entries(itemProperties['craftable']).forEach(entry2 => {
                    let craftItem = entry2[0]
                    let craftItemAmount = entry2[1]

                    if (!Object.keys(thePlayer['inventory']).includes(craftItem)) {
                        return canCraft = false
                    }

                    if (thePlayer['inventory'][craftItem]['amount'] < craftItemAmount) {
                        return canCraft = false
                    }

                    theItemsNeeded.push(`\`${craftItemAmount}\` **${toTitleCase(craftItem)}**`)
                })

                if (requiredItems) {
					requiredItems = requiredItems.map(item => {
						return toTitleCase(item)
					})

                    theItemsNeeded.push(`**Required**: \`${requiredItems.join('`, `')}\``)
                }
            } else {
                canCraft = false
            }


            if (canCraft) {
                theMessage.push(`${theItemsNeeded.join('\n')}\n`)
            }
        })

        Object.entries(smeltList).forEach(entry => {
            let smeltsInto = entry[0]
            let recipe = entry[1]
            let canSmelt = true
            let theItemsNeededForSmelting = []

		theItemsNeededForSmelting.push(`__**${toTitleCase(smeltsInto)}**__ \nSmelt:`)

            Object.entries(recipe).forEach(entry => {
                let smeltItem = entry[0]
                let smeltItemAmount = entry[1]

                if (!Object.keys(thePlayer['inventory']).includes(smeltItem)) {
                    return canSmelt = false
                }

                if (thePlayer['inventory'][smeltItem]['amount'] < smeltItemAmount) {
                    return canSmelt = false
                }

                theItemsNeededForSmelting.push(`\`${smeltItemAmount}\` **${toTitleCase(smeltItem)}**`)
            })

            if (canSmelt) {
                theMessage.push(`${theItemsNeededForSmelting.join('\n')}\n`)
            }

        })

        // Confirmation Message
        console.log(theMessage)
        if (theMessage != []) {
            message.channel.send(theMessage)
        } else {
            return message.channel.send(`You can craft NOTHING`)
        }
	},
};