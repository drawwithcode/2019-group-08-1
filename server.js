var express = require('express');

var app = express();
var server = app.listen(3000, '192.168.43.125');

app.use(express.static('public'));

console.log("cacca");

var socket = require('socket.io');

var io = socket(server);

io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log('ciao: ' + socket.id);

  socket.on('clickBrick', brickMessage);

  function brickMessage(data){
    socket.broadcast.emit('brickBack', data);
  }

  socket.on('draw_cursor', function (data) {
    io.emit('draw_cursor', { line: data.line, id: socket.id });
  });
}
