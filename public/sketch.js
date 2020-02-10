
//________________ GLOBAL VARIABLES ___________________________

var socket; // socket of this CLIENT
var bricks = []; // arry containing the bricks of the wall
var cursors = []; // array containing cursors of other clients
var reset, rightButton, leftButton; // reset buttont to restore the wall
var canvas;
var sound, soundNear, bg;
var mySide;
var peopleOnMySide = 0;
var statusDisplay = false; //says if the 'statusContainer' elemet is displayed or not

//________________ PRELOAD, SETUP & DRAW ___________________________

function preload(){
  sound = loadSound('assets/stonehit.mp3');
  soundNear = loadSound('assets/near.wav');
  bg = loadImage('assets/back.png');
}

function setup() {

  // The canvas's width is 3 times bigger than the common windowWidth
  canvas = createCanvas(1200*3, 600);
  canvas.id('wallCanvas');
  canvas.parent('canvasContainer')

  // Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCaz9zOqec-Fo_c91NhTfDIRqik3GouS6A",
    authDomain: "break-the-wall-fc47e.firebaseapp.com",
    databaseURL: "https://break-the-wall-fc47e.firebaseio.com",
    projectId: "break-the-wall-fc47e",
    storageBucket: "break-the-wall-fc47e.appspot.com",
    messagingSenderId: "161651469658",
    appId: "1:161651469658:web:a29bfe4836c14308e25763",
    measurementId: "G-9L2MYGSBM5"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Create a variable containing the database
  var database = firebase.database();

  // Firebase reference in which are the bricks
  var ref = database.ref('bricks');

  // Only once on the opening of the page fill the BRICKS array
  // with the informations stored in FIREBASE
  ref.once('value', createBricks);

  // INCREMENT the number of TOTAL PARTECIPANTS
  var partecipantsRef = firebase.database().ref('partecipants')
  partecipantsRef.push(0)
  partecipantsRef.on('value', function(data) {
    var tot = Object.keys(data.val());
    totNumber = ('000' + tot.length).substr(-3);
    select('#totalNumber').html(totNumber);
  })


  // Store the socket of this client
  socket = io.connect();

  // Create the button to reset the wall
  reset = createButton('reset');
  reset.position(windowWidth/2, windowHeight - 100);
  reset.mousePressed(resetWall);
  reset.parent('buttonContainer')

  rightButton = createImg('./assets/arrowright.png');
  rightButton.position(windowWidth-50, windowHeight/2);
  rightButton.parent('buttonContainer')

  leftButton = createImg('./assets/arrowleft.png');
  leftButton.position(50, windowHeight/2);
  leftButton.style('display', 'none');
  leftButton.parent('buttonContainer')

  rightButton.mousePressed(function() {
    if (canvas.canvas.offsetLeft == -1200) {
      var movement = -2400;
      rightButton.style('display', 'none');
    }else {
      var movement = -1200
      leftButton.style('display', 'block');
    }
    canvas.style('left',movement + 'px')
  });

  leftButton.mousePressed(function() {
    if (canvas.canvas.offsetLeft == -1200) {
      var movement = 0;
      leftButton.style('display', 'none');
    }else {
      var movement = -1200
      rightButton.style('display', 'block');
    }
    canvas.style('left',movement + 'px')
  });

  select('#statusButton').mousePressed(function() {
    socket.emit('askPeopleOnline');
    var bricksLeft=0;
    for (var i = 0; i < bricks.length; i++) {
      if (bricks[i].stato == true) {
        bricksLeft++;
      }
    }
    bricksLeft = ('000' + bricksLeft).substr(-3)
    select('#bricks').html(bricksLeft);

    var container = select('#statusContainer')
    if (statusDisplay == true) {
      container.style('top', '-100%');
      statusDisplay = !statusDisplay;
    }else {
      container.style('top', '0');
      statusDisplay = !statusDisplay;
    }
  })

  //________________ SOCKETS LISTENERS ___________________________

  socket.on('peopleOnline', function(data) {
    var peopleOnline = ('000' + data).substr(-3)
    select('#onlineNumber').html(peopleOnline);

  })

  socket.on('yourSide', function(data) {
    mySide = data.mySide;
    peopleOnMySide = data.peopleOnMySide;
  })

  socket.on('newPlayer', function(data) {
    if (data == mySide) {
      peopleOnMySide++;
    }
  })

  // Receive the ID of the brick to destroy
  socket.on('destroyBrick', clicker);

  // Receive the MOUSE POSITIONS of the other clients
  // and add the new users to the CURSORS array
  socket.on('posMouse', mousePos);

  // Receive the ID of user that disconnected
  // and remove it from the CURSORS array
  socket.on('deleteCursor', function(data) {
    if (data.side == mySide) {
      peopleOnMySide--;
    }
    var getPos = cursors.findIndex(cursor => cursor.id === data.id);
    cursors.splice(getPos, 1)
  })

  socket.on('click', function(data) {
    if (data.side != mySide) {
      var tempDistances = [];
      for (var i = 0; i < cursors.length; i++) {
        var tempCursor = cursors[i];
        var d = dist(mouseX, mouseY, tempCursor.x, tempCursor.y);
        tempDistances.push(d);
      }
      var minDistance = min(tempDistances);
      var clickDistance = dist(mouseX, mouseY, data.x, data.y)
      if (minDistance >= clickDistance - 50 && minDistance <= clickDistance + 50) {

        var span = 1000
        var near = 100;
        if (clickDistance < span) {
          if (clickDistance <= near) {
            soundNear.play();
          }else{
            var vol = map(clickDistance,0,span,2,0.1);
            sound.setVolume(vol)
            sound.play();
            console.log(clickDistance);
          }
        }
      }

    }
  })

}

