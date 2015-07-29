import Entity from './Entity';

export default class Ship extends Entity {
	constructor(options) {
		super(options);
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.vx = options.vx || 0;
		this.vy = options.vy || 0;
		this.ax = options.ax || 0;
		this.ay = options.ay || 0;
		this.mass = options.mass || 1;
		this.thrust = 1200;
		this.rotation = options.angle || 0;
		this.friction = 0;
		this.topSpeed = 600;

		this.rotationSpeed = 10;
		this.force = 0;

		this.dr = 0;
		this.fx = 0;
		this.fy = 0; 
	}

	rotate(amount) {
		this.dr += amount * this.rotationSpeed;
	}

	startRightRotation() {
		this.dr = 1;
	}

	stopRightRotation() {
		this.dr = 0;
	}

	startLeftRotation() {
		this.dr = -1;
	}

	stopLeftRotation() {
		this.dr = 0;
	}

	startThruster() {
		this.force = this.thrust;
	}

	stopThruster() {
		this.force -= this.thrust;
	}

	startReverseThruster() {
		this.force = -this.thrust;
	}

	stopReverseThruster() {
		this.force += this.thrust;
	}

	update(game) {
		const deltaTime = game.time.physicsElapsed;

		// apply rotation

		if (this.dr) {
			this.rotation += this.dr * this.rotationSpeed * deltaTime;
		}

		// apply force

		if (this.force) {
			const fx = Math.cos(this.rotation) * this.thrust;
			const fy = Math.sin(this.rotation) * this.thrust;		
			this.ax = fx / this.mass;
			this.ay = fy / this.mass;
		} 

		else {
			this.ax = 0;
			this.ay = 0;
		}

		// update velocity 

		this.vx += this.ax * deltaTime;
		this.vy += this.ay * deltaTime;

		// apply friction

		this.vx -= this.vx * this.friction;
		this.vy -= this.vy * this.friction;

		// cap speed

		const magnitude = Math.sqrt((this.vx * this.vx) + (this.vy * this.vy));

		if (magnitude > this.topSpeed) {
			const nx = this.vx / magnitude;
			const ny = this.vy / magnitude;
			this.vx = nx * this.topSpeed;
			this.vy = ny * this.topSpeed;
		}

		this.vx = Math.min(this.vx, this.topSpeed);
		this.vy = Math.min(this.vy, this.topSpeed)

		// update position

		this.x += this.vx * deltaTime;
		this.y += this.vy * deltaTime;

		// check bounds

		if (this.x < 0) {
			this.vx *= -1;
			this.x = 0;
		} else if (this.x > game.width) {
			this.vx *= -1;
			this.x = game.width;
		}
 
		if (this.y < 0) {
			this.vy *= -1;
			this.y = 0;
		} else if (this.y > game.height) {
			this.vy *= -1;
			this.y = game.height;
		}

	}

	render(gfx) {		
		const ctx = gfx.context;
		const radius = 10;

		ctx.strokeStyle="#CCCCCC";
		ctx.fillStyle="#CC3333";
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);
		ctx.moveTo(-radius * 1.5, -radius);
		ctx.lineTo(radius * 1.5, 0);
		ctx.lineTo(-radius * 1.5, radius);
		// ctx.lineTo(this.x - radius, this.y-radius);
		ctx.closePath();
		// ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI, false);
		// ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
		ctx.stroke();
		ctx.fill();
		ctx.restore();
		// ctx.closePath();

		// ctx.beginPath();
		// ctx.moveTo(this.x, this.y);
		// ctx.lineTo(Math.cos(this.rotation) * 20 + this.x,
		// 	         Math.sin(this.rotation) * 20 + this.y);
		// ctx.closePath();
		// ctx.stroke();

		ctx.font = "14px Arial";
		let y = 14;
		['x', 'y', 'vx', 'vy', 'ax', 'ay'].forEach((prop) => {
			ctx.fillText(prop + ": " + this[prop], 840, y);
			y += 16;
		});

	}
}