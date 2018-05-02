var Client = {};
Client.socket = io.connect();

Client.askNewPlayer = function(){
    Client.socket.emit('new_player');
};

Client.sendClick = function(key){
    Client.socket.emit('click', key);
};

Client.sendFire = function(){
    Client.socket.emit('fire');
};

Client.resetMyVelocity = function(){
    Client.socket.emit('reset_velocity');
};

Client.reloadMyPosition = function(){
    if(game.player != undefined)
    Client.socket.emit('reload_position', game.player.x, game.player.y);
};

Client.socket.on('new_player',function(data){
    Game.addNewPlayer(data.id,data.x,data.y);
});

Client.socket.on('all_players',function(data, myId){
    
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
    game.player = game.playerMap[myId];
});

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});

Client.socket.on('move',function(id, key){
    Game.movePlayer(id, key);
});

Client.socket.on('reset_velocity', function(id){
    Game.resetPlayerVelocity(id);
});

Client.socket.on('fire', function(id){
    Game.fireBullet(id);
});

