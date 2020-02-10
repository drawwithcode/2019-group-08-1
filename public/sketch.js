
//________________ GLOBAL VARIABLES ___________________________

var socket; // socket of this CLIENT
var bricks = []; // arry containing the bricks of the wall
var cursors = []; // array containing cursors of other clients
var myCursor; //cursor of the user
var auraCursor = []; //array containing the auras appearing when the user clicks
var rightButton, leftButton; // Buttons to move the canvas
var canvas;
var soundFar, soundMedium, soundNear;
var mySide, myGeoPosition;
var peopleOnMySide = 0;
var statusDisplay = false; //says if the 'statusContainer' elemet is displayed or not

//________________ PRELOAD, SETUP & DRAW ___________________________

function preload(){
  soundFar = loadSound('assets/soundfar.mp3');
  soundMedium = loadSound('assets/soundmedium.mp3');
  soundNear = loadSound('assets/soundnear.mp3');
}

function setup() {

  // The canvas's width is 3 times bigger than the common windowWidth
  canvas = createCanvas(1200*3, 600);
  canvas.id('wallCanvas');
  canvas.parent('canvasContainer')
  canvas.style('left', '-1200px')

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

  rightButton = createImg('./assets/arrowright.png');
  rightButton.style('position', 'absolute');
  rightButton.style('top', '50%');
  rightButton.style('left', '97%');
  rightButton.style('transform', 'translateX(-50%)');
  rightButton.parent('buttonContainer')

  leftButton = createImg('./assets/arrowleft.png');
  leftButton.position(50, windowHeight/2);
  leftButton.style('position', 'absolute');
  leftButton.style('top', '50%');
  leftButton.style('left', '3%');
  leftButton.style('transform', 'translateX(-50%)');
  leftButton.parent('buttonContainer')

  rightButton.mousePressed(function() {
    if (canvas.canvas.offsetLeft == -1200) {
      var movement = -2400;
      rightButton.style('display', 'none');
    }else {
      var movement = -1200
      leftButton.style('display', 'block');
    }
    canvas.style('left',movement + 'px');
    select('#sfondo2').style('left',movement/4 + 'px');
    select('#sfondo3').style('left',movement+ 'px');
  });

  leftButton.mousePressed(function() {
    if (canvas.canvas.offsetLeft == -1200) {
      var movement = 0;
      leftButton.style('display', 'none');
    }else {
      var movement = -1200
      rightButton.style('display', 'block');
    }
    canvas.style('left',movement + 'px');
    select('#sfondo2').style('left',movement/4 + 'px');
    select('#sfondo3').style('left',movement+ 'px');
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



  myCursor = new myCursor();

  //________________ SOCKETS LISTENERS ___________________________

  socket.on('peopleOnline', function(data) {
    var peopleOnline = ('000' + data).substr(-3)
    select('#onlineNumber').html(peopleOnline);

  })

  socket.on('yourGeoPosition', function(data) {
    myGeoPosition = data;
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

        var far = 1000;
        var medium = 500;
        var near = 100;
          if (clickDistance <= near) {
            soundNear.play();
          }else if (clickDistance <= medium) {
            soundMedium.play();
          }else if (clickDistance <= far) {
            soundFar.play();
          }

      }

    }
  })

}

function draw() {
  clear();
  // Emit the mouse position to the server
  var mousePosition = {
    x: mouseX,
    y: mouseY,
    side: mySide,
    geo: myGeoPosition
  }
  socket.emit('mouse', mousePosition);

  // Display the CURSORS
  for(var i = 0; i < cursors.length; i++){
    cursors[i].display();
    cursors[i].update();
  }

  // Display the WALL
  for(var i = 0; i < bricks.length; i++){
    bricks[i].display();
  }

  //Display MY CURSOR
  noCursor();
  myCursor.display();
  myCursor.update();

  //Display my AURA
  for (var i = 0; i < auraCursor.length; i++) {
    var tempAura = auraCursor[i];
    tempAura.display();
  }

  if (frameCount % 60 == 0 && timer > 0) {
        timer --;
    }

    if (timer == 0) {

    } else {
        countDown();
    }

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

var timeLeft = function(){
    var currentDate = new Date();
    currentDate = currentDate.getTime();
    var endDate = new Date("2020-02-13T00:00:00");
    if (parseInt((endDate-currentDate)/1000)<0){return 0};
    return parseInt((endDate-currentDate)/1000);
}

var timerText = function(){
    var h = String(parseInt(timer / 3600));
    var m = String(parseInt(timer / 60)%60);
    var s = String(timer - 3600*h - 60*m);

    if (h.length == 1){h="0"+h;};
    if (m.length == 1){m="0"+m;};
    if (s.length == 1){s="0"+s;};


    return h+"h "+m+"m "+s+"s";

}

function countDown(){
    select('#countDown').html(timerText());
    select('#countDown').parent('#canvasContainer');
}

var timer = timeLeft();

// FIRES THE "CLICK" METHOD OF THE BRICKS WHEN THE USER CLICKS

function mousePressed(){
  // Execute the "click" method for all the bricks
  for(var i =0; i < bricks.length; i++){
    bricks[i].click();
  }

  //A NEW AURA object is created and pushed into its ARRAY
  var tempAura = new Aura();
    auraCursor.push(tempAura);
    //If the ARRAY has more than 3 elements, the oldest one DISAPPEARS
    if (auraCursor.length > 3) {
      auraCursor.splice(0,1);
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
      var tempCursor = new Cursor(data.x, data.y, data.id, data.geo); // Create new cursor
      cursors.push(tempCursor); // Push it on the "cursors" array
    }
    // If there is a cursor with that ID update the position and country
    else {
      getPos.x = data.x;
      getPos.y = data.y;
      getPos.geo = data.geo;
    }

  }
}

