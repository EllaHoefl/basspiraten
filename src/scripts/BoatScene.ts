import 'phaser';
import ChordInput from './ChordInput';
import { Chords } from './Chords';

export default class BoatScene extends Phaser.Scene
{
	player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	enemy: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	enemyHealth: number = 100;
	sea: Phaser.GameObjects.Image;
	power: Phaser.GameObjects.Sprite;
	powerLevel: number = 0;
	cursor: Phaser.Types.Input.Keyboard.CursorKeys;
	clouds: Phaser.GameObjects.TileSprite;
	cloudsSmall: Phaser.GameObjects.TileSprite;
	chordInput: ChordInput;

	constructor (scene: Phaser.Scene, x: number, y: number) {
		super('boat');
	}

	preload () {
		this.load.image('ship', 'assets/ship.png');
		this.load.image('sailing-ship', 'assets/sailing-ship.png');
		this.load.image('sea', 'assets/sea.png');
		this.load.image('clouds', 'assets/clouds.png');
		this.load.image('clouds-small', 'assets/clouds-small.png');
		this.load.image('wave', 'assets/wave.png');
		this.load.image('stone', 'assets/stone.png');
		this.load.spritesheet('power', 'assets/lightning_bolt_filled.png',
		{ frameWidth: 256, frameHeight: 512 } );
		this.load.image('lightning', 'assets/lightning.png');
	}

	create () {
		// initialize chord input and start recording
		this.chordInput = new ChordInput();
		this.chordInput.startRecording();

		// set background image
		this.sea = this.add.image(1200, 400, 'sea');

		// set boundaries of game world
		this.physics.world.bounds.width = this.sea.width;
		this.physics.world.bounds.height = this.sea.height;
		this.physics.world.bounds.top = 300;

		// create the player sprite
		this.player = this.physics.add.image(150, 600, 'ship');
		this.player.setBounce(0.2); // player will bounce from items
		this.player.setCollideWorldBounds(true); // don't go out of the map
		this.player.setDrag(100);
		this.player.setScale(0.5);
		this.player.setDepth(1);

		this.physics.add.collider(this.sea, this.player);

		// create enemy sprite
		this.enemy = this.physics.add.image(2000, 600, 'sailing-ship');
		this.enemy.setBounce(0.2); // enemy will bounce from items
		this.enemy.setCollideWorldBounds(true); // don't go out of the map
		this.enemy.setDrag(100);
		this.enemy.setDepth(3);

		this.physics.add.collider(this.sea, this.enemy);

		// create power sprite (lightning bolt)
		this.power = this.add.sprite(100, 150, 'power', 0);

		this.power.setDepth(4);
		this.power.setScale(0.4);

		// movement from left to right
		this.cursor = this.input.keyboard.createCursorKeys();

		this.clouds = this.add.tileSprite(640, 200, 3600, 400, "clouds");
		this.cloudsSmall = this.add.tileSprite(640, 200, 3600, 400, "clouds-small");

		// create waves
		const waveParticles = this.add.particles('wave');
		const waveEmitter = waveParticles.createEmitter({
			scale: 0.3,
			speedX: -300,
			lifespan: 8000,
			frequency: 800,
			maxParticles: 0,
			x: 2400,
			y: { min: 450, max: 800},
		});

		// create stones
		const stoneParticles = this.add.particles('stone');
		const stoneEmitter = stoneParticles.createEmitter({
			scale: 0.4,
			speedX: -300,
			lifespan: 8000,
			frequency: 4000,
			maxParticles: 0,
			x: 2400,
			y: { min: 450, max: 800},
		});
		// this.physics.add.collider(this.player, stoneEmitter);
	}

	update () {
		const chordsPlayed = this.chordInput.getChordPlayed();
		if (chordsPlayed !== Chords.NONE) {
			console.log(this.chordInput.getChordPlayed());
		}
		switch(chordsPlayed) {
			case Chords.C: {
				this.player.body.setAccelerationX(-150); // move left
				break;
			}
			case Chords.Am: {
				this.player.body.setAccelerationX(150); // move right
				break;
			}
			case Chords.F: {
				this.player.body.setAccelerationY(-30); // move up
				break;
			}
			case Chords.D: {
				this.player.body.setAccelerationY(30); // move down
				break;
			}
			case Chords.E: {
				this.powerLevel += 1;
				if (this.powerLevel >= 100) {
					this.powerLevel = 0;
					this.enemyHealth -= 14;
					if (this.enemyHealth <= 0) {
						this.enemy.setVisible(false);
					} else {
						const lightningBolt = this.add.image(this.enemy.x, this.enemy.y - 256, 'lightning');
						lightningBolt.setDepth(2);
						setTimeout(() => {
							lightningBolt.destroy();
						}, 600);
					}
				}
				this.power.setFrame(Math.floor(this.powerLevel / 100 * 8)); // changes frame when using power
				break;
			}
			default: {
				this.player.body.setAccelerationX(0);
				this.player.body.setAccelerationY(0);
			}
		}
		this.clouds.tilePositionX += 0.5;
		this.cloudsSmall.tilePositionX += 0.25;

		if (!this.player)
		{
			return;
		}
		// player position
		const playerPositionX = this.player.x
		const playerPositionY = this.player.y

		if (this.enemyHealth > 0) {
			// enemy position
			const enemyPositionX = this.enemy.x
			const enemyPositionY = this.enemy.y

			if (enemyPositionX > playerPositionX) {
				this.enemy.body.setAccelerationX(-30);
			} else {
				this.enemy.body.setAccelerationX(30);
			}
			this.enemy.tint = 0xff0000 + 
				0x00ff00 * this.enemyHealth / 100 +
				0x0000ff * this.enemyHealth / 100;
		}

	}
}