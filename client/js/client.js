var socket = io();
var players = [];
var player;
var nameText;
var uuid = undefined;
var name = undefined;

const minimumDimensions = {'x':16, 'y':9};	//TILE WIDE & HIGH
const defaultTileDimensions = {'x':16, 'y':16} //TILE WIDTH & HEIGHT (DEFAULT)

var renderer;
var stage;
var scale = Math.min(window.innerWidth / (minimumDimensions.x * defaultTileDimensions.x), window.innerHeight / (minimumDimensions.y / defaultTileDimensions.y));

socket.on('assign_id', function(id){

	console.log('assigned id: ' + id);
	uuid = id;

});

socket.on('assign_player', function(obj, obj2){

	console.log('assigned pos by server, ', obj, ' other players:\n', obj2);

	player.vx = obj.vx;
	player.vy = obj.vy;
	player.x = obj.x;
	player.y = obj.y;
	player.tint = obj.colour;

	for (let i = 0; i < obj2.length; ++i){

		if (uuid != obj2[i].id){

			console.log('existing player: ', obj2[i]);

			var p = {

				'name':obj2[i].name,
				'id':obj2[i].id,
				'sprite':new PIXI.Sprite(PIXI.utils.TextureCache['res/player_w.png']),
				'text':new PIXI.Text(obj2[i].name, {'fontfamily':'Julius Sans One', 'fontsize':10, 'fill':0xdddddd, 'align':'center'})

			}

			p.sprite.vx = obj2[i].player.vx;
			p.sprite.vy = obj2[i].player.vy;
			p.sprite.x = obj2[i].player.x;
			p.sprite.y = obj2[i].player.y;
			p.sprite._tint = obj2[i].player.colour;
			p.sprite.addChild(p.text);
			p.text.y = player.height;
			p.text.scale.x = 1/scale;
			p.text.scale.y = 1/scale;

			stage.addChild(p.sprite);

			players.push(p);
		}
	}
});

socket.on('new_player', function(obj, id, name){

	console.log('new player joined, id: ', id, " object: ", obj);

	var p = {

		'id':id,
		'sprite':new PIXI.Sprite(PIXI.utils.TextureCache['res/player_w.png']),
		'name':name,
		'text':new PIXI.Text(name, {'fontfamily':'Julius Sans One', 'fontsize':10, 'fill':0xdddddd, 'align':'center'})

	};

	p.sprite.vx = obj.vx;
	p.sprite.vy = obj.vy;
	p.sprite.x = obj.x;
	p.sprite.y = obj.y;
	p.sprite._tint = obj.colour;
	p.sprite.addChild(p.text);
	p.text.y = player.height;
	p.text.scale.x = 1/scale;
	p.text.scale.y = 1/scale;

	stage.addChild(p.sprite);

	players.push(p);

});

socket.on('update_player', function(id, obj){

	console.log('player (id:' + id + ') updated (client)');

	var p = getPlayer(id);
	if (p == null){

		console.error('player doesn\'t exist: ' + id);
		socket.emit('error_false_id', id);
		return;

	}

	p.sprite.vx = obj.vx;
	p.sprite.vy = obj.vy;
	p.sprite.x = obj.x;
	p.sprite.y = obj.y;

});

socket.on('remove_player', function(id){

	console.log('player ' + id + ' disconnected');
	removePlayer(id);

})

function init(){

	console.log(socket);

	renderer = new PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
	document.getElementById('game').appendChild(renderer.view);
	document.getElementById('menu').style.display = 'none';
	name = document.getElementById('inbox').value;
	stage = new PIXI.Container();
	stage.scaleMode = PIXI.SCALE_MODES.NEAREST;
	stage.scale.x = scale;
	stage.scale.y = scale;

	PIXI.loader
		.add('res/player_w.png')
		.load(setup);

}

