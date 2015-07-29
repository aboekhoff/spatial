export default class Intro {
	preload() {
	}

	create() {
		console.log('intro');
		let style = { font: "32px monospace", fill: "#fff"};
		this.game.add.text(230, 200, 'Spatial', style);
		this.game.state.start('run-quad-tree');
	}

}