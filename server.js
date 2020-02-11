//________________ LOAD PACKAGES __________________________________
var express = require('express'); // load express
var socket = require('socket.io'); // load socket.io

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

var clientSide = true; // Position of the user in TRUE side or FALSE side
var sideTrue = 0; // Count the people on true side
var sideFalse = 0; // Count the people on false side

function newConnection(socket) {
  // log the new USER ID
  console.log('a new user: ' + socket.id);

  // Set the POSITION of the user where there are LESS USERS
  if (sideTrue < sideFalse) {
    clientSide = true;
  }else {
    clientSide = false;
  }

  // Send the correct side to the client
  var mySide = clientSide;
  if (mySide == true) {
    sideTrue++; // Increment the users on true side
  }else {
    sideFalse++; // Increment the users on false side
  }
  socket.emit('yourSide', mySide); // Send the side to the client
  socket.broadcast.emit('newPlayer', mySide); // Send the side to all other users

  // receive the MOUSE POSITION from client and broadcast it to other clients
  // adding the USER ID
  socket.on('mouse', function(data) {
    var mouseData = {
      x: data.x,
      y: data.y,
      id: socket.id,
      side: data.side,
    }

    socket.broadcast.emit('posMouse', mouseData);
  });

  // receive the BRICK ID from the client and broadcast it to the other clients
  socket.on('clickBrick', function(data) {
    socket.broadcast.emit('destroyBrick', data);
  });
  // Receive the CLICK data and BROADCAST it to all clients
  socket.on('click', function(data) {
    socket.broadcast.emit('click', data);
  })

  // when the user DISCONNECT send it's ID to the clients to DELETE
  // the corresponding CURSOR and decrement the side variables
  socket.on('disconnect', function() {
    var socketData = {
      id: socket.id,
      side: mySide
    }
    socket.broadcast.emit('deleteCursor', socketData);
    //decrement the side varible
    if (mySide == true) {
      sideTrue--;
    }else {
      sideFalse--;
    }
  })

  // Send the number of PEOPLE ONLINE when asked
  socket.on("askPeopleOnline", function() {
    socket.emit("peopleOnline", sideTrue+sideFalse)
  })
}

// THANKS FOR READING! Check the other code on
// sketch.js
// index.html
// style.css