function setup(){

	player = new PIXI.Sprite(PIXI.utils.TextureCache['res/player_w.png']);
	nameText = new PIXI.Text(name, {'fontfamily':'Julius Sans One', 'fontsize':10, 'fill':0xdddddd, 'align':'center'});
	player.addChild(nameText);
	nameText.y = player.height;
	nameText.scale.x = 1/scale;
	nameText.scale.y = 1/scale;
	stage.addChild(player);
	socket.emit('get_player', name);

	var w_up = keyboard(87);
	var arr_up = keyboard(38);
	var s_down = keyboard(83);
	var arr_down = keyboard(40);
	var a_left = keyboard(65);
	var arr_left = keyboard(37);
	var d_right = keyboard(68);
	var arr_right = keyboard(39);

	//KEYBOARD FUNCTIONS//////////////////////////////////////////////////////
	d_right.press = arr_right.press = function(){

		player.vx = 0.5;

	}

	d_right.release = arr_right.release = function(){

		if (!(a_left.isDown | arr_left.isDown)) {player.vx = 0;} else {player.vx = -0.5;}

	}
	
	a_left.press = arr_left.press = function(){

		player.vx = -0.5;

	}

	a_left.release = arr_left.release = function(){

		if (!(d_right.isDown | arr_right.isDown)) {player.vx = 0;} else {player.vx = 0.5;}

	}
	
	w_up.press = arr_up.press = function(){

		player.vy = -0.5;

	}

	w_up.release = arr_up.release = function(){

		if (!(s_down.isDown | arr_down.isDown)) {player.vy = 0;} else {player.vy = 0.5;}

	}
	
	s_down.press = arr_down.press = function(){

		player.vy = 0.5;

	}

	s_down.release = arr_down.release = function(){

		if (!(w_up.isDown | arr_up.isDown)) {player.vy = 0;} else {player.vy = -0.5;}

	}
	//KEYBOARD FUNCTIONS//////////////////////////////////////////////////////

	gameloop();

}

function gameloop(){

	requestAnimationFrame(gameloop);

	player.x += player.vx;
	player.y += player.vy;

	if (players !== undefined)
		for (let p of players){
			p.sprite.x += p.sprite.vx;
			p.sprite.y += p.sprite.vy;
		}

	renderer.render(stage);

}

function getPlayer(id){

	if (players === undefined){
		console.log('players undefined');
		return null;
	}

	for (let i = 0; i < players.length; ++i)
		if (players[i].id == id)
			return players[i];

	console.log('looped through and didnt find ' + id);

	return null;
}

function removePlayer(id){

	if (players === undefined){
		console.log('players undefined');
		return null;
	}

	for (let i = 0; i < players.length; ++i)
		if (players[i].id == id){

			players[i].sprite.destroy();
			players.splice(i, 1);
		
		}

}

function createPlayerObj(){

	return {

		'x': player.x,
		'y': player.y,
		'vx': player.vx,
		'vy': player.vy,
		'colour': player._tint

	}

}

function keyboard(keyCode){

	var key = {};
	key.code = keyCode;
	key.isDown = false;
	key.isUp = true;
	key.press = undefined;
	key.release = undefined;
	//The `downHandler`

	key.downHandler = function(event) {
		
		if (event.keyCode === key.code) {
			
			if (key.isUp && key.press) {key.press(); socket.emit('update', uuid, createPlayerObj());}
			key.isDown = true;
			key.isUp = false;
    
    	}

		event.preventDefault();

	};

	//The `upHandler`
	key.upHandler = function(event) {
		
		if (event.keyCode === key.code) {

			if (key.isDown && key.release) {key.release(); socket.emit('update', uuid, createPlayerObj());}
			key.isUp = true;
			key.isDown = false;

		}

		event.preventDefault();

	};

	//Attach event listeners
	window.addEventListener("keydown", key.downHandler.bind(key), false);
	window.addEventListener("keyup", key.upHandler.bind(key), false);

	return key;

}