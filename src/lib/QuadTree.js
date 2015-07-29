const LEAF = 1;
const QUAD = 2;

export default class QuadTree {
	constructor(bbox, capacity = 4, depth=0, maxDepth=5) {
		this.type = LEAF;
		this.capacity = capacity;

		this.depth = depth;
		this.maxDepth = maxDepth;

		this.bbox = bbox;
		this.population = 0;
		this.objects = [];

		this.northwest = null;
		this.northeast = null;
		this.southwest = null;
		this.southeast = null;
	}

	getPossibleCollisions(res = []) {
		if (this.type == LEAF) {
			for (let i=0; i<this.objects.length; i++) {
				const a = this.objects[i];
				for (let j=i+1; j<this.objects.length; j++) {
					const b = this.objects[j];
					if (Math.intersects(a, b)) {
						res.push([a, b, this.bbox]);
					}
				}
			}
		} 
		else {
			this.northwest.getPossibleCollisions(res);
			this.northeast.getPossibleCollisions(res);
			this.southwest.getPossibleCollisions(res);
			this.southeast.getPossibleCollisions(res);
		}
		return res;
	}

	traverse(callback) {
		callback(this);
		if (this.type === QUAD) {
			this.northwest.traverse(callback);
			this.northeast.traverse(callback);
			this.southwest.traverse(callback);
			this.southeast.traverse(callback);
		}
	}

	insert(obj) {
		// do nothing if obj not in bbox
		if (!Math.intersects(this.bbox, obj)) {
			return false;
		}

		this.population++;

		// push object onto array if there is room or at max depth

		if (this.population < this.capacity || this.depth >= this.maxDepth) {
			this.objects.push(obj);
			return true;
		}

		// subdivide if leaf node
		if (this.type === LEAF) {
			this.subdivide();
		}

		// push the new object onto all subtrees
		this.northwest.insert(obj);
		this.northeast.insert(obj);
		this.southwest.insert(obj);
		this.southeast.insert(obj);

		return true;

	}

	subdivide() {
		const x1 = this.bbox.x1;
		const x2 = this.bbox.x2;
		const y1 = this.bbox.y1;
		const y2 = this.bbox.y2;

		const w = x2 - x1;
		const h = y2 - y1;

		const nw = {
			x1: x1, 
			y1: y1, 
			x2: x1 + w/2,
			y2: y1 + h/2 
		}

		this.northwest = new QuadTree(nw, this.capacity, this.depth+1, this.maxDepth);

		const ne = {
			x1: x1 + w/2,
			y1: y1,
			x2: x2,
			y2: y1 + h/2
		} 

		this.northeast = new QuadTree(ne, this.capacity, this.depth+1, this.maxDepth);

		const sw = {
			x1: x1,
			y1: y1 + h/2,
			x2: x1 + w/2,
			y2: y2
		}

		this.southwest = new QuadTree(sw, this.capacity, this.depth+1, this.maxDepth);

		const se = {
			x1: x1 + w/2,
			y1: y1 + h/2,
			x2: x2,
			y2: y2
		}

		this.southeast = new QuadTree(se, this.capacity, this.depth+1, this.maxDepth);

		// redistribute objects to new quadrants

		for (let i=0; i<this.objects.length; i++) {
			const obj = this.objects[i];
			this.northwest.insert(obj);
			this.northeast.insert(obj);
			this.southwest.insert(obj);
			this.southeast.insert(obj);
		}

		this.type = QUAD;
	}

}