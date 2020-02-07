var express = require('express');

var app = express();
//var server = app.listen(3000, '192.168.43.125');
var port = process.env.PORT || 3000;

app.use(express.static('public'));

console.log("cacca");

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket){
  var cursor = {
    x: 100,
    y: 100,
    id: socket.id,
  }
  console.log('ciao: ' + socket.id);

  socket.on('clickBrick', brickMessage);
  socket.on('mouse', posMessage);


  function brickMessage(data){
    socket.broadcast.emit('brickBack', data);
  }

  socket.broadcast.emit('newCursor', cursor);

  function posMessage(data){
    var mouse = {
      x:data.x,
      y:data.y,
      id:socket.id
    }
    console.log(mouse);

    socket.broadcast.emit('posMouse', mouse);
  }
}
