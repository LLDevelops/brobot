// eslint-disable-next-line no-unused-vars
const { LLPointTiers } = require("../modules/enums.js");
const { EmbedBuilder } = require('discord.js');
const { autocomplete } = require("../modules/functions.js");

module.exports = {
    name: 'llpoints',
	aliases: ['llp', 'getllpoints', 'seellpoints'],
	usages: ["", "NAME"],
	description: "See your own or other people's LL Point count.",
	// eslint-disable-next-line no-unused-vars
	async execute(message, args) {

		const
			areNoArgs = args.length <= 0,
			num_total_viewers = global.LLPointManager.getNumViewers(),
			getViewer = function getViewer() {
				let viewer = global.LLPointManager.getViewerById(viewer_name);
				if (viewer)
					return viewer;

				viewer = global.LLPointManager.getViewerByName(viewer_name);
				if (viewer)
					return viewer;

				const autocomplete_name = autocomplete(viewer_name, global.LLPointManager.getViewerNames());
				if (autocomplete_name) {
					viewer = global.LLPointManager.getViewerByName(autocomplete_name);

					if (viewer)
						return viewer;
				}

			}

		let viewer,
			viewer_name,
			avatar,
			ll_points = 0,
			rank = num_total_viewers + 1,
			tier = LLPointTiers.LLViewer;

		if (!areNoArgs) {
			viewer_name = args.join(" ");
		}
		else {
			viewer_name = message.author.username;
			avatar = message.author.avatarURL();
		}

		viewer = getViewer();

		if (viewer) {
			ll_points = viewer.ll_points;
			rank = global.LLPointManager.getRankOfViewer(viewer_name);
			tier = viewer.tier;
		}
		else {
			viewer_name += " (Unknown Viewer)";
		}

		const embed_msg = new EmbedBuilder()
			.setColor(0x1cc347)
			.setTitle(viewer_name)
			.setDescription(
				`**LL Points**: \`${ll_points}\`\n` +
				`**Tier**: ${tier}\n` +
				`**Rank**: \`${rank}\` out of \`${num_total_viewers}\``
			)

		if (avatar)
			embed_msg.setThumbnail(avatar);

		message.channel.send({ embeds: [embed_msg] });
	},
};