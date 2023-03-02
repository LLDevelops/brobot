// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const { autocomplete } = require("../modules/functions.js");
const Viewer = require('../modules/viewer.js');

module.exports = {
    name: 'addllpoints',
	aliases: ['addllp', '+llp', 'plusllp', 'givellp', '+llpoints', 'plusllpoints', 'givellpoints'],
	usages: ["NAME, AMOUNT"],
	description: "Give LL Points to a viewer.",
	hasCommaArgs: true,
	comma_arg_count: 2,
	isRestrictedToMe: true,
	// eslint-disable-next-line no-unused-vars
	async execute(message, args) {

		let comma_args = args.join(" ").split(", "),
			viewer_name = comma_args[0],
			viewer = global.LLPointManager.getViewerByName(viewer_name),
			added_points = parseFloat(comma_args[1]);


		if (!viewer) {
			let autocomplete_name = autocomplete(viewer_name, global.LLPointManager.getViewerNames());
			if (autocomplete_name) {
				viewer_name = autocomplete_name;
				viewer = global.LLPointManager.getViewerByName(viewer_name);
			}
			if (!viewer) {
				const new_viewer = new Viewer({
					name: viewer_name,
					ll_points: added_points,
				});
				global.LLPointManager.addViewer(new_viewer);
				global.LLPointManager.updateDatabase();
				return message.channel.send(`The viewer, **${viewer_name}**, doesn't exist. Adding viewer...`);
			}
		}

		console.log({comma_args, viewer, viewer_name, added_points});

		global.LLPointManager.viewers.get(viewer_name).addLLPoints(added_points);
		global.LLPointManager.updateDatabase();
		let current_ll_points = global.LLPointManager.viewers.get(viewer_name).ll_points;

		message.channel.send(
			`Giving **${viewer_name}** \`${added_points}\` LL Point(s)...\n` +
			`They now have \`${current_ll_points}\` LL Point(s).`
		);
	},
};