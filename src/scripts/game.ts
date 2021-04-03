import 'phaser';
import BoatScene from './BoatScene';

const config = {
	type: Phaser.WEBGL,
	// backgroundColor: '#fff',
	scale: {
		parent: 'phaser-game',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		// zoom: Phaser.Scale.ZOOM_4X,
		width: 2400,
		height: 800
	},
	physics: {
		default: 'arcade',
		arcade: {
			// gravity: { y: 500 },
			debug: false
		}
	},
	scene: BoatScene
};

// This will create the phaser game object once the window finishes loading.
window.addEventListener('load', () => {
	const game = new Phaser.Game(config);
});
