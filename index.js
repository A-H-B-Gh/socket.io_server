var express = require('express');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000 );

var counter = 0 ;
var clients = [];

server.listen(app.get('port'), function () {
	console.log("_______SERVER IS RUNNING_______");
})

io.on("connection", function(socket){

	var currentUser;

	socket.on("USER_CONNECT" , function(){
		console.log("______USER_CONNECTED______");
		for ( var i = 0; i < clients.length; i++){
			socket.emit("USER_CONNECTED", {
				id:clients[i].id ,name:clients[i].name, position:clients[i].position , color:clients[i].color
			})
			//console.log("User name "+ clients[i].name+ " is connected");
		}
	});

	socket.on("PLAY" , function ( data ) {
		console.log(data);
		currentUser = {
			id : counter ,
			name:data.name ,
			position:data.position,
			color: (random(0,256) +","+random(0,256)+","+random(0,256))
		}

		counter ++;
		clients.push(currentUser);
		socket.emit("PLAY" , currentUser);
		socket.broadcast.emit("USER_CONNECTED", currentUser);

	});

	socket.on("MOVE" , function(data){
		currentUser.position = data.position;
		socket.emit("MOVE" , currentUser);
		socket.broadcast.emit("MOVE", currentUser);
		console.log(currentUser.name + " move to " + currentUser.position);
	});

	socket.on("DISCONNECT", function() {
		socket.broadcast.emit("USER_DISCONNECTED" , currentUser)
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].id === currentUser.id) {
				console.log("User "+clients[i].name +" disconnected");
				clients.splice(i,1);
			}
		}
	});

})

function random (low, high) {
    return Math.random() * (high - low) + low;
}