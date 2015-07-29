let game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO);

import Math from './lib/Math';
import Boot from './states/Boot';
import Preload from './states/Preload';
import Intro from './states/Intro';
import RunQuadTree from './states/RunQuadTree';

game.state.add('boot', Boot);
game.state.add('preload', Preload);
game.state.add('intro', Intro);
game.state.add('run-quad-tree', RunQuadTree);
game.state.start('boot');