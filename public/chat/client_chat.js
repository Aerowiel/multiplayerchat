var socket = io();
var connected = false;

/**
 * champ de saisie des messages
 */
$('form').submit(function(e) {
    e.preventDefault(); // On évite le recharchement de la page lors de la validation du formulaire
    // On crée notre objet JSON correspondant à notre message
    var message = {
        text : $('#m').val()
    }
    
    $('#m').val(''); // On vide le champ texte
    if (message.text.trim().length !== 0) { // Gestion message vide
      socket.emit('chat-message', message);
    }
    $('#chat input').focus(); // Focus sur le champ du message

});

/**
 * Connexion d'un utilisateur
 */
$('#login form').submit(function (e) {
  e.preventDefault();
  var username = $('#u').val().trim();
  var password = $('#y').val().trim();
  
  var user = {
    username : username,
    password : password
  };
  if (user.username.length > 0) { // Si le champ de connexion n'est pas vide
    socket.emit('user-login', user);
    connected = true;
    $('body').attr('id','logged-in'); // Cache formulaire de connexion
    $('#chat input').focus(); // Focus sur le champ du message
    $('#currentUser').text(user.username);
  }
});

/**
 * 
 */
socket.on('user_connected', function (user) {
  if(connected)
  $('#users').append($('<li id="'+user.id+'">').html('<span class="username" style="background-color:rgb' +user.color+' ">'+user.username + '</span> '));
  $('#messages').append($('<li style="font-style:italic; font-family:serif;">').html(user.username + " joined the room !"));
});

socket.on('user_disconnected', function (user){
  $('#messages').append($('<li style="font-style:italic; font-family:serif;">').html(user.username + " left the room ... Cya"));
  $('#'+user.id).remove();

});

/**
 * Réception d'un message
 */
socket.on('chat-message', function (message) {
  
	switch(message.version){
		case 2:
			$('#messages').append($('<li>').html('<span style="background-color:rgb'+ message.color + '" class="username">' + message.username + '</span> ' + '<span style="color:#FFF">' +message.text + '</span> '));
			break;
		default:
			$('#messages').append($('<li>').html(message.text));
  		break;	
	}
	scrollToBottom();
});

socket.on('play-sound-message', function (message) {
  document.getElementById('audioplayer').play();
});


socket.on('change_slide_text', function(text){
  $('#slide_text').text(text);
});

socket.on('rotate_logo', function(mode){
 $('#logo').attr('class', mode);
});

/**
 * Scroll vers le bas de page si l'utilisateur n'est pas remonté pour lire d'anciens messages
 */
function scrollToBottom() {  
  if ($(window).scrollTop() + $(window).height() + 2 * $('#messages li').last().outerHeight() >= $(document).height()) {
    $("html, body").animate({ scrollTop: $(document).height() }, 0);
  }
}