// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————
const fs = require('fs');

module.exports = {
    name: 'recipelist',
    description: 'Lists all craft recipes for all items that\'s craft recipe includes at least one item you have in your inventory. You\'ll see the smelt recipe for an item as long as you have the item(s) needed to smelt for it',
    isServerOnly: true,
    aliases: ['rl'],
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        let userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase(),
            items = JSON.parse(fs.readFileSync('items.json')),
            players = JSON.parse(fs.readFileSync('databases/players.json')),
            smeltList = JSON.parse(fs.readFileSync('smelt list.json')),
            thePlayer = players[userName],
            theMessage = [];

        function toTitleCase(string) { // Magic Function DO NOT TOUCH
			return string.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}


        // Processing
        message.channel.send(`Processing...`)


        Object.entries(items).forEach(entry => {
            let item = entry[0]
            let itemProperties = entry[1]
            let theItemsNeeded = []
            let requiredItems
            let canCraft = false

            if(itemProperties['required']) {
                requiredItems = itemProperties['required']
            }

            if (itemProperties['craftable']){
                theItemsNeeded.push(`__**${toTitleCase(item)}**__`)

                Object.entries(itemProperties['craftable']).forEach(entry2 => {
                    let craftItem = entry2[0]
                    let craftItemAmount = entry2[1]

                    if (Object.keys(thePlayer['inventory']).includes(craftItem)) {
                        if(thePlayer['inventory'][craftItem]['amount'] >= 1) {
                            theItemsNeeded.push(`\`${craftItemAmount}\` **${toTitleCase(craftItem)}**`)

                            canCraft = true
                        }
                    }
                })

                if (requiredItems) {
                    theItemsNeeded.push(`**Required**: \`${requiredItems.join('`, `')}\``)
                }
            } else {
                canCraft = false
            }

            if (canCraft) {
                theMessage.push(`${theItemsNeeded.join('\n')}`)
                theMessage.push(`_ _`)
            }
        })


        Object.entries(smeltList).forEach(entry => {
            let smeltsInto = entry[0]
            let recipe = entry[1]
            let canSmelt = false
            let theItemsNeededForSmelting = []

            theItemsNeededForSmelting.push(`__**${toTitleCase(smeltsInto)}**__ \nSmelt:`)

            Object.entries(recipe).forEach(entry => {
                let smeltItem = entry[0]
                let smeltItemAmount = entry[1]

                console.log({smeltItem, smeltItemAmount})

                theItemsNeededForSmelting.push(`\`${smeltItemAmount}\` **${toTitleCase(smeltItem)}**`)

                if (Object.keys(thePlayer['inventory']).includes(smeltItem)) {
                    if (thePlayer['inventory'][smeltItem]['amount'] >= 1) {
                        console.log({canSmelt})

                        canSmelt = true
                    }
                }
            })

            console.log({canSmelt})

            if (canSmelt) {
                console.log({theItemsNeededForSmelting})
                theMessage.push(`${theItemsNeededForSmelting.join('\n')}\n`)
            }

        })


        // Confirmation Message
        console.log({theMessage})

        if (theMessage) {
            message.channel.send(theMessage)
        } else {
            return message.channel.send(`You need to get some materials before you can see these recipes`)
        }
	},
};