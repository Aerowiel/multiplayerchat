var game = new Phaser.Game(640, 640, Phaser.AUTO, 'game');
var Game = {};

var bullets;

Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {

    game.load.tilemap('map', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('test', 'assets/map/terrain.png',32,32);
    game.load.image('sprite','assets/sprites/player.png'); // game will be the sprite of the players
    game.load.image('bullet', 'assets/sprites/bullet.png');
};

Game.create = function(){

    game.playerMap = [];

    var map = game.add.tilemap('map');
    map.addTilesetImage('test', 'test'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }
    layer.inputEnabled = true; // Allows clicking on the map
    //

    //


    Client.askNewPlayer(); // Instantiate player for game socket
    game.cursors = game.input.keyboard.createCursorKeys(); // Map up down left right arrow keys
    game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]); // Add listener on spacebar

    
    bullets = game.add.group();
	
    bullets.enableBody = true;

	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	
	bullets.createMultiple(200, 'sprite');
    
	bullets.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', Game.resetBullet);
	// Same as above, set the anchor of every sprite to 0.5, 1.0
	bullets.callAll('anchor.setTo', 'anchor', 0.5, 1.0);
 
	// game will set 'checkWorldBounds' to true on all sprites in the group
	bullets.setAll('checkWorldBounds', true); 
        //***** */
    /*/test
    test = game.add.group();
    test.enableBody = true;
    test.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < 50; i++)
    {
        var c = test.create(game.world.randomX, Math.random() * 500, 'sprite', game.rnd.integerInRange(0, 36));
        c.name = 'veg' + i;
        c.body.immovable = true;
    }*/

    
};

// heart beat function
Game.update = function(){

    //console.log(Game.playerMap);
    

    if(game.playerMap != undefined){
        game.physics.arcade.collide(game.playerMap, bullets, bulletHitPlayer, null, game);
         
        Client.reloadMyPosition();
        Client.resetMyVelocity();

        if (game.cursors.left.isDown)
        {
            Client.sendClick('left');
        }
        else if (game.cursors.right.isDown)
        {
            Client.sendClick('right');
        }

        if (game.cursors.up.isDown)
        {
            Client.sendClick('up');
        }
        else if (game.cursors.down.isDown)
        {
            Client.sendClick('down');
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
        {
            Client.sendFire();
            //Game.fireBullet();
        }
    
    }
    

};


function bulletHitPlayer(player,bullet){
    Game.resetBullet(bullet);
    console.log('hit ?');
}

Game.resetBullet = function (bullet) {
    console.log('bullet did hit');
	// Destroy the laser
	bullet.kill();
}

Game.fireBullet = function (id) {
	// Get the first laser that's inactive, by passing 'false' as a parameter
	var bullet = bullets.getFirstExists(false);
	if (bullet) {
        //console.log(Game.player.x + ':' + Game.player.y);
		// If we have a laser, set it to the starting position
		bullet.reset(game.playerMap[id].x +30, game.playerMap[id].y);

		// Give it a velocity of -500 so it starts shooting
		bullet.body.velocity.y = -500;
	}
}

Game.addNewPlayer = function(id,x,y){
    if(game.playerMap != undefined){
        game.playerMap[id] = game.add.sprite(x,y,'sprite');
        game.physics.arcade.enable(game.playerMap[id]);
        game.playerMap[id].body.collideWorldBounds = true;
    }
   
};

Game.removePlayer = function(id){
    game.playerMap[id].destroy();
    delete game.playerMap[id];
};

Game.movePlayer = function(id, key){
    if(game.playerMap[id] != undefined){
        if (key == 'left')
        {
            game.playerMap[id].body.velocity.x = -300;
        }
        else if (key == 'right')
        {
            game.playerMap[id].body.velocity.x = 300;
        }
        else if (key == 'up')
        {
            game.playerMap[id].body.velocity.y = -300;
        }
        else if (key == 'down')
        {
            game.playerMap[id].body.velocity.y = 300;
        }
    }
    
};

Game.resetPlayerVelocity = function(id){
    if(game.playerMap != undefined)
    {
        if(game.playerMap[id] != undefined){
            game.playerMap[id].body.velocity.set(0);
        }
    }
    
};


//game.state.start('Game');
game.state.add('Game',Game, true);