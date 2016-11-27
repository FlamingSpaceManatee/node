var socket = io();
var myid = 'NO_ID'

socket.on('new_user', function(id){

	var para = document.createElement('p');
	var node = document.createTextNode(id + " has connected to the server!");
	para.appendChild(node);
	var body = document.getElementById('chatarea');
	body.appendChild(para);
	myid = id;

});

socket.on('text', function(id, text){

	var para = document.createElement('p');
	var node = document.createTextNode(id + ": " + text);
	para.appendChild(node);
	var body = document.getElementById('chatarea');
	body.appendChild(para);

});

function send(){

	var text = document.getElementById('in').value;
	document.getElementById('in').value = '';
	socket.emit('text', text, myid);

}