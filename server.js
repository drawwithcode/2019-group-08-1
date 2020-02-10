//________________ LOAD PACKAGES __________________________________
var express = require('express'); // load express
var socket = require('socket.io'); // load socket.io
var geoip = require('geoip-lite'); // Load geoIp-lite

const publicIp = require('public-ip');

//________________ INITIALIZE THE SERVER ___________________________
var app = express(); // set the express app
app.use(express.static('public')); // select the static files in the public folder

// set the port of the server and log the port
var server = app.listen(process.env.PORT || 5000, function() {
  var port = server.address().port;
  console.log("Express is working on port " + port);
});

var io = socket(server); // set the server socket

// fires the "newConnection" function on each new connection
io.sockets.on('connection', newConnection);

//________________ NEW CONNECTION __________________________________

var clientSide = true;
var sideTrue = 0;
var sideFalse = 0;

function newConnection(socket) {
  // log the new USER ID
  console.log('a new user: ' + socket.id);
  var clientIpAddress = socket.request.headers['x-real-ip'] || socket.request.connection.remoteAddress;
  console.log(' new request from : '+ clientIpAddress);
  (async () => {
    var ipv4 = (await publicIp.v4());
    var geo = geoip.lookup(ipv4);
    // console.log(ipv4, geo);
  })();

  if (sideTrue < sideFalse) {
    clientSide = true;
  }else {
    clientSide = false;
  }

  var mySide = clientSide;
  if (mySide == true) {
    sideData = {
      mySide: mySide,
      peopleOnMySide: sideTrue
    }
    sideTrue++;
  }else {
    sideData = {
      mySide: mySide,
      peopleOnMySide: sideFalse
    }
    sideFalse++;
  }
  socket.emit('yourSide', sideData);
  socket.broadcast.emit('newPlayer', sideData.mySide);

  // receive the MOUSE POSITION from client and broadcast it to other clients
  // adding the USER ID
  socket.on('mouse', function(data) {
    var mouseData = {
      x: data.x,
      y: data.y,
      id: socket.id,
      side: data.side
    }

    socket.broadcast.emit('posMouse', mouseData);
  });

  // receive the BRICK ID from the client and broadcast it to the other clients
  socket.on('clickBrick', function(data) {
    socket.broadcast.emit('destroyBrick', data);
  });

  socket.on('click', function(data) {
    socket.broadcast.emit('click', data);
  })

  // when the user DISCONNECT send it's ID to the clients to DELETE
  // the corresponding CURSOR
  socket.on('disconnect', function() {
    var socketData = {
      id: socket.id,
      side: mySide
    }
    socket.broadcast.emit('deleteCursor', socketData);

    if (mySide == true) {
      sideTrue--;
    }else {
      sideFalse--;
    }
  })

  socket.on("askPeopleOnline", function() {
    socket.emit("peopleOnline", sideTrue+sideFalse)
  })
}
