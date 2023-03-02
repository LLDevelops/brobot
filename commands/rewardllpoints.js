// eslint-disable-next-line no-unused-vars
const { LLPointRewards, LLPointAccomplishments } = require('../modules/enums.js')
const { autocomplete } = require("../modules/functions.js");

module.exports = {
    name: 'rewardllpoints',
	aliases: ['reward', 'accomplish'],
	usages: ["NAME, ACCOMPLISHMENT"],
	description: "Give LL Points to a viewer because of their accomplishments.",
	hasCommaArgs: true,
	isRestrictedToMe: true,
	// eslint-disable-next-line no-unused-vars
	async execute(message, args) {

		let
			comma_args = args.join(" ").split(", "),
			viewer_name = comma_args[0],
			viewer = global.LLPointManager.getViewerByName(viewer_name),
			accomplishment = comma_args[1],
			game_name = comma_args[2] || undefined;

		if (!viewer) {
			let autocomplete_name = autocomplete(viewer_name, global.LLPointManager.getViewerNames());
			if (autocomplete_name) {
				viewer_name = autocomplete_name;
				viewer = global.LLPointManager.getViewerByName(viewer_name);
			}
			if (!viewer) {
				return message.channel.send(`The viewer, **${viewer_name}**, doesn't exist.`);
			}
		}

		if (!Object.values(LLPointAccomplishments).includes(accomplishment)) {
			return message.channel.send(
				`The accomplishment, **${accomplishment}**, doesn't exist.\n` + Object.values(LLPointAccomplishments).join(", ")
			);
		}

		console.log({comma_args, viewer, viewer_name, accomplishment});

		const result_msg = global.LLPointManager.viewers.get(viewer_name).giveReward(accomplishment, game_name);

		if (result_msg !== "Success")
			return message.channel.send(result_msg);

		global.LLPointManager.updateDatabase();
		let current_ll_points = global.LLPointManager.viewers.get(viewer_name).ll_points;
		let accomplishment_key = Object.keys(LLPointAccomplishments).find(key => LLPointAccomplishments[key] === accomplishment);

		message.channel.send(
			`Giving **${viewer_name}** \`${LLPointRewards[accomplishment_key]}\` LL Point(s) for "*${accomplishment}*"\n` +
			`They now have \`${current_ll_points}\` LL Point(s).`
		);
	},
};