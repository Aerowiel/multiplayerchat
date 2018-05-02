// Tout d'abbord on initialise notre application avec le framework Express 
// et la bibliothèque http integrée à node.
var express = require('express');
var app = express();
//var router = express.Router();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//users array
var users = Array();
var botSpeakModel = "[Z.] : ";
var secret = "izi";
var mode = "normal";

//Cluster variables
http.lastPlayerID = 0;

//Cluster controllers
var clusterController = require('./controllers/cluster');

// On gère les requêtes HTTP des utilisateurs en leur renvoyant les fichiers du dossier 'public'
app.use("/", express.static(__dirname + "/public"));

// On lance le serveur en écoutant les connexions arrivant sur le port associé
http.listen(3001, function(){
  console.log(botSpeakModel + 'Server is listening on *:3000');
});

io.on('connection', function (socket) {
//Connexion au socket

  socket.on('new_player', function (){
    socket.activity = 'cluster';
    // We create the variable storing the player information in the user's socket
    socket.player = {
      id: http.lastPlayerID++,
      x : randomInt(100,400),
      y : randomInt(100,400)
  }

    

    console.log('new player joined : spawned at ['+socket.player.x+','+socket.player.y+']');
    socket.emit('all_players',getAllPlayers(), socket.player.id);
    socket.broadcast.emit('new_player',socket.player);

    socket.on('click',function(key){
        console.log('key received '+key);
        io.emit('move',socket.player.id, key);
    });

    socket.on('fire', function(){
      io.emit('fire', socket.player.id);
    });

    socket.on('reload_position', function(x, y){
      if(socket.player != undefined)
      reloadPosition(socket.id, x, y);
    });

    socket.on('reset_velocity', function(){
      io.emit('reset_velocity', socket.player.id);
    });

    socket.on('disconnect', function () {
        
      if(socket.activity == 'cluster'){
        io.emit('remove',socket.player.id);
      }
          
    });

  });
//***********************************************************************************************/
    

    socket.on('user-login', function (user) {
      var loggedUser;
      socket.activity = 'chat';
      var username = user.username;
      if(CanISendThisMessage(username) == false){
        user.username = "Gay Dev";
      };
      loggedUser = user;
      loggedUser.color = GiveMeRandomColor();
      loggedUser.id = socket.id;
      if(loggedUser.password == secret){
        loggedUser.rank = 'admin';
        loggedUser.username = '~~' + loggedUser.username;
      }else{
        loggedUser.rank = 'user';
      }
      users.push({ id: loggedUser.id, username: loggedUser.username, color: loggedUser.color });
      console.log(botSpeakModel + loggedUser.username + ' joined the chat, added him in the users\'s list.');
      console.log(botSpeakModel + users.length + " user(s) online ! ");
      for(var i = 0; i < users.length; i++){
        if(users[i].id != loggedUser.id)
        socket.emit('user_connected', users[i]);
      }
      io.emit('user_connected', loggedUser);



    socket.on('disconnect', function () {
    
        var disconnectedUser;
        for(var i = 0; i<users.length; i++){
          if(users[i].id == socket.id){
            disconnectedUser = users[i];
            io.emit('user_disconnected', disconnectedUser);
            users.splice(i, 1);
            console.log(botSpeakModel + disconnectedUser.username + ' disconnected, therefor I removed him from the connected list.');
          } 
        }
      });

    socket.on('chat-message', function (message) {

      if(CanISendThisMessage(message.text) == false){
        message.text = "[Deleted message] you can't use inputs here ! If you want to show an image type !show image_src";
      }
      else if(IsThatALink(message.text) == true){
        message.text = '<a target="_blank" href="'+message.text+'">'+message.text+'</a>';
      }
      else{
        var tempMessage = message.text.split(' ');
        switch(tempMessage[0]){
        
          case '!show':
            var href = message.text.replace('!show', ' ');
            href = '<a target="_blank" href="'+ href + '">';
            message.text = message.text.replace('!show','<img class="imgChat" src="');
            message.text =href + message.text + '"></a>';
            break;
          case '!clusterfuck' :
            message.text = '<script>document.location.href="/cluster";</script>';
            break;
          case '!meatspin3460' :
            message.text = '<script>document.location.href="http://www.meatspin.fr";</script>'
            break;
          case '!slide':
            if(loggedUser.rank == 'admin'){
              var text = message.text.replace('!slide','');
              message.text = "Abrakadabra";
              io.emit('change_slide_text', 'Broadcast : '+text);
            }
            break;
          case '!logo' :
            if(loggedUser.rank == 'admin'){
              if(mode == "normal"){
                io.emit('rotate_logo', 'logo logoRotateF');
                mode = "fuck";
                message.text = "Abrakadabra";

              }else if(mode == "fuck"){
                io.emit('rotate_logo', 'logo logoRotateY');
                mode = "normal";
                message.text = "Abrakadabra";

              }
            } 
            break;

        }
      }
      
    
    message.version=2;
    message.color = loggedUser.color;
    message.username = loggedUser.username;
    console.log(message.username + " : " + message.text);

    // envoie le message a tous les clients connectés
    io.emit('chat-message', message);
    
    socket.broadcast.emit('play-sound-message');
    
  });


  });

  /**
   * Réception de l'événement 'chat-message' et réémission vers tous les utilisateurs
   */
  

  
});

