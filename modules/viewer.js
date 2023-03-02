const { LLPointTiers, LLPointThresholds, LLPointRewards, LLPointAccomplishments } = require("./enums.js");

class Viewer {
	constructor({name, user_id, ll_points=0, isSubscribed=false, didUndertaleQuiz=false, didDeltaruneQuiz=false, games_participated_in=[]}) {
		this.user_id = user_id;
		this.name = name;
		this.ll_points = ll_points;
		this.tier = this.setTier();
		this.isSubscribed = isSubscribed;
		this.didUndertaleQuiz = didUndertaleQuiz;
		this.didDeltaruneQuiz = didDeltaruneQuiz;
		this.games_participated_in = games_participated_in;
	}

	toString() {
		return (
			`${this.name}\n` +
			`Discord ID: ${this.user_id}\n` +
			`LL Points: ${this.ll_points}\n`
		);
	}

	setTier() {
		let tier = LLPointTiers.LLViewer;

		for (let tier_key in LLPointTiers) {
			let tier_threshold = LLPointThresholds[tier_key];

			if (this.ll_points >= tier_threshold) {
				tier = LLPointTiers[tier_key];
				break;
			}
		}

		return tier
	}

	giveReward(accomplishment, game_name=undefined) {

		let accomplishments = Object.values(LLPointAccomplishments);
		if (!accomplishments.includes(accomplishment)) {
			console.log(`Error: No accomplishment called ${accomplishment}`);
			console.log(`Choose between: ${accomplishments.join(", ")}`);
			return `Error: No accomplishment called ${accomplishment}`;
		}
		let accomplishment_key = Object.keys(LLPointAccomplishments).find(key => LLPointAccomplishments[key] === accomplishment);

		switch (accomplishment) {
			case LLPointAccomplishments.Subscribe:
				if (this.isSubscribed) {
					console.log("Error: Already subscribed");
					return "Error: Already subscribed";
				}

				this.isSubscribed = true;
				break;

			case LLPointAccomplishments.DoUndertaleQuiz:
				if (this.didUndertaleQuiz) {
					console.log("Error: Already did Undertale Music Quiz");
					return "Error: Already did Undertale Music Quiz";
				}

				this.didUndertaleQuiz = true;
				break;

			case LLPointAccomplishments.DoDeltaruneQuiz:
				if (this.didDeltaruneQuiz) {
					console.log("Error: Already did Deltarune Music Quiz");
					return "Error: Already did Deltarune Music Quiz";
				}

				this.didDeltaruneQuiz = true;
				break;

			case LLPointAccomplishments.ParticipateInGame:
				if (this.games_participated_in.includes(game_name)) {
					console.log(`Error: Already participated in ${game_name}`);
					return;
				}

				this.games_participated_in.push(game_name);
				break;
		}

		this.ll_points += LLPointRewards[accomplishment_key];
		return "Success";
	}

	addLLPoints(amount) {
		this.ll_points += amount;
	}
}

module.exports = Viewer;