function draw() {

  background('black');
  image(bg,0,0)
  // Emit the mouse position to the server
  var mousePosition = {
    x: mouseX,
    y: mouseY,
    side: mySide
  }
  socket.emit('mouse', mousePosition);

  // Display the CURSORS
  for(var i = 0; i < cursors.length; i++){
    cursors[i].display();
  }

  // Display the WALL
  for(var i = 0; i < bricks.length; i++){
    bricks[i].display();
  }

  var x = mouseX;
  var y = mouseY;
  noCursor()
  noStroke()
  fill(0,255,0,40)
  ellipse(x,y,50)
  fill(0,255,0,50)
  ellipse(x,y,30)
  fill(0,255,0,60)
  ellipse(x,y,20)
  fill(0,255,0,60)
  ellipse(x,y,10)
  fill(200,255,200,120)
  ellipse(x,y,5)
}

//________________ FUNCTIONS ___________________________

// FILL THE "BRICKS" ARRAY WITH FIREBASE DATAS

function createBricks(data){
  // Variables which contains all the values of the database
  var blocchi = data.val();

  // Array which contains all the keys in the database
  var keys = Object.keys(blocchi);

  // For cycle to create the array containg the bricks using database datas
  for(i = 0; i < keys.length; i++){
    var k = keys[i]; // key of the keys array in position i
    var brick = blocchi[k]; // brick corresponding to the k key
    tempBrick = new Brick(k, brick.x, brick.y, brick.stato); // Create the brick object
    bricks.push(tempBrick); // store the brick in the wall
  }
}

// FIRES THE "CLICK" METHOD OF THE BRICKS WHEN THE USER CLICKS

function mousePressed(){
  // Execute the "click" method for all the bricks
  for(var i =0; i < bricks.length; i++){
    bricks[i].click();
  }
}

// RESET ALL BRICKS "STATO" TO TRUE ON FIREBASE

function resetWall(){
  for (i = 0; i < bricks.length; i++) {
    var tempBrick = bricks[i] // Get the brick on i position of the array
    // Use the brick's ID to find that brick on firebase databse
    var brickRef = firebase.database().ref('bricks/' + tempBrick.id);
    // Set the brick STATO to TRUE
    brickRef.update({
      stato: true
    });
  }
}

