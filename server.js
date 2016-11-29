var express = require('express');
var app 	= express();
var http 	= require('http').Server(app);
var io 		= require('socket.io')(http);
var port 	= process.env.PORT || 8080;

var playerstates = [];

app.use('/', express.static('client/'));

app.get('/', function(req, res){

	res.sendFile(__dirname + "/client/index.html");

});

io.on('connection', function(socket){

	var id = Math.floor(Math.random() * 1000) | 0;
	console.log('user connected, assigining id: ' + id);
	socket.emit('assign_id', id);

	var player = {

		'x': 	0,
		'y': 	0,
		'vx': 	0,
		'vy': 	0,
		'colour': Math.random() * (0xffffff)

	}

	socket.on('get_player', function(name){

		console.log('user (' + name + ') requested player obj, assigning obj: ', player);
		playerstates.push({'name':name, 'player':player, 'id':id});
		socket.emit('assign_player', player, playerstates);
		socket.broadcast.emit('new_player', player, id, name);

	});

	socket.on('update', function(id, player){

		updatePlayer(id, player);
		socket.broadcast.emit('update_player', id, player);

	});

	socket.on('reconnect', function(){

		console.log('player ' + id + ' reconnected');
		socket.emit('assign_id', id);
		socket.emit('assign_player', getPlayer(id).player, playerstates);

	});

	socket.on('disconnect', function(){

		removePlayer(id);
		socket.broadcast.emit('remove_player', id);

	});

});

http.listen(port, function(){
	
	console.log('server on ' + port);

});

function removePlayer(id){

	for (let i = 0; i < playerstates.length; ++i)
		if (playerstates[i].id == id)
			playerstates.splice(i, 1);

	console.log('removed player ' + id + ' from playerstates, ', playerstates);

}

function getPlayer(id){

	for (let i = 0; i < playerstates.length; ++i)
		if (playerstates[i].id == id)
			return playerstates[i].player;

}

function updatePlayer(id, obj){

	for (let i = 0; i < playerstates.length; ++i)
		if (playerstates[i].id == id)
			playerstates[i].player = obj;

}