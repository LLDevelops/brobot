const
	{ getCategoryChildren } = require("../modules/functions"),
	{ rdm_server_id } = require("../databases/ids.json").rapid_discord_mafia;


module.exports = {
	name: 'deletechannels',
    description: 'Delete channels In a category',
	isRestrictedToMe: true,
	args: true,
	arg_count: 1,
    required_permission: 'ADMINISTRATOR',
	required_servers: [rdm_server_id],
	// eslint-disable-next-line no-unused-vars
	async execute(message, args) {
		// Delete Channels
		const
			category_id = args[0],
			category_chnls = await getCategoryChildren(message.guild, category_id);

		await category_chnls.forEach(
			async (channel) => {
				await channel.delete()
					.then(() => {
						console.log(`Deleted ${channel.name}`);
					})
					.catch(console.error);
			}
		);

		message.channel.send("Channels deleted.");
    }
};