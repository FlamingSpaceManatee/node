var express = require('express');
var app 	= express();
var http 	= require('http').Server(app);
var io 		= require('socket.io')(http);

var nextid = 0;

app.use('/', express.static('client/'));

app.get('/', function(req, res){

	res.sendFile(__dirname + "/client/index.html");

});

io.on('connection', function(socket){

	socket.emit('new_user', nextid++);

	socket.on('text', function(text, id){

		io.emit('text', id, text);

	});

});

http.listen(8080, function(){
	
	console.log('server on 8080');

});