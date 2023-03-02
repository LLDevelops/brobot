// ? Little Luigi Land ——————————————————————————————————————————————————————————————————————————————————————————————————————

// ? Characters ——————————————————————————————————————————————————————————————————————————————————————————————————————

const fs = require('fs');

module.exports = {
    name: 'myobjects',
    description: 'Tells you the names of all of your objects',
    isServerOnly: true,
    aliases: ['mo'],
    required_servers: ['850167368101396520'],
    required_categories: ['Request Rooms'],
    required_roles:['Character'],
	// eslint-disable-next-line no-unused-vars
	execute(message, args) {
        var objects = JSON.parse(fs.readFileSync('databases/objects.json'))
        var userName = message.guild.members.cache.get(message.author.id).displayName.toLowerCase()
        var theMessage = []
		function toTitleCase(string) { // Magic Function DO NOT TOUCH
			return string.replace(/\w\S*/g, function(txt){
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			});
		}
        // eslint-disable-next-line no-unused-vars

        Object.entries(objects).forEach(
            // eslint-disable-next-line no-unused-vars
            (layer, num) => {
                if (layer[1]['information']['owner'] != userName) {
                    return
                } else {
                    theMessage.push(`\`${toTitleCase(layer[0])}\``)
                }
            }
        )
        theMessage.push(`Use \`<view [object]\` to see what the object is made of.`)
        message.channel.send(theMessage)
	},
};