import 'phaser';

export default class BoatScene extends Phaser.Scene
{
	player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	sea: Phaser.GameObjects.Image;
	cursor: Phaser.Types.Input.Keyboard.CursorKeys;
	clouds: Phaser.GameObjects.TileSprite;
	cloudsSmall: Phaser.GameObjects.TileSprite;
	constructor ()
	{
		super('boat');
	}

	preload ()
	{
		this.load.image('ship', 'assets/pirate-ship-colored-small.png');
		this.load.image('sea', 'assets/sea.png');
		this.load.image('clouds', 'assets/clouds.png');
		this.load.image('clouds-small', 'assets/clouds-small.png');
		this.load.image('wave', 'assets/wave.png');
	}

	create ()
	{
		this.sea = this.add.image(1200, 400, 'sea');

		// set boundaries of game world
		this.physics.world.bounds.width = this.sea.width;
    this.physics.world.bounds.height = this.sea.height;

		// create the player sprite
		this.player = this.physics.add.image(150, 600, 'ship');
		this.player.setBounce(0.2); // player will bounce from items
		this.player.setCollideWorldBounds(true); // don't go out of the map
    this.player.setDrag(100);
			
		this.physics.add.collider(this.sea, this.player);

		// movement from left to right
		this.cursor = this.input.keyboard.createCursorKeys();

    this.clouds = this.add.tileSprite(640, 200, 3600, 400, "clouds");
    this.cloudsSmall = this.add.tileSprite(640, 200, 3600, 400, "clouds-small");

    const particles = this.add.particles('wave');

    const emitter = particles.createEmitter({
      scale: 0.3,
      speedX: -300,
      lifespan: 8000,
      frequency: 800,
      maxParticles: 0,
      x: 2400,
      y: { min: 450, max: 800},
    });
	}

	update ()
	{ 
		if (this.cursor.left.isDown) // if the left arrow key is down
    {
        this.player.body.setAccelerationX(-300); // move left
    }
    else if (this.cursor.right.isDown) // if the right arrow key is down
    {
        this.player.body.setAccelerationX(300); // move right
    }
    else {
      this.player.body.setAccelerationX(0);
    }
    this.clouds.tilePositionX += 0.5;
    this.cloudsSmall.tilePositionX += 0.25;
	}
}