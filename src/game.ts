import 'phaser';
import BoatScene from './BoatScene';

const config = {
	type: Phaser.WEBGL,
	// backgroundColor: '#fff',
	width: 2400,
	height: 800,
	physics: {
		default: 'arcade',
		arcade: {
			// gravity: { y: 500 },
			debug: false
		}
	},
	scene: BoatScene
};

const game = new Phaser.Game(config);