const { DatabaseURLs, } = require("./enums");
const Viewer = require("./viewer");
const { github_token } =  require("../modules/token.js");

class LLPointManager {
	constructor() {
		this.viewers = new Map();
		this.sha = "";
	}

	async updateViewersFromDatabase() {
		const { promisify } = require('util');
		const request = promisify(require("request"));

		const options = {
			url: DatabaseURLs.Viewers,
			headers: {
				'Authorization': `Token ${github_token}`
			},
		};

		console.log({options});

		request(
			options,
			(error, response, body) => {
				if (!error && response.statusCode == 200) {
					console.log(body);
					let viewers = JSON.parse(body);
					console.log({ viewers });
					this.setViewers(viewers);
				} else {
					console.error(error);
				}
			}
		)
		.catch(err => {
			console.error(err);
		});
	}

	async updateDatabase() {
		const
			axios = require('axios'),
			viewers = Object.fromEntries(this.viewers),
			viewers_str = JSON.stringify(viewers),
			owner = "alexcarron",
			repo = "brobot-database",
			path = "viewers.json";


		try {
			// Get the current file data
			const {data: file} =
				await axios.get(
					`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
					{
						headers: {
							'Authorization': `Token ${github_token}`
						}
					}
				);

			// Update the file content
			const {data: updated_file} =
				await axios.put(
					`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
					{
						message: 'Update file',
						content: new Buffer.from(viewers_str).toString(`base64`),
						sha: file.sha
					},
					{
						headers: {
							'Authorization': `Token ${github_token}`
						}
					}
				);
			console.log(updated_file);
		} catch (error) {
			console.error(error);
		}
	}


	setViewers(viewers_obj) {
		for (let name in viewers_obj) {
			let viewer_properties = viewers_obj[name];
			this.addViewer(new Viewer(viewer_properties));
		}
	}


	getViewers() {
		return this.viewers;
	}

	getArrayOfViewers() {
		return Array.from(this.viewers.values());
	}

	getViewerNames() {
		return Array.from(this.viewers.values()).map(viewer => viewer.name);
	}

	getViewerById(user_id) {
		return this.getArrayOfViewers().find(viewer => viewer.user_id === user_id);
	}

	addViewer(viewer) {
		this.viewers.set(viewer.name, viewer);
	}

	removeViewer(viewer) {
		this.viewers.delete(viewer.name);
	}

	getViewerByName(name) {
		return this.viewers.get(name);
	}

	getNumViewers() {
		return this.viewers.size;
	}

	getRankOfViewer(name) {
		const sorted_viewers_array =
			this.getArrayOfViewers().sort(
				(viewer1, viewer2) => {
					return viewer2.ll_points - viewer1.ll_points;
				}
			)

		const rank = sorted_viewers_array.findIndex((viewer) => viewer.name === name) + 1;

		return rank;
	}
}

module.exports = LLPointManager;