// RECEIVE THE CLICKED BRICK'S "ID" FROM THE SERVER
// AND SET IT'S "STATO" TO "FALSE"

function clicker(data){
  // Find the brick on the BRICKS array that has the same ID
  // of the data received
  var getBrick = bricks.find(block => block.id === data);
  getBrick.stato = false; // Set the STATO to FALSE
}

// CREATE OR UPDATE THE CURSORS OF OTHER USERS

function mousePos(data){
  if (data.side != mySide) {
    // Find the cursor that has the same ID of the data received
    var getPos = cursors.find(cursor => cursor.id === data.id);
    // If no cursor with that ID is find ---> "getPos" is set to undefined
    // so create a new cursor with that ID
    if (getPos == undefined) {
      var tempCursor = new Cursor(data.x, data.y, data.id); // Create new cursor
      cursors.push(tempCursor); // Push it on the "cursors" array
    }
    // If there is a cursor with that ID update the position
    else {
      getPos.x = data.x;
      getPos.y = data.y;
    }

  }
}

//________________ CLASSES ___________________________

//BRICKS OBJECTS THAT BUILD THE WALL

function Brick(_id, _x, _y, _stato) {

  // BRICK ATTRIBUTES

  // Each brick has an unique ID
  // that's equal to it's firebase key
  this.id = _id;
  // Brick position
  this.x = _x;
  this.y = _y;
  // Brick stato --> true = visible & flase = invisible
  this.stato = _stato;
  // Brick dimensions
  this.w = 100;
  this.h = 50;

  // BRICK METHODS

  // DISPLAY
  // The display method draw the brick only if its state is true
  this.display = function() {
    if (this.stato == true) {
      fill(210, 20, 20);
      strokeWeight(10)
      stroke(100,0,0)
      rect(this.x, this.y, this.w, this.h);
    }
  }

  // CLICK
  // The click method set the "stato" of the brick to false
  // if the mouse is hover and another user's mouse is hover
  this.click = function() {

    // these ifs chek if the mouse is over the brick
    if (mouseX > this.x && mouseX < this.x + this.w) {
      if (mouseY > this.y && mouseY < this.y + this.h) {

        if (this.stato == true) {
          var clickPosition = {
            x: mouseX,
            y: mouseY,
            side: mySide
          }
          socket.emit('click', clickPosition)
        }

        // Search for another cursor over the brick
        var a = cursors.find(cursor => cursor.x >= this.x && cursor.x <= this.x + this.w && cursor.y >= this.y && cursor.y <= this.y + this.h);
        // If there's almost another user set the brick's "stato" to false
        // and tell it to the server
        if (a != undefined) {
          this.stato = false;
          // Set the stato to false on firebase
          var brickRef = firebase.database().ref('bricks/' + this.id);
          brickRef.update({
            stato: false
          });

          // Emit the brick ID to the server to set its stato
          // to false also on ther clients
          var data = this.id;
          socket.emit('clickBrick', data);
        }
      }
    }
  }
}

// CURSOR OF ANOTHER USERS

function Cursor(_x, _y, _id){

  // CURSOR ATTRIBUTES

  // Cursor's position
  this.x = _x;
  this.y = _y;
  // Cursor's unique ID equal to it's SOCKET ID
  this.id = _id;
  // Random color
  this.color = color(random(255), random(255), random(255));

  // CURSOR METHODS

  // DISPLAY
  // Draw the cursor with it's color
  this.display = function(){
    fill(this.color);
    ellipse(this.x, this.y, 50);
  }
}




//________________ SPECIAL FUNCTION TO CREATE THE WALL ___________________________
function createTheWall() {
  var brickRef = firebase.database().ref('bricks');

  for (var j = 0; j <= 550; j+=50) {

    if ((j/50) % 2 == 1) {
      var offset = -50;
    }else {
      var offset = 0;
    }

    for (var i = 0; i <= 1200*3; i+=100) {
      var tempBrick = {
        x:i + offset,
        y:j,
        stato: true
      }

      brickRef.push(tempBrick)
    }
  }

}