//________________ CLASSES ___________________________

//________________ BRICKS OBJECTS THAT BUILD THE WALL

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
      fill('#211e36');
      strokeWeight(10)
      stroke('#0E0C19')
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

//________________ CURSOR OF MAIN USER

function myCursor(_x, _y){
  this.x = mouseX;
  this.y = mouseY;
  this.size = 50;

  //Array containing the previous POSITIONS of the MOUSE
  this.history = [];

  //Method which updates the ARRAY pushing NEW POSITIONS
  this.update = function(){
    var prevPos = {
      x: mouseX,
      y: mouseY
    }
    this.history.push(prevPos);

    //If the ARRAY has more than 30 objects, the oldest ones DISAPPEAR
    if(this.history.length > 30){
      this.history.splice(0,1);
    }
  }

  //Method which DISPLAYS the CURSOR
  this.display = function(){
    //For cycle which creates ellipses out of the PREVIOUS POSITIONS
    //The NEWEST POSITIONS create BIGGER ellipses
    noStroke();
    fill(	127, 255, 212, 30);
    for(var i = 0; i < this.history.length; i++){
      ellipse(this.history[i].x, this.history[i].y, i*2.5);
    }
    // ELLIPSE displaying the CURSOR
    fill(	127, 255, 212, 240);
    var x = mouseX;
    var y = mouseY;
    ellipse(x, y, 30);
    strokeWeight(1);
    stroke(0);
    line(x-3.5,y,x+3.5,y);
    line(x,y-3.5,x,y+3.5);
  }
}

//________________ AURA OF MAIN USER

function Aura(_x, _y){
  this.x = mouseX;
  this.y = mouseY;
  this.dim = 0;
  this.opacity = 255;

  //Method which DISPLAYS the AURA and makes it DISAPPEAR GRADUALLY
  this.display = function(){
    strokeWeight(2);
    this.dim += 5;
    this.opacity -= 10;
    noFill();
    stroke(127, 255, 212, this.opacity);
    ellipse(this.x, this.y, this.dim);
  }
}

//________________ CURSOR OF OTHER USERS

// Random COLOR of USERS
var palette = [
{r: 255, g:155, b:67},
{r: 23, g: 255, b: 233}
]


function Cursor(_x, _y, _id, _geo){

  // CURSOR ATTRIBUTES

  // Cursor's position
  this.x = _x;
  this.y = _y;
  // Cursor's unique ID equal to it's SOCKET ID
  this.id = _id;
  this.geo = _geo;
  // Random color
  this.color = palette[round(random(palette.length))]
  console.log(this.color);
  this.size = 30;

  this.history = [];

  // CURSOR METHODS
  //UPDATE
  this.update = function(){
    var prevPos = {
      x: this.x,
      y: this.y
    }
    this.history.push(prevPos);
    if(this.history.length > 30){
      this.history.splice(0,1);
    }
  }

  // DISPLAY
  // Draw the cursor with it's color
  this.display = function(){
    noStroke();
    fill(this.color.r, this.color.g, this.color.b, 30);
    for(var i = 0; i < this.history.length; i++){
      ellipse(this.history[i].x, this.history[i].y, i*2);
    }
    fill(this.color.r, this.color.g, this.color.b, 150);
    ellipse(this.x, this.y, 20);

    if (mouseX > this.x - 30 && mouseX < this.x + 30) {
      if (mouseY > this.y - 30 && mouseY < this.y + 30) {
        textSize(100)
        text(this.geo,this.x,this.y)
      }
    }
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
