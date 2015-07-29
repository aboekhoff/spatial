export default class Entity {
	constructor(options) {
		if (!this._registered) {
			if (!this.constructor._initalized) {
				this.constructor._initialize();
			}

			const id = this.constructor.instances.all.length;

			this._id = id;
			this.uid = this.constructor.name + ':' + this._id;
			this.constructor.instances.all.push(this);
			this.constructor.instances.live.push(this);
			this.constructor.instances.index[id] = true;
			this._registered = true;
		}
	}

	dispose() {
		this.constructor._dispose(this._id);
	}

	static create(options) {
		if (!this._initalized) {
			this._initialize();
		}
		if (this.instances.free.length > 0) {
			const id = this.instances.free.pop();
			const instance = this.instances.all[id];
			this.instances.index[id] = true;
			this.instances.dirty = true;
			this.call(instance);
		}

		else {
			return new this(options);
		}
	}

	// yield all non-disposed instances
	static all() {
		if (this.instances.dirty) {
			this._rebuildLiveInstances();
		}
		return this.instances.live;
	}

	static byId(id) {
		return this.instances.all[id];
	}

	// private

	static _rebuildLiveInstances() {
		const live = this.instances.live;
		const all = this.instances.all;
		const index = this.instances.index;

		live.length = 0;

		for (let i=0, ii=all.length; i<ii; i++) {
			if (index[i]) {
				live.push(all[i]);
			}
		}

		this.instances.dirty = false;

	}

	static _dispose(id) {
		this.instances.free.push(id);
		this.instances.index[id] = false;
		this.instances.dirty = true;
	}

	static _initialize() {
		this.instances = {
			all: [],
			live: [],
			free: [],
			index: {},
			dirty: false
		}
		this._initalized = true;
	}

}