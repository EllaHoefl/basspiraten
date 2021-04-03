import 'phaser';

export default class BoatScene extends Phaser.Scene
{
	player: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	world: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
	cursor: Phaser.Types.Input.Keyboard.CursorKeys;
	constructor ()
	{
		super('boat');
	}

	preload ()
	{
		this.load.image('ship', 'assets/pirate-ship-colored-small.png');
		this.load.image('sea', 'assets/sea.png');
	}

	create ()
	{
		this.world = this.physics.add.image(0, 0, 'sea');
		// set boundaries of game world
		this.physics.world.bounds.width = this.world.width;
    this.physics.world.bounds.height = this.world.height;

		// create the player sprite
		this.player = this.physics.add.image(150, 600, 'ship');
		this.player.setBounce(0.2); // player will bounce from items
		this.player.setCollideWorldBounds(true); // don't go out of the map
    this.player.setDrag(100);
			
		this.physics.add.collider(this.world, this.player);

		// movement from left to right
		this.cursor = this.input.keyboard.createCursorKeys();
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
	}
}