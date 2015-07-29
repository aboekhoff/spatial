import QuadTree from '../lib/QuadTree';
import Entity from '../models/Entity';
import Sphere from '../models/Sphere';
import Ship from '../models/Ship';

export default class RunQuadTree {

	create() {
		this.gfx = this.game.add.bitmapData(this.game.width, this.game.height);
		this.game.add.sprite(0, 0, this.gfx);
		window.qt = this.quadTree = new QuadTree({
			x1: 0,
			y1: 0,
			x2: this.game.width,
			y2: this.game.height
		});

		this.balls = [];

		window.player = this.player = Ship.create({
			x: this.game.width / 2,
			y: this.game.height / 2
		});

		this.game.input.keyboard.addCallbacks(
			this,
			this.onKeyDown,
			this.onKeyUp,
			this.onKeyPress
		)

		window.Entity = Entity;
		window.Sphere = Sphere;


		// window.s1 = Sphere.create({x:0, y:0, r: 1});
		// window.s2 = Sphere.create({x:42, y:42, r: 12});

	}

	addBall() {
		const radius = Math.randomInt(8, 32);
		const x = Math.randomInt(radius, this.game.width - radius);
		const y = Math.randomInt(radius, this.game.height - radius);

		const bbox = {
			x1: x - radius,
			y1: y - radius,
			x2: x + radius,
			y2: y + radius
		}

		const ball = {
			x: x,
			y: y,
			radius: radius,
			bbox: bbox
		}

		this.balls.push(ball);
		this.quadTree.insert(ball.bbox);

		console.log(this.quadTree.getCollisions());

	}

	render() {
		this.gfx.cls();
		this.renderQuadTree();
		this.renderBalls();
		this.renderPlayer();
	}

	renderBalls() {
		const gfx = this.gfx;
		this.balls.forEach((ball) => {
			const x = ball.x;
			const y = ball.y;
			const r = ball.radius;

			gfx.lineStyle(1, 0xFFFFFF, 1);
			gfx.beginFill(0x339933);
			gfx.drawEllipse(
				x, 
				y, 
				r, 
				r
			);
			gfx.endFill();
		});	
	}

	renderQuadTree() {
		// const gfx = this.gfx;
		// this.quadTree.traverse((qt) => {
		// 	gfx.lineStyle(1, 0xCCCCCC, 1);
		// 	gfx.beginFill(0x000000);
		// 	gfx.drawRect(
		// 		qt.bbox.x1, 
		// 		qt.bbox.y1, 
		// 		qt.bbox.x2 - qt.bbox.x1, 
		// 		qt.bbox.y2 - qt.bbox.y1
		// 	);
		// 	gfx.endFill();
		// });
	}

	renderPlayer() {
		this.player.render(this.gfx);
	}

	update() {
		this.player.update(this.game)
	}

	onKeyDown(event) {
		switch(event.keyCode) {
			case Phaser.Keyboard.SPACE:
				this.addBall();
				break;
			case Phaser.Keyboard.RIGHT:
				this.player.startRightRotation();
				break;
			case Phaser.Keyboard.LEFT:
				this.player.startLeftRotation();
				break;
			case Phaser.Keyboard.UP:
				this.player.startThruster();
				break;	
			case Phaser.Keyboard.DOWN:
				this.player.startReverseThruster();
				break;
		}
	}

	onKeyUp(event) {
		switch(event.keyCode) {
			case Phaser.Keyboard.RIGHT:
				this.player.stopRightRotation();
				break;
			case Phaser.Keyboard.LEFT:
				this.player.stopLeftRotation();
				break;
			case Phaser.Keyboard.UP:
				this.player.stopThruster();
				break;
			case Phaser.Keyboard.DOWN:
				this.player.stopReverseThruster();
				break;
			}
	}

	onKeyPress(event) {
	}

}