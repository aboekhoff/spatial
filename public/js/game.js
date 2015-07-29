(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMath = require('./lib/Math');

var _libMath2 = _interopRequireDefault(_libMath);

var _statesBoot = require('./states/Boot');

var _statesBoot2 = _interopRequireDefault(_statesBoot);

var _statesPreload = require('./states/Preload');

var _statesPreload2 = _interopRequireDefault(_statesPreload);

var _statesIntro = require('./states/Intro');

var _statesIntro2 = _interopRequireDefault(_statesIntro);

var _statesRunQuadTree = require('./states/RunQuadTree');

var _statesRunQuadTree2 = _interopRequireDefault(_statesRunQuadTree);

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO);

game.state.add('boot', _statesBoot2['default']);
game.state.add('preload', _statesPreload2['default']);
game.state.add('intro', _statesIntro2['default']);
game.state.add('run-quad-tree', _statesRunQuadTree2['default']);
game.state.start('boot');

},{"./lib/Math":2,"./states/Boot":7,"./states/Intro":8,"./states/Preload":9,"./states/RunQuadTree":10}],2:[function(require,module,exports){
"use strict";

Math.randomInt = function (min) {
	var max = arguments[1] === undefined ? null : arguments[1];

	if (max == null) {
		max = min;min = 0;
	}
	return Math.floor(Math.random() * (max - min) + min);
};

Math.distance = function (x1, y1, x2, y2) {
	return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

Math.normalize = function (val, min, max) {
	return (val - min) / (max - min);
};

Math.compare = function (a, b) {
	return a < b ? -1 : b < a ? 1 : 0;
};

Math.intersects = function (a, b) {
	return a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
};

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LEAF = 1;
var QUAD = 2;

var QuadTree = (function () {
	function QuadTree(bbox) {
		var capacity = arguments[1] === undefined ? 4 : arguments[1];
		var depth = arguments[2] === undefined ? 0 : arguments[2];
		var maxDepth = arguments[3] === undefined ? 5 : arguments[3];

		_classCallCheck(this, QuadTree);

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

	_createClass(QuadTree, [{
		key: "getPossibleCollisions",
		value: function getPossibleCollisions() {
			var res = arguments[0] === undefined ? [] : arguments[0];

			if (this.type == LEAF) {
				for (var i = 0; i < this.objects.length; i++) {
					var a = this.objects[i];
					for (var j = i + 1; j < this.objects.length; j++) {
						var b = this.objects[j];
						if (Math.intersects(a, b)) {
							res.push([a, b, this.bbox]);
						}
					}
				}
			} else {
				this.northwest.getPossibleCollisions(res);
				this.northeast.getPossibleCollisions(res);
				this.southwest.getPossibleCollisions(res);
				this.southeast.getPossibleCollisions(res);
			}
			return res;
		}
	}, {
		key: "traverse",
		value: function traverse(callback) {
			callback(this);
			if (this.type === QUAD) {
				this.northwest.traverse(callback);
				this.northeast.traverse(callback);
				this.southwest.traverse(callback);
				this.southeast.traverse(callback);
			}
		}
	}, {
		key: "insert",
		value: function insert(obj) {
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
	}, {
		key: "subdivide",
		value: function subdivide() {
			var x1 = this.bbox.x1;
			var x2 = this.bbox.x2;
			var y1 = this.bbox.y1;
			var y2 = this.bbox.y2;

			var w = x2 - x1;
			var h = y2 - y1;

			var nw = {
				x1: x1,
				y1: y1,
				x2: x1 + w / 2,
				y2: y1 + h / 2
			};

			this.northwest = new QuadTree(nw, this.capacity, this.depth + 1, this.maxDepth);

			var ne = {
				x1: x1 + w / 2,
				y1: y1,
				x2: x2,
				y2: y1 + h / 2
			};

			this.northeast = new QuadTree(ne, this.capacity, this.depth + 1, this.maxDepth);

			var sw = {
				x1: x1,
				y1: y1 + h / 2,
				x2: x1 + w / 2,
				y2: y2
			};

			this.southwest = new QuadTree(sw, this.capacity, this.depth + 1, this.maxDepth);

			var se = {
				x1: x1 + w / 2,
				y1: y1 + h / 2,
				x2: x2,
				y2: y2
			};

			this.southeast = new QuadTree(se, this.capacity, this.depth + 1, this.maxDepth);

			// redistribute objects to new quadrants

			for (var i = 0; i < this.objects.length; i++) {
				var obj = this.objects[i];
				this.northwest.insert(obj);
				this.northeast.insert(obj);
				this.southwest.insert(obj);
				this.southeast.insert(obj);
			}

			this.type = QUAD;
		}
	}]);

	return QuadTree;
})();

exports["default"] = QuadTree;
module.exports = exports["default"];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Entity = (function () {
	function Entity(options) {
		_classCallCheck(this, Entity);

		if (!this._registered) {
			if (!this.constructor._initalized) {
				this.constructor._initialize();
			}

			var id = this.constructor.instances.all.length;

			this._id = id;
			this.uid = this.constructor.name + ':' + this._id;
			this.constructor.instances.all.push(this);
			this.constructor.instances.live.push(this);
			this.constructor.instances.index[id] = true;
			this._registered = true;
		}
	}

	_createClass(Entity, [{
		key: 'dispose',
		value: function dispose() {
			this.constructor._dispose(this._id);
		}
	}], [{
		key: 'create',
		value: function create(options) {
			if (!this._initalized) {
				this._initialize();
			}
			if (this.instances.free.length > 0) {
				var id = this.instances.free.pop();
				var instance = this.instances.all[id];
				this.instances.index[id] = true;
				this.instances.dirty = true;
				this.call(instance);
			} else {
				return new this(options);
			}
		}
	}, {
		key: 'all',

		// yield all non-disposed instances
		value: function all() {
			if (this.instances.dirty) {
				this._rebuildLiveInstances();
			}
			return this.instances.live;
		}
	}, {
		key: 'byId',
		value: function byId(id) {
			return this.instances.all[id];
		}
	}, {
		key: '_rebuildLiveInstances',

		// private

		value: function _rebuildLiveInstances() {
			var live = this.instances.live;
			var all = this.instances.all;
			var index = this.instances.index;

			live.length = 0;

			for (var i = 0, ii = all.length; i < ii; i++) {
				if (index[i]) {
					live.push(all[i]);
				}
			}

			this.instances.dirty = false;
		}
	}, {
		key: '_dispose',
		value: function _dispose(id) {
			this.instances.free.push(id);
			this.instances.index[id] = false;
			this.instances.dirty = true;
		}
	}, {
		key: '_initialize',
		value: function _initialize() {
			this.instances = {
				all: [],
				live: [],
				free: [],
				index: {},
				dirty: false
			};
			this._initalized = true;
		}
	}]);

	return Entity;
})();

exports['default'] = Entity;
module.exports = exports['default'];

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Entity2 = require("./Entity");

var _Entity3 = _interopRequireDefault(_Entity2);

var Ship = (function (_Entity) {
	function Ship(options) {
		_classCallCheck(this, Ship);

		_get(Object.getPrototypeOf(Ship.prototype), "constructor", this).call(this, options);
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

	_inherits(Ship, _Entity);

	_createClass(Ship, [{
		key: "rotate",
		value: function rotate(amount) {
			this.dr += amount * this.rotationSpeed;
		}
	}, {
		key: "startRightRotation",
		value: function startRightRotation() {
			this.dr = 1;
		}
	}, {
		key: "stopRightRotation",
		value: function stopRightRotation() {
			this.dr = 0;
		}
	}, {
		key: "startLeftRotation",
		value: function startLeftRotation() {
			this.dr = -1;
		}
	}, {
		key: "stopLeftRotation",
		value: function stopLeftRotation() {
			this.dr = 0;
		}
	}, {
		key: "startThruster",
		value: function startThruster() {
			this.force = this.thrust;
		}
	}, {
		key: "stopThruster",
		value: function stopThruster() {
			this.force -= this.thrust;
		}
	}, {
		key: "startReverseThruster",
		value: function startReverseThruster() {
			this.force = -this.thrust;
		}
	}, {
		key: "stopReverseThruster",
		value: function stopReverseThruster() {
			this.force += this.thrust;
		}
	}, {
		key: "update",
		value: function update(game) {
			var deltaTime = game.time.physicsElapsed;

			// apply rotation

			if (this.dr) {
				this.rotation += this.dr * this.rotationSpeed * deltaTime;
			}

			// apply force

			if (this.force) {
				var fx = Math.cos(this.rotation) * this.thrust;
				var fy = Math.sin(this.rotation) * this.thrust;
				this.ax = fx / this.mass;
				this.ay = fy / this.mass;
			} else {
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

			var magnitude = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

			if (magnitude > this.topSpeed) {
				var nx = this.vx / magnitude;
				var ny = this.vy / magnitude;
				this.vx = nx * this.topSpeed;
				this.vy = ny * this.topSpeed;
			}

			this.vx = Math.min(this.vx, this.topSpeed);
			this.vy = Math.min(this.vy, this.topSpeed);

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
	}, {
		key: "render",
		value: function render(gfx) {
			var _this = this;

			var ctx = gfx.context;
			var radius = 10;

			ctx.strokeStyle = "#CCCCCC";
			ctx.fillStyle = "#CC3333";
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
			var y = 14;
			["x", "y", "vx", "vy", "ax", "ay"].forEach(function (prop) {
				ctx.fillText(prop + ": " + _this[prop], 840, y);
				y += 16;
			});
		}
	}]);

	return Ship;
})(_Entity3["default"]);

exports["default"] = Ship;
module.exports = exports["default"];

},{"./Entity":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Entity2 = require('./Entity');

var _Entity3 = _interopRequireDefault(_Entity2);

var Sphere = (function (_Entity) {
	function Sphere(options) {
		_classCallCheck(this, Sphere);

		_get(Object.getPrototypeOf(Sphere.prototype), 'constructor', this).call(this, options);
	}

	_inherits(Sphere, _Entity);

	_createClass(Sphere, null, [{
		key: 'create',
		value: function create(options) {
			return _get(Object.getPrototypeOf(Sphere), 'create', this).call(this, options);
		}
	}]);

	return Sphere;
})(_Entity3['default']);

exports['default'] = Sphere;
module.exports = exports['default'];

},{"./Entity":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Boot = (function () {
	function Boot() {
		_classCallCheck(this, Boot);
	}

	_createClass(Boot, [{
		key: 'preload',
		value: function preload() {}
	}, {
		key: 'create',
		value: function create() {
			console.log('boot');
			this.game.state.start('preload');
		}
	}]);

	return Boot;
})();

exports['default'] = Boot;
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Intro = (function () {
	function Intro() {
		_classCallCheck(this, Intro);
	}

	_createClass(Intro, [{
		key: "preload",
		value: function preload() {}
	}, {
		key: "create",
		value: function create() {
			console.log("intro");
			var style = { font: "32px monospace", fill: "#fff" };
			this.game.add.text(230, 200, "Spatial", style);
			this.game.state.start("run-quad-tree");
		}
	}]);

	return Intro;
})();

exports["default"] = Intro;
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Preload = (function () {
	function Preload() {
		_classCallCheck(this, Preload);
	}

	_createClass(Preload, [{
		key: 'preload',
		value: function preload() {}
	}, {
		key: 'create',
		value: function create() {
			console.log('preload');
			this.game.state.start('intro');
		}
	}]);

	return Preload;
})();

exports['default'] = Preload;
module.exports = exports['default'];

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _libQuadTree = require('../lib/QuadTree');

var _libQuadTree2 = _interopRequireDefault(_libQuadTree);

var _modelsEntity = require('../models/Entity');

var _modelsEntity2 = _interopRequireDefault(_modelsEntity);

var _modelsSphere = require('../models/Sphere');

var _modelsSphere2 = _interopRequireDefault(_modelsSphere);

var _modelsShip = require('../models/Ship');

var _modelsShip2 = _interopRequireDefault(_modelsShip);

var RunQuadTree = (function () {
	function RunQuadTree() {
		_classCallCheck(this, RunQuadTree);
	}

	_createClass(RunQuadTree, [{
		key: 'create',
		value: function create() {
			this.gfx = this.game.add.bitmapData(this.game.width, this.game.height);
			this.game.add.sprite(0, 0, this.gfx);
			window.qt = this.quadTree = new _libQuadTree2['default']({
				x1: 0,
				y1: 0,
				x2: this.game.width,
				y2: this.game.height
			});

			this.balls = [];

			window.player = this.player = _modelsShip2['default'].create({
				x: this.game.width / 2,
				y: this.game.height / 2
			});

			this.game.input.keyboard.addCallbacks(this, this.onKeyDown, this.onKeyUp, this.onKeyPress);

			window.Entity = _modelsEntity2['default'];
			window.Sphere = _modelsSphere2['default'];

			// window.s1 = Sphere.create({x:0, y:0, r: 1});
			// window.s2 = Sphere.create({x:42, y:42, r: 12});
		}
	}, {
		key: 'addBall',
		value: function addBall() {
			var radius = Math.randomInt(8, 32);
			var x = Math.randomInt(radius, this.game.width - radius);
			var y = Math.randomInt(radius, this.game.height - radius);

			var bbox = {
				x1: x - radius,
				y1: y - radius,
				x2: x + radius,
				y2: y + radius
			};

			var ball = {
				x: x,
				y: y,
				radius: radius,
				bbox: bbox
			};

			this.balls.push(ball);
			this.quadTree.insert(ball.bbox);

			console.log(this.quadTree.getCollisions());
		}
	}, {
		key: 'render',
		value: function render() {
			this.gfx.cls();
			this.renderQuadTree();
			this.renderBalls();
			this.renderPlayer();
		}
	}, {
		key: 'renderBalls',
		value: function renderBalls() {
			var gfx = this.gfx;
			this.balls.forEach(function (ball) {
				var x = ball.x;
				var y = ball.y;
				var r = ball.radius;

				gfx.lineStyle(1, 16777215, 1);
				gfx.beginFill(3381555);
				gfx.drawEllipse(x, y, r, r);
				gfx.endFill();
			});
		}
	}, {
		key: 'renderQuadTree',
		value: function renderQuadTree() {}
	}, {
		key: 'renderPlayer',
		value: function renderPlayer() {
			this.player.render(this.gfx);
		}
	}, {
		key: 'update',
		value: function update() {
			this.player.update(this.game);
		}
	}, {
		key: 'onKeyDown',
		value: function onKeyDown(event) {
			switch (event.keyCode) {
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
	}, {
		key: 'onKeyUp',
		value: function onKeyUp(event) {
			switch (event.keyCode) {
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
	}, {
		key: 'onKeyPress',
		value: function onKeyPress(event) {}
	}]);

	return RunQuadTree;
})();

exports['default'] = RunQuadTree;
module.exports = exports['default'];

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

},{"../lib/QuadTree":3,"../models/Entity":4,"../models/Ship":5,"../models/Sphere":6}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvYW5keS9Qcm9qZWN0cy9zcGF0aWFsL3NyYy9NYWluLmpzIiwiL1VzZXJzL2FuZHkvUHJvamVjdHMvc3BhdGlhbC9zcmMvbGliL01hdGguanMiLCIvVXNlcnMvYW5keS9Qcm9qZWN0cy9zcGF0aWFsL3NyYy9saWIvUXVhZFRyZWUuanMiLCIvVXNlcnMvYW5keS9Qcm9qZWN0cy9zcGF0aWFsL3NyYy9tb2RlbHMvRW50aXR5LmpzIiwiL1VzZXJzL2FuZHkvUHJvamVjdHMvc3BhdGlhbC9zcmMvbW9kZWxzL1NoaXAuanMiLCIvVXNlcnMvYW5keS9Qcm9qZWN0cy9zcGF0aWFsL3NyYy9tb2RlbHMvU3BoZXJlLmpzIiwiL1VzZXJzL2FuZHkvUHJvamVjdHMvc3BhdGlhbC9zcmMvc3RhdGVzL0Jvb3QuanMiLCIvVXNlcnMvYW5keS9Qcm9qZWN0cy9zcGF0aWFsL3NyYy9zdGF0ZXMvSW50cm8uanMiLCIvVXNlcnMvYW5keS9Qcm9qZWN0cy9zcGF0aWFsL3NyYy9zdGF0ZXMvUHJlbG9hZC5qcyIsIi9Vc2Vycy9hbmR5L1Byb2plY3RzL3NwYXRpYWwvc3JjL3N0YXRlcy9SdW5RdWFkVHJlZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7dUJDRWlCLFlBQVk7Ozs7MEJBQ1osZUFBZTs7Ozs2QkFDWixrQkFBa0I7Ozs7MkJBQ3BCLGdCQUFnQjs7OztpQ0FDVixzQkFBc0I7Ozs7QUFOOUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBUS9FLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sMEJBQU8sQ0FBQztBQUM3QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcs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QUNuQyxPQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7OztBQUluQyxPQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQUFBQyxDQUFDLENBQUM7O0FBRXZFLE9BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDOUIsUUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDL0IsUUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUM7QUFDL0IsUUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUM3QixRQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQzdCOztBQUVELE9BQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQyxPQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7Ozs7QUFJMUMsT0FBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztBQUM5QixPQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDOzs7O0FBSTlCLE9BQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDZixRQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2QsUUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxNQUFNLElBQUksSUFB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LE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0FBQ25DLFdBQU07QUFBQSxJQUNQO0dBQ0Q7OztTQUVNLGlCQUFDLEtBQUssRUFBRTtBQUNkLFdBQU8sS0FBSyxDQUFDLE9BQU87QUFDbkIsU0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUs7QUFDekIsU0FBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQ2hDLFdBQU07QUFBQSxBQUNQLFNBQUssTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO0FBQ3hCLFNBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUMvQixXQUFNO0FBQUEsQUFDUCxTQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN0QixTQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzNCLFdBQU07QUFBQSxBQUNQLFNBQUssTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJO0FBQ3hCLFNBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNsQyxXQUFNO0FBQUEsSUFDTjtHQUNGOzs7U0FFUyxvQkFBQyxLQUFLLEVBQUUsRUFDakI7OztRQXBKbUIsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGdhbWUgPSBuZXcgUGhhc2VyLkdhbWUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCwgUGhhc2VyLkFVVE8pO1xuXG5pbXBvcnQgTWF0aCBmcm9tICcuL2xpYi9NYXRoJztcbmltcG9ydCBCb290IGZyb20gJy4vc3RhdGVzL0Jvb3QnO1xuaW1wb3J0IFByZWxvYWQgZnJvbSAnLi9zdGF0ZXMvUHJlbG9hZCc7XG5pbXBvcnQgSW50cm8gZnJvbSAnLi9zdGF0ZXMvSW50cm8nO1xuaW1wb3J0IFJ1blF1YWRUcmVlIGZyb20gJy4vc3RhdGVzL1J1blF1YWRUcmVlJztcblxuZ2FtZS5zdGF0ZS5hZGQoJ2Jvb3QnLCBCb290KTtcbmdhbWUuc3RhdGUuYWRkKCdwcmVsb2FkJywgUHJlbG9hZCk7XG5nYW1lLnN0YXRlLmFkZCgnaW50cm8nLCBJbnRybyk7XG5nYW1lLnN0YXRlLmFkZCgncnVuLXF1YWQtdHJlZScsIFJ1blF1YWRUcmVlKTtcbmdhbWUuc3RhdGUuc3RhcnQoJ2Jvb3QnKTsiLCJNYXRoLnJhbmRvbUludCA9IChtaW4sIG1heCA9IG51bGwpID0+IHtcblx0aWYgKG1heCA9PSBudWxsKSB7IG1heCA9IG1pbjsgbWluID0gMDt9XG5cdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG59XG5cbk1hdGguZGlzdGFuY2UgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcblx0cmV0dXJuIE1hdGguYWJzKHgxLXgyKSArIE1hdGguYWJzKHkxLXkyKTtcbn1cblxuTWF0aC5ub3JtYWxpemUgPSAodmFsLCBtaW4sIG1heCkgPT4ge1xuXHRyZXR1cm4gKHZhbCAtIG1pbikgLyAobWF4IC0gbWluKTtcbn1cblxuTWF0aC5jb21wYXJlID0gKGEsIGIpID0+IHtcblx0cmV0dXJuIGEgPCBiID8gLTEgOiBiIDwgYSA/IDEgOiAwO1xufVxuXG5NYXRoLmludGVyc2VjdHMgPSAoYSwgYikgPT4ge1xuXHRyZXR1cm4gYS54MSA8IGIueDIgJiYgYS54MiA+IGIueDEgJiZcblx0ICAgICAgIGEueTEgPCBiLnkyICYmIGEueTIgPiBiLnkxO1xufSIsImNvbnN0IExFQUYgPSAxO1xuY29uc3QgUVVBRCA9IDI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1YWRUcmVlIHtcblx0Y29uc3RydWN0b3IoYmJveCwgY2FwYWNpdHkgPSA0LCBkZXB0aD0wLCBtYXhEZXB0aD01KSB7XG5cdFx0dGhpcy50eXBlID0gTEVBRjtcblx0XHR0aGlzLmNhcGFjaXR5ID0gY2FwYWNpdHk7XG5cblx0XHR0aGlzLmRlcHRoID0gZGVwdGg7XG5cdFx0dGhpcy5tYXhEZXB0aCA9IG1heERlcHRoO1xuXG5cdFx0dGhpcy5iYm94ID0gYmJveDtcblx0XHR0aGlzLnBvcHVsYXRpb24gPSAwO1xuXHRcdHRoaXMub2JqZWN0cyA9IFtdO1xuXG5cdFx0dGhpcy5ub3J0aHdlc3QgPSBudWxsO1xuXHRcdHRoaXMubm9ydGhlYXN0ID0gbnVsbDtcblx0XHR0aGlzLnNvdXRod2VzdCA9IG51bGw7XG5cdFx0dGhpcy5zb3V0aGVhc3QgPSBudWxsO1xuXHR9XG5cblx0Z2V0UG9zc2libGVDb2xsaXNpb25zKHJlcyA9IFtdKSB7XG5cdFx0aWYgKHRoaXMudHlwZSA9PSBMRUFGKSB7XG5cdFx0XHRmb3IgKGxldCBpPTA7IGk8dGhpcy5vYmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IGEgPSB0aGlzLm9iamVjdHNbaV07XG5cdFx0XHRcdGZvciAobGV0IGo9aSsxOyBqPHRoaXMub2JqZWN0cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGNvbnN0IGIgPSB0aGlzLm9iamVjdHNbal07XG5cdFx0XHRcdFx0aWYgKE1hdGguaW50ZXJzZWN0cyhhLCBiKSkge1xuXHRcdFx0XHRcdFx0cmVzLnB1c2goW2EsIGIsIHRoaXMuYmJveF0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gXG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLm5vcnRod2VzdC5nZXRQb3NzaWJsZUNvbGxpc2lvbnMocmVzKTtcblx0XHRcdHRoaXMubm9ydGhlYXN0LmdldFBvc3NpYmxlQ29sbGlzaW9ucyhyZXMpO1xuXHRcdFx0dGhpcy5zb3V0aHdlc3QuZ2V0UG9zc2libGVDb2xsaXNpb25zKHJlcyk7XG5cdFx0XHR0aGlzLnNvdXRoZWFzdC5nZXRQb3NzaWJsZUNvbGxpc2lvbnMocmVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlcztcblx0fVxuXG5cdHRyYXZlcnNlKGNhbGxiYWNrKSB7XG5cdFx0Y2FsbGJhY2sodGhpcyk7XG5cdFx0aWYgKHRoaXMudHlwZSA9PT0gUVVBRCkge1xuXHRcdFx0dGhpcy5ub3J0aHdlc3QudHJhdmVyc2UoY2FsbGJhY2spO1xuXHRcdFx0dGhpcy5ub3J0aGVhc3QudHJhdmVyc2UoY2FsbGJhY2spO1xuXHRcdFx0dGhpcy5zb3V0aHdlc3QudHJhdmVyc2UoY2FsbGJhY2spO1xuXHRcdFx0dGhpcy5zb3V0aGVhc3QudHJhdmVyc2UoY2FsbGJhY2spO1xuXHRcdH1cblx0fVxuXG5cdGluc2VydChvYmopIHtcblx0XHQvLyBkbyBub3RoaW5nIGlmIG9iaiBub3QgaW4gYmJveFxuXHRcdGlmICghTWF0aC5pbnRlcnNlY3RzKHRoaXMuYmJveCwgb2JqKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHRoaXMucG9wdWxhdGlvbisrO1xuXG5cdFx0Ly8gcHVzaCBvYmplY3Qgb250byBhcnJheSBpZiB0aGVyZSBpcyByb29tIG9yIGF0IG1heCBkZXB0aFxuXG5cdFx0aWYgKHRoaXMucG9wdWxhdGlvbiA8IHRoaXMuY2FwYWNpdHkgfHwgdGhpcy5kZXB0aCA+PSB0aGlzLm1heERlcHRoKSB7XG5cdFx0XHR0aGlzLm9iamVjdHMucHVzaChvYmopO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gc3ViZGl2aWRlIGlmIGxlYWYgbm9kZVxuXHRcdGlmICh0aGlzLnR5cGUgPT09IExFQUYpIHtcblx0XHRcdHRoaXMuc3ViZGl2aWRlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gcHVzaCB0aGUgbmV3IG9iamVjdCBvbnRvIGFsbCBzdWJ0cmVlc1xuXHRcdHRoaXMubm9ydGh3ZXN0Lmluc2VydChvYmopO1xuXHRcdHRoaXMubm9ydGhlYXN0Lmluc2VydChvYmopO1xuXHRcdHRoaXMuc291dGh3ZXN0Lmluc2VydChvYmopO1xuXHRcdHRoaXMuc291dGhlYXN0Lmluc2VydChvYmopO1xuXG5cdFx0cmV0dXJuIHRydWU7XG5cblx0fVxuXG5cdHN1YmRpdmlkZSgpIHtcblx0XHRjb25zdCB4MSA9IHRoaXMuYmJveC54MTtcblx0XHRjb25zdCB4MiA9IHRoaXMuYmJveC54Mjtcblx0XHRjb25zdCB5MSA9IHRoaXMuYmJveC55MTtcblx0XHRjb25zdCB5MiA9IHRoaXMuYmJveC55MjtcblxuXHRcdGNvbnN0IHcgPSB4MiAtIHgxO1xuXHRcdGNvbnN0IGggPSB5MiAtIHkxO1xuXG5cdFx0Y29uc3QgbncgPSB7XG5cdFx0XHR4MTogeDEsIFxuXHRcdFx0eTE6IHkxLCBcblx0XHRcdHgyOiB4MSArIHcvMixcblx0XHRcdHkyOiB5MSArIGgvMiBcblx0XHR9XG5cblx0XHR0aGlzLm5vcnRod2VzdCA9IG5ldyBRdWFkVHJlZShudywgdGhpcy5jYXBhY2l0eSwgdGhpcy5kZXB0aCsxLCB0aGlzLm1heERlcHRoKTtcblxuXHRcdGNvbnN0IG5lID0ge1xuXHRcdFx0eDE6IHgxICsgdy8yLFxuXHRcdFx0eTE6IHkxLFxuXHRcdFx0eDI6IHgyLFxuXHRcdFx0eTI6IHkxICsgaC8yXG5cdFx0fSBcblxuXHRcdHRoaXMubm9ydGhlYXN0ID0gbmV3IFF1YWRUcmVlKG5lLCB0aGlzLmNhcGFjaXR5LCB0aGlzLmRlcHRoKzEsIHRoaXMubWF4RGVwdGgpO1xuXG5cdFx0Y29uc3Qgc3cgPSB7XG5cdFx0XHR4MTogeDEsXG5cdFx0XHR5MTogeTEgKyBoLzIsXG5cdFx0XHR4MjogeDEgKyB3LzIsXG5cdFx0XHR5MjogeTJcblx0XHR9XG5cblx0XHR0aGlzLnNvdXRod2VzdCA9IG5ldyBRdWFkVHJlZShzdywgdGhpcy5jYXBhY2l0eSwgdGhpcy5kZXB0aCsxLCB0aGlzLm1heERlcHRoKTtcblxuXHRcdGNvbnN0IHNlID0ge1xuXHRcdFx0eDE6IHgxICsgdy8yLFxuXHRcdFx0eTE6IHkxICsgaC8yLFxuXHRcdFx0eDI6IHgyLFxuXHRcdFx0eTI6IHkyXG5cdFx0fVxuXG5cdFx0dGhpcy5zb3V0aGVhc3QgPSBuZXcgUXVhZFRyZWUoc2UsIHRoaXMuY2FwYWNpdHksIHRoaXMuZGVwdGgrMSwgdGhpcy5tYXhEZXB0aCk7XG5cblx0XHQvLyByZWRpc3RyaWJ1dGUgb2JqZWN0cyB0byBuZXcgcXVhZHJhbnRzXG5cblx0XHRmb3IgKGxldCBpPTA7IGk8dGhpcy5vYmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBvYmogPSB0aGlzLm9iamVjdHNbaV07XG5cdFx0XHR0aGlzLm5vcnRod2VzdC5pbnNlcnQob2JqKTtcblx0XHRcdHRoaXMubm9ydGhlYXN0Lmluc2VydChvYmopO1xuXHRcdFx0dGhpcy5zb3V0aHdlc3QuaW5zZXJ0KG9iaik7XG5cdFx0XHR0aGlzLnNvdXRoZWFzdC5pbnNlcnQob2JqKTtcblx0XHR9XG5cblx0XHR0aGlzLnR5cGUgPSBRVUFEO1xuXHR9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBFbnRpdHkge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0aWYgKCF0aGlzLl9yZWdpc3RlcmVkKSB7XG5cdFx0XHRpZiAoIXRoaXMuY29uc3RydWN0b3IuX2luaXRhbGl6ZWQpIHtcblx0XHRcdFx0dGhpcy5jb25zdHJ1Y3Rvci5faW5pdGlhbGl6ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBpZCA9IHRoaXMuY29uc3RydWN0b3IuaW5zdGFuY2VzLmFsbC5sZW5ndGg7XG5cblx0XHRcdHRoaXMuX2lkID0gaWQ7XG5cdFx0XHR0aGlzLnVpZCA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICc6JyArIHRoaXMuX2lkO1xuXHRcdFx0dGhpcy5jb25zdHJ1Y3Rvci5pbnN0YW5jZXMuYWxsLnB1c2godGhpcyk7XG5cdFx0XHR0aGlzLmNvbnN0cnVjdG9yLmluc3RhbmNlcy5saXZlLnB1c2godGhpcyk7XG5cdFx0XHR0aGlzLmNvbnN0cnVjdG9yLmluc3RhbmNlcy5pbmRleFtpZF0gPSB0cnVlO1xuXHRcdFx0dGhpcy5fcmVnaXN0ZXJlZCA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0ZGlzcG9zZSgpIHtcblx0XHR0aGlzLmNvbnN0cnVjdG9yLl9kaXNwb3NlKHRoaXMuX2lkKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUob3B0aW9ucykge1xuXHRcdGlmICghdGhpcy5faW5pdGFsaXplZCkge1xuXHRcdFx0dGhpcy5faW5pdGlhbGl6ZSgpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pbnN0YW5jZXMuZnJlZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBpZCA9IHRoaXMuaW5zdGFuY2VzLmZyZWUucG9wKCk7XG5cdFx0XHRjb25zdCBpbnN0YW5jZSA9IHRoaXMuaW5zdGFuY2VzLmFsbFtpZF07XG5cdFx0XHR0aGlzLmluc3RhbmNlcy5pbmRleFtpZF0gPSB0cnVlO1xuXHRcdFx0dGhpcy5pbnN0YW5jZXMuZGlydHkgPSB0cnVlO1xuXHRcdFx0dGhpcy5jYWxsKGluc3RhbmNlKTtcblx0XHR9XG5cblx0XHRlbHNlIHtcblx0XHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zKTtcblx0XHR9XG5cdH1cblxuXHQvLyB5aWVsZCBhbGwgbm9uLWRpc3Bvc2VkIGluc3RhbmNlc1xuXHRzdGF0aWMgYWxsKCkge1xuXHRcdGlmICh0aGlzLmluc3RhbmNlcy5kaXJ0eSkge1xuXHRcdFx0dGhpcy5fcmVidWlsZExpdmVJbnN0YW5jZXMoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2VzLmxpdmU7XG5cdH1cblxuXHRzdGF0aWMgYnlJZChpZCkge1xuXHRcdHJldHVybiB0aGlzLmluc3RhbmNlcy5hbGxbaWRdO1xuXHR9XG5cblx0Ly8gcHJpdmF0ZVxuXG5cdHN0YXRpYyBfcmVidWlsZExpdmVJbnN0YW5jZXMoKSB7XG5cdFx0Y29uc3QgbGl2ZSA9IHRoaXMuaW5zdGFuY2VzLmxpdmU7XG5cdFx0Y29uc3QgYWxsID0gdGhpcy5pbnN0YW5jZXMuYWxsO1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5pbnN0YW5jZXMuaW5kZXg7XG5cblx0XHRsaXZlLmxlbmd0aCA9IDA7XG5cblx0XHRmb3IgKGxldCBpPTAsIGlpPWFsbC5sZW5ndGg7IGk8aWk7IGkrKykge1xuXHRcdFx0aWYgKGluZGV4W2ldKSB7XG5cdFx0XHRcdGxpdmUucHVzaChhbGxbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuaW5zdGFuY2VzLmRpcnR5ID0gZmFsc2U7XG5cblx0fVxuXG5cdHN0YXRpYyBfZGlzcG9zZShpZCkge1xuXHRcdHRoaXMuaW5zdGFuY2VzLmZyZWUucHVzaChpZCk7XG5cdFx0dGhpcy5pbnN0YW5jZXMuaW5kZXhbaWRdID0gZmFsc2U7XG5cdFx0dGhpcy5pbnN0YW5jZXMuZGlydHkgPSB0cnVlO1xuXHR9XG5cblx0c3RhdGljIF9pbml0aWFsaXplKCkge1xuXHRcdHRoaXMuaW5zdGFuY2VzID0ge1xuXHRcdFx0YWxsOiBbXSxcblx0XHRcdGxpdmU6IFtdLFxuXHRcdFx0ZnJlZTogW10sXG5cdFx0XHRpbmRleDoge30sXG5cdFx0XHRkaXJ0eTogZmFsc2Vcblx0XHR9XG5cdFx0dGhpcy5faW5pdGFsaXplZCA9IHRydWU7XG5cdH1cblxufSIsImltcG9ydCBFbnRpdHkgZnJvbSAnLi9FbnRpdHknO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGlwIGV4dGVuZHMgRW50aXR5IHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucykge1xuXHRcdHN1cGVyKG9wdGlvbnMpO1xuXHRcdHRoaXMueCA9IG9wdGlvbnMueCB8fCAwO1xuXHRcdHRoaXMueSA9IG9wdGlvbnMueSB8fCAwO1xuXHRcdHRoaXMudnggPSBvcHRpb25zLnZ4IHx8IDA7XG5cdFx0dGhpcy52eSA9IG9wdGlvbnMudnkgfHwgMDtcblx0XHR0aGlzLmF4ID0gb3B0aW9ucy5heCB8fCAwO1xuXHRcdHRoaXMuYXkgPSBvcHRpb25zLmF5IHx8IDA7XG5cdFx0dGhpcy5tYXNzID0gb3B0aW9ucy5tYXNzIHx8IDE7XG5cdFx0dGhpcy50aHJ1c3QgPSAxMjAwO1xuXHRcdHRoaXMucm90YXRpb24gPSBvcHRpb25zLmFuZ2xlIHx8IDA7XG5cdFx0dGhpcy5mcmljdGlvbiA9IDA7XG5cdFx0dGhpcy50b3BTcGVlZCA9IDYwMDtcblxuXHRcdHRoaXMucm90YXRpb25TcGVlZCA9IDEwO1xuXHRcdHRoaXMuZm9yY2UgPSAwO1xuXG5cdFx0dGhpcy5kciA9IDA7XG5cdFx0dGhpcy5meCA9IDA7XG5cdFx0dGhpcy5meSA9IDA7IFxuXHR9XG5cblx0cm90YXRlKGFtb3VudCkge1xuXHRcdHRoaXMuZHIgKz0gYW1vdW50ICogdGhpcy5yb3RhdGlvblNwZWVkO1xuXHR9XG5cblx0c3RhcnRSaWdodFJvdGF0aW9uKCkge1xuXHRcdHRoaXMuZHIgPSAxO1xuXHR9XG5cblx0c3RvcFJpZ2h0Um90YXRpb24oKSB7XG5cdFx0dGhpcy5kciA9IDA7XG5cdH1cblxuXHRzdGFydExlZnRSb3RhdGlvbigpIHtcblx0XHR0aGlzLmRyID0gLTE7XG5cdH1cblxuXHRzdG9wTGVmdFJvdGF0aW9uKCkge1xuXHRcdHRoaXMuZHIgPSAwO1xuXHR9XG5cblx0c3RhcnRUaHJ1c3RlcigpIHtcblx0XHR0aGlzLmZvcmNlID0gdGhpcy50aHJ1c3Q7XG5cdH1cblxuXHRzdG9wVGhydXN0ZXIoKSB7XG5cdFx0dGhpcy5mb3JjZSAtPSB0aGlzLnRocnVzdDtcblx0fVxuXG5cdHN0YXJ0UmV2ZXJzZVRocnVzdGVyKCkge1xuXHRcdHRoaXMuZm9yY2UgPSAtdGhpcy50aHJ1c3Q7XG5cdH1cblxuXHRzdG9wUmV2ZXJzZVRocnVzdGVyKCkge1xuXHRcdHRoaXMuZm9yY2UgKz0gdGhpcy50aHJ1c3Q7XG5cdH1cblxuXHR1cGRhdGUoZ2FtZSkge1xuXHRcdGNvbnN0IGRlbHRhVGltZSA9IGdhbWUudGltZS5waHlzaWNzRWxhcHNlZDtcblxuXHRcdC8vIGFwcGx5IHJvdGF0aW9uXG5cblx0XHRpZiAodGhpcy5kcikge1xuXHRcdFx0dGhpcy5yb3RhdGlvbiArPSB0aGlzLmRyICogdGhpcy5yb3RhdGlvblNwZWVkICogZGVsdGFUaW1lO1xuXHRcdH1cblxuXHRcdC8vIGFwcGx5IGZvcmNlXG5cblx0XHRpZiAodGhpcy5mb3JjZSkge1xuXHRcdFx0Y29uc3QgZnggPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKSAqIHRoaXMudGhydXN0O1xuXHRcdFx0Y29uc3QgZnkgPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSAqIHRoaXMudGhydXN0O1x0XHRcblx0XHRcdHRoaXMuYXggPSBmeCAvIHRoaXMubWFzcztcblx0XHRcdHRoaXMuYXkgPSBmeSAvIHRoaXMubWFzcztcblx0XHR9IFxuXG5cdFx0ZWxzZSB7XG5cdFx0XHR0aGlzLmF4ID0gMDtcblx0XHRcdHRoaXMuYXkgPSAwO1xuXHRcdH1cblxuXHRcdC8vIHVwZGF0ZSB2ZWxvY2l0eSBcblxuXHRcdHRoaXMudnggKz0gdGhpcy5heCAqIGRlbHRhVGltZTtcblx0XHR0aGlzLnZ5ICs9IHRoaXMuYXkgKiBkZWx0YVRpbWU7XG5cblx0XHQvLyBhcHBseSBmcmljdGlvblxuXG5cdFx0dGhpcy52eCAtPSB0aGlzLnZ4ICogdGhpcy5mcmljdGlvbjtcblx0XHR0aGlzLnZ5IC09IHRoaXMudnkgKiB0aGlzLmZyaWN0aW9uO1xuXG5cdFx0Ly8gY2FwIHNwZWVkXG5cblx0XHRjb25zdCBtYWduaXR1ZGUgPSBNYXRoLnNxcnQoKHRoaXMudnggKiB0aGlzLnZ4KSArICh0aGlzLnZ5ICogdGhpcy52eSkpO1xuXG5cdFx0aWYgKG1hZ25pdHVkZSA+IHRoaXMudG9wU3BlZWQpIHtcblx0XHRcdGNvbnN0IG54ID0gdGhpcy52eCAvIG1hZ25pdHVkZTtcblx0XHRcdGNvbnN0IG55ID0gdGhpcy52eSAvIG1hZ25pdHVkZTtcblx0XHRcdHRoaXMudnggPSBueCAqIHRoaXMudG9wU3BlZWQ7XG5cdFx0XHR0aGlzLnZ5ID0gbnkgKiB0aGlzLnRvcFNwZWVkO1xuXHRcdH1cblxuXHRcdHRoaXMudnggPSBNYXRoLm1pbih0aGlzLnZ4LCB0aGlzLnRvcFNwZWVkKTtcblx0XHR0aGlzLnZ5ID0gTWF0aC5taW4odGhpcy52eSwgdGhpcy50b3BTcGVlZClcblxuXHRcdC8vIHVwZGF0ZSBwb3NpdGlvblxuXG5cdFx0dGhpcy54ICs9IHRoaXMudnggKiBkZWx0YVRpbWU7XG5cdFx0dGhpcy55ICs9IHRoaXMudnkgKiBkZWx0YVRpbWU7XG5cblx0XHQvLyBjaGVjayBib3VuZHNcblxuXHRcdGlmICh0aGlzLnggPCAwKSB7XG5cdFx0XHR0aGlzLnZ4ICo9IC0xO1xuXHRcdFx0dGhpcy54ID0gMDtcblx0XHR9IGVsc2UgaWYgKHRoaXMueCA+IGdhbWUud2lkdGgpIHtcblx0XHRcdHRoaXMudnggKj0gLTE7XG5cdFx0XHR0aGlzLnggPSBnYW1lLndpZHRoO1xuXHRcdH1cbiBcblx0XHRpZiAodGhpcy55IDwgMCkge1xuXHRcdFx0dGhpcy52eSAqPSAtMTtcblx0XHRcdHRoaXMueSA9IDA7XG5cdFx0fSBlbHNlIGlmICh0aGlzLnkgPiBnYW1lLmhlaWdodCkge1xuXHRcdFx0dGhpcy52eSAqPSAtMTtcblx0XHRcdHRoaXMueSA9IGdhbWUuaGVpZ2h0O1xuXHRcdH1cblxuXHR9XG5cblx0cmVuZGVyKGdmeCkge1x0XHRcblx0XHRjb25zdCBjdHggPSBnZnguY29udGV4dDtcblx0XHRjb25zdCByYWRpdXMgPSAxMDtcblxuXHRcdGN0eC5zdHJva2VTdHlsZT1cIiNDQ0NDQ0NcIjtcblx0XHRjdHguZmlsbFN0eWxlPVwiI0NDMzMzM1wiO1xuXHRcdGN0eC5zYXZlKCk7XG5cdFx0Y3R4LmJlZ2luUGF0aCgpO1xuXHRcdGN0eC50cmFuc2xhdGUodGhpcy54LCB0aGlzLnkpO1xuXHRcdGN0eC5yb3RhdGUodGhpcy5yb3RhdGlvbik7XG5cdFx0Y3R4Lm1vdmVUbygtcmFkaXVzICogMS41LCAtcmFkaXVzKTtcblx0XHRjdHgubGluZVRvKHJhZGl1cyAqIDEuNSwgMCk7XG5cdFx0Y3R4LmxpbmVUbygtcmFkaXVzICogMS41LCByYWRpdXMpO1xuXHRcdC8vIGN0eC5saW5lVG8odGhpcy54IC0gcmFkaXVzLCB0aGlzLnktcmFkaXVzKTtcblx0XHRjdHguY2xvc2VQYXRoKCk7XG5cdFx0Ly8gY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuXHRcdC8vIGN0eC5maWxsUmVjdCh0aGlzLnggLSAxMCwgdGhpcy55IC0gMTAsIDIwLCAyMCk7XG5cdFx0Y3R4LnN0cm9rZSgpO1xuXHRcdGN0eC5maWxsKCk7XG5cdFx0Y3R4LnJlc3RvcmUoKTtcblx0XHQvLyBjdHguY2xvc2VQYXRoKCk7XG5cblx0XHQvLyBjdHguYmVnaW5QYXRoKCk7XG5cdFx0Ly8gY3R4Lm1vdmVUbyh0aGlzLngsIHRoaXMueSk7XG5cdFx0Ly8gY3R4LmxpbmVUbyhNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKSAqIDIwICsgdGhpcy54LFxuXHRcdC8vIFx0ICAgICAgICAgTWF0aC5zaW4odGhpcy5yb3RhdGlvbikgKiAyMCArIHRoaXMueSk7XG5cdFx0Ly8gY3R4LmNsb3NlUGF0aCgpO1xuXHRcdC8vIGN0eC5zdHJva2UoKTtcblxuXHRcdGN0eC5mb250ID0gXCIxNHB4IEFyaWFsXCI7XG5cdFx0bGV0IHkgPSAxNDtcblx0XHRbJ3gnLCAneScsICd2eCcsICd2eScsICdheCcsICdheSddLmZvckVhY2goKHByb3ApID0+IHtcblx0XHRcdGN0eC5maWxsVGV4dChwcm9wICsgXCI6IFwiICsgdGhpc1twcm9wXSwgODQwLCB5KTtcblx0XHRcdHkgKz0gMTY7XG5cdFx0fSk7XG5cblx0fVxufSIsImltcG9ydCBFbnRpdHkgZnJvbSAnLi9FbnRpdHknO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGhlcmUgZXh0ZW5kcyBFbnRpdHkge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG5cdFx0c3VwZXIob3B0aW9ucyk7XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnMpIHtcblx0XHRyZXR1cm4gc3VwZXIuY3JlYXRlKG9wdGlvbnMpO1xuXHR9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBCb290IHtcblx0cHJlbG9hZCgpIHtcblx0fVxuXG5cdGNyZWF0ZSgpIHtcblx0XHRjb25zb2xlLmxvZygnYm9vdCcpO1xuXHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgncHJlbG9hZCcpO1xuXHR9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRybyB7XG5cdHByZWxvYWQoKSB7XG5cdH1cblxuXHRjcmVhdGUoKSB7XG5cdFx0Y29uc29sZS5sb2coJ2ludHJvJyk7XG5cdFx0bGV0IHN0eWxlID0geyBmb250OiBcIjMycHggbW9ub3NwYWNlXCIsIGZpbGw6IFwiI2ZmZlwifTtcblx0XHR0aGlzLmdhbWUuYWRkLnRleHQoMjMwLCAyMDAsICdTcGF0aWFsJywgc3R5bGUpO1xuXHRcdHRoaXMuZ2FtZS5zdGF0ZS5zdGFydCgncnVuLXF1YWQtdHJlZScpO1xuXHR9XG5cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBQcmVsb2FkIHtcblx0cHJlbG9hZCgpIHtcblxuXHR9XG5cblx0Y3JlYXRlKCkge1xuXHRcdGNvbnNvbGUubG9nKCdwcmVsb2FkJyk7XG5cdFx0dGhpcy5nYW1lLnN0YXRlLnN0YXJ0KCdpbnRybycpO1xuXHR9XG59IiwiaW1wb3J0IFF1YWRUcmVlIGZyb20gJy4uL2xpYi9RdWFkVHJlZSc7XG5pbXBvcnQgRW50aXR5IGZyb20gJy4uL21vZGVscy9FbnRpdHknO1xuaW1wb3J0IFNwaGVyZSBmcm9tICcuLi9tb2RlbHMvU3BoZXJlJztcbmltcG9ydCBTaGlwIGZyb20gJy4uL21vZGVscy9TaGlwJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUnVuUXVhZFRyZWUge1xuXG5cdGNyZWF0ZSgpIHtcblx0XHR0aGlzLmdmeCA9IHRoaXMuZ2FtZS5hZGQuYml0bWFwRGF0YSh0aGlzLmdhbWUud2lkdGgsIHRoaXMuZ2FtZS5oZWlnaHQpO1xuXHRcdHRoaXMuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIHRoaXMuZ2Z4KTtcblx0XHR3aW5kb3cucXQgPSB0aGlzLnF1YWRUcmVlID0gbmV3IFF1YWRUcmVlKHtcblx0XHRcdHgxOiAwLFxuXHRcdFx0eTE6IDAsXG5cdFx0XHR4MjogdGhpcy5nYW1lLndpZHRoLFxuXHRcdFx0eTI6IHRoaXMuZ2FtZS5oZWlnaHRcblx0XHR9KTtcblxuXHRcdHRoaXMuYmFsbHMgPSBbXTtcblxuXHRcdHdpbmRvdy5wbGF5ZXIgPSB0aGlzLnBsYXllciA9IFNoaXAuY3JlYXRlKHtcblx0XHRcdHg6IHRoaXMuZ2FtZS53aWR0aCAvIDIsXG5cdFx0XHR5OiB0aGlzLmdhbWUuaGVpZ2h0IC8gMlxuXHRcdH0pO1xuXG5cdFx0dGhpcy5nYW1lLmlucHV0LmtleWJvYXJkLmFkZENhbGxiYWNrcyhcblx0XHRcdHRoaXMsXG5cdFx0XHR0aGlzLm9uS2V5RG93bixcblx0XHRcdHRoaXMub25LZXlVcCxcblx0XHRcdHRoaXMub25LZXlQcmVzc1xuXHRcdClcblxuXHRcdHdpbmRvdy5FbnRpdHkgPSBFbnRpdHk7XG5cdFx0d2luZG93LlNwaGVyZSA9IFNwaGVyZTtcblxuXG5cdFx0Ly8gd2luZG93LnMxID0gU3BoZXJlLmNyZWF0ZSh7eDowLCB5OjAsIHI6IDF9KTtcblx0XHQvLyB3aW5kb3cuczIgPSBTcGhlcmUuY3JlYXRlKHt4OjQyLCB5OjQyLCByOiAxMn0pO1xuXG5cdH1cblxuXHRhZGRCYWxsKCkge1xuXHRcdGNvbnN0IHJhZGl1cyA9IE1hdGgucmFuZG9tSW50KDgsIDMyKTtcblx0XHRjb25zdCB4ID0gTWF0aC5yYW5kb21JbnQocmFkaXVzLCB0aGlzLmdhbWUud2lkdGggLSByYWRpdXMpO1xuXHRcdGNvbnN0IHkgPSBNYXRoLnJhbmRvbUludChyYWRpdXMsIHRoaXMuZ2FtZS5oZWlnaHQgLSByYWRpdXMpO1xuXG5cdFx0Y29uc3QgYmJveCA9IHtcblx0XHRcdHgxOiB4IC0gcmFkaXVzLFxuXHRcdFx0eTE6IHkgLSByYWRpdXMsXG5cdFx0XHR4MjogeCArIHJhZGl1cyxcblx0XHRcdHkyOiB5ICsgcmFkaXVzXG5cdFx0fVxuXG5cdFx0Y29uc3QgYmFsbCA9IHtcblx0XHRcdHg6IHgsXG5cdFx0XHR5OiB5LFxuXHRcdFx0cmFkaXVzOiByYWRpdXMsXG5cdFx0XHRiYm94OiBiYm94XG5cdFx0fVxuXG5cdFx0dGhpcy5iYWxscy5wdXNoKGJhbGwpO1xuXHRcdHRoaXMucXVhZFRyZWUuaW5zZXJ0KGJhbGwuYmJveCk7XG5cblx0XHRjb25zb2xlLmxvZyh0aGlzLnF1YWRUcmVlLmdldENvbGxpc2lvbnMoKSk7XG5cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHR0aGlzLmdmeC5jbHMoKTtcblx0XHR0aGlzLnJlbmRlclF1YWRUcmVlKCk7XG5cdFx0dGhpcy5yZW5kZXJCYWxscygpO1xuXHRcdHRoaXMucmVuZGVyUGxheWVyKCk7XG5cdH1cblxuXHRyZW5kZXJCYWxscygpIHtcblx0XHRjb25zdCBnZnggPSB0aGlzLmdmeDtcblx0XHR0aGlzLmJhbGxzLmZvckVhY2goKGJhbGwpID0+IHtcblx0XHRcdGNvbnN0IHggPSBiYWxsLng7XG5cdFx0XHRjb25zdCB5ID0gYmFsbC55O1xuXHRcdFx0Y29uc3QgciA9IGJhbGwucmFkaXVzO1xuXG5cdFx0XHRnZngubGluZVN0eWxlKDEsIDB4RkZGRkZGLCAxKTtcblx0XHRcdGdmeC5iZWdpbkZpbGwoMHgzMzk5MzMpO1xuXHRcdFx0Z2Z4LmRyYXdFbGxpcHNlKFxuXHRcdFx0XHR4LCBcblx0XHRcdFx0eSwgXG5cdFx0XHRcdHIsIFxuXHRcdFx0XHRyXG5cdFx0XHQpO1xuXHRcdFx0Z2Z4LmVuZEZpbGwoKTtcblx0XHR9KTtcdFxuXHR9XG5cblx0cmVuZGVyUXVhZFRyZWUoKSB7XG5cdFx0Ly8gY29uc3QgZ2Z4ID0gdGhpcy5nZng7XG5cdFx0Ly8gdGhpcy5xdWFkVHJlZS50cmF2ZXJzZSgocXQpID0+IHtcblx0XHQvLyBcdGdmeC5saW5lU3R5bGUoMSwgMHhDQ0NDQ0MsIDEpO1xuXHRcdC8vIFx0Z2Z4LmJlZ2luRmlsbCgweDAwMDAwMCk7XG5cdFx0Ly8gXHRnZnguZHJhd1JlY3QoXG5cdFx0Ly8gXHRcdHF0LmJib3gueDEsIFxuXHRcdC8vIFx0XHRxdC5iYm94LnkxLCBcblx0XHQvLyBcdFx0cXQuYmJveC54MiAtIHF0LmJib3gueDEsIFxuXHRcdC8vIFx0XHRxdC5iYm94LnkyIC0gcXQuYmJveC55MVxuXHRcdC8vIFx0KTtcblx0XHQvLyBcdGdmeC5lbmRGaWxsKCk7XG5cdFx0Ly8gfSk7XG5cdH1cblxuXHRyZW5kZXJQbGF5ZXIoKSB7XG5cdFx0dGhpcy5wbGF5ZXIucmVuZGVyKHRoaXMuZ2Z4KTtcblx0fVxuXG5cdHVwZGF0ZSgpIHtcblx0XHR0aGlzLnBsYXllci51cGRhdGUodGhpcy5nYW1lKVxuXHR9XG5cblx0b25LZXlEb3duKGV2ZW50KSB7XG5cdFx0c3dpdGNoKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgUGhhc2VyLktleWJvYXJkLlNQQUNFOlxuXHRcdFx0XHR0aGlzLmFkZEJhbGwoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFBoYXNlci5LZXlib2FyZC5SSUdIVDpcblx0XHRcdFx0dGhpcy5wbGF5ZXIuc3RhcnRSaWdodFJvdGF0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBQaGFzZXIuS2V5Ym9hcmQuTEVGVDpcblx0XHRcdFx0dGhpcy5wbGF5ZXIuc3RhcnRMZWZ0Um90YXRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFBoYXNlci5LZXlib2FyZC5VUDpcblx0XHRcdFx0dGhpcy5wbGF5ZXIuc3RhcnRUaHJ1c3RlcigpO1xuXHRcdFx0XHRicmVhaztcdFxuXHRcdFx0Y2FzZSBQaGFzZXIuS2V5Ym9hcmQuRE9XTjpcblx0XHRcdFx0dGhpcy5wbGF5ZXIuc3RhcnRSZXZlcnNlVGhydXN0ZXIoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0b25LZXlVcChldmVudCkge1xuXHRcdHN3aXRjaChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIFBoYXNlci5LZXlib2FyZC5SSUdIVDpcblx0XHRcdFx0dGhpcy5wbGF5ZXIuc3RvcFJpZ2h0Um90YXRpb24oKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFBoYXNlci5LZXlib2FyZC5MRUZUOlxuXHRcdFx0XHR0aGlzLnBsYXllci5zdG9wTGVmdFJvdGF0aW9uKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBQaGFzZXIuS2V5Ym9hcmQuVVA6XG5cdFx0XHRcdHRoaXMucGxheWVyLnN0b3BUaHJ1c3RlcigpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgUGhhc2VyLktleWJvYXJkLkRPV046XG5cdFx0XHRcdHRoaXMucGxheWVyLnN0b3BSZXZlcnNlVGhydXN0ZXIoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdH1cblxuXHRvbktleVByZXNzKGV2ZW50KSB7XG5cdH1cblxufSJdfQ==
