module.exports = {

   newPlayer: function(){
    socket.activity = 'cluster';
    // We create the variable storing the player information in the user's socket
    socket.player = {
      id: http.lastPlayerID++,
      x : randomInt(100,400),
      y : randomInt(100,400)
    }
   },

   

}