// Functions 

//Cluster
function reloadPosition(id, x, y){

  io.sockets.connected[id].player.x = x;
  io.sockets.connected[id].player.y = y;
  console.log('Reload');
}

function getAllPlayers(){
    var players = [];

    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

//Chat
function GiveMeRandomColor(){
  var max = 255;
  var min = 50;

  var red = Math.floor(Math.random() * (max - min)) + min;
  var green = Math.floor(Math.random() * (max - min)) + min;
  var blue = Math.floor(Math.random() * (max - min)) + min;
  var random = Math.floor(Math.random() * 2);
  switch(random){
    case 0 :
      red = 0;
      break;
    case 1 :
      green = 0;
      break;
    case 2 : 
      blue = 0;
      break;
  }
  return '('+red+','+green+','+blue+')';
}

function IsThatALink(message){
  var pattern = new RegExp('^(https?:\\/\\/)?'+ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ '((\\d{1,3}\\.){3}\\d{1,3}))'+ '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ '(\\?[;&a-z\d%_.~+=-]*)?'+ '(\\#[-a-z\d_]*)?$','i');
  if(!pattern.test(message)) {
    //alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}

function CanISendThisMessage(message){

      var rules = Array('!doctype',
                        '<!--',
                        '<applet',
                        '<area',
                        '<b',
                        '<base',
                        '<basefont',
                        '<bdo',
                        '<bgsound',
                        '<body',
                        '<button',
                        '<center',
                        '<code',
                        '<col',
                        '<colgroup',
                        '<dd',
                        '<del',
                        '<dfn',
                        '<dir',
                        '<div',
                        '<dl',
                        '<dt',
                        '<embed',
                        '<fieldset',
                        '<font',
                        '<form',
                        '<frame',
                        '<frameset',
                        '<head',
                        '<hr',
                        '<html',
                        '<iframe',
                        '<img',
                        '<input',
                        '<ins',
                        '<isindex',
                        '<label',
                        '<layer',
                        '<legend',
                        '<li',
                        '<link',
                        '<map',
                        '<marquee',
                        '<menu',
                        '<meta',
                        '<nextid',
                        '<nobr',
                        '<noembed',
                        '<noscript',
                        '<object',
                        '<ol',
                        '<option',
                        '<p',
                        '<param',
                        '<pre',
                        '<q',
                        '<s',
                        '<samp',
                        '<script',
                        '<select',
                        '<small',
                        '<span',
                        '<strike',
                        '<strong',
                        '<style',
                        '<sub',
                        '<sup',
                        '<table',
                        '<tbody',
                        '<td',
                        '<textarea',
                        '<tfoot',
                        '<th',
                        '<thead',
                        '<title',
                        '<tr',
                        '<tt',
                        '<u',
                        '<ul',
                        '<var',
                        '<wbr',
                        '<xmp',
                        '~~'
                        )
      if(message != undefined){
        message = message.toLowerCase();
      }else{
        message = "";
      }
      
      for(var i = 0; i < rules.length; i++){
        if(message.includes(rules[i])){
          return false;
        }
      }
      return true;
      


}

