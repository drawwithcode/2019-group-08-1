


// [____][____][____][____][____][____][____][____][____][____][__
// ___][____][____][____][____][____][____][____][____][____][____]
// [____][____][____]     BREAK THE WALL!     [____][____][____][__
// ___][____][____][____][____][____][____][____][____][____][____]
// [____][____][____][____][____][____][____][____][____][____][__



//________________ GLOBAL VARIABLES ___________________________

var socket; // socket of this CLIENT
var bricks = []; // arry containing the bricks of the wall
var cursors = []; // array containing cursors of other clients
var myCursor; //cursor of the user
var auraCursor = []; //array containing the auras appearing when the user clicks
var rightButton, leftButton; // Buttons to move the canvas
var canvas;
var soundFar, soundMedium, soundNear; // Store the sund files
var mySide; // My side of the wall
var statusDisplay = false; //says if the 'statusContainer' elemet is displayed or not
var totNumber; //Total number of users that partecipated the experience

//___________________ PRELOAD ________________________________

function preload(){
  // Load SOUNDS
  soundFar = loadSound('assets/soundfar.mp3');
  soundMedium = loadSound('assets/soundmedium.mp3');
  soundNear = loadSound('assets/soundnear.mp3');
}

//___________________ SETUP ________________________________

function setup() {
  // Store the socket of this client
  socket = io.connect();

  // The canvas's width is 3 times bigger than the canvasContainer
  canvas = createCanvas(1200*3, 600);
  // Positioning the canvas in the HTML
  canvas.id('wallCanvas');
  canvas.parent('canvasContainer')
  canvas.style('left', '-1200px')

  // Create myCursor object
  myCursor = new myCursor();

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
  // Refersh the value on every new partecipant
  partecipantsRef.on('value', function(data) {
    var tot = Object.keys(data.val()); // Take the number from firebase
    totNumber = ('000' + tot.length).substr(-3); // Set the number to three digits
    select('#totalNumber').html(totNumber); // Change the html
  })


//________________ BUTTONS ___________________________

  // RIGHT BUTTON
  rightButton = createImg('./assets/arrowright.png');
  // when pressed move the canvas
  rightButton.mousePressed(rightMoveCanvas);
  // it's style and positioning
  rightButton.style('position', 'absolute');
  rightButton.style('top', '50%');
  rightButton.style('left', '97%');
  rightButton.style('transform', 'translateX(-50%)');
  rightButton.parent('buttonContainer')

  // LEFT BUTTON
  leftButton = createImg('./assets/arrowleft.png');
  // when pressed move the canvas
  leftButton.mousePressed(leftMoveCanvas);
  // it's style and positioning
  leftButton.style('position', 'absolute');
  leftButton.style('top', '50%');
  leftButton.style('left', '3%');
  leftButton.style('transform', 'translateX(-50%)');
  leftButton.parent('buttonContainer')

  // Press the "i" button display the status of the wall
  select('#statusButton').mousePressed(displayStatusWindow)

  //________________ SOCKETS LISTENERS ___________________________

  // Refresh the 'onlinePlayers' number
  socket.on('peopleOnline', function(data) {
    var peopleOnline = ('000' + data).substr(-3)
    select('#onlineNumber').html(peopleOnline);

  })

  // Server position the user on one side of the wall
  socket.on('yourSide', function(data) {
    mySide = data;
  })

  // Receive the ID of the brick to destroy
  socket.on('destroyBrick', clicker);

  // Receive the MOUSE POSITIONS of the other clients
  // and add the new users to the CURSORS array
  socket.on('posMouse', mousePos);

  // Receive the ID of user that disconnected
  // and remove it from the CURSORS array
  socket.on('deleteCursor', function(data) {
    var getPos = cursors.findIndex(cursor => cursor.id === data.id);
    cursors.splice(getPos, 1)
  })

  // Receive the CLICK data of other users from the server
  // and create a SOUND based on the distance
  socket.on('click', soundOnClick)

}

//___________________ DRAW ________________________________

function draw() {
  clear();
  // Emit the mouse position to the server
  var mousePosition = {
    x: mouseX,
    y: mouseY,
    side: mySide,
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

  //Display the AURA on click
  for (var i = 0; i < auraCursor.length; i++) {
    var tempAura = auraCursor[i];
    tempAura.display();
  }

  // Refresh the countDown each second
  // and display the END TEXT on timer = 0
  if (frameCount % 60 == 0 && timer > 0) {
        timer --;

    }

      //End experience text that pops up on the number of bricks and time left of the game
      var bricksLeft = bricksLeftNumber();

      //If the users are able to destroy the wall in time they get the good final
      if(bricksLeft < 11 ){
        select('#goodFinal').html("This Wall <br> has been destroyed <br> by " + totNumber + " people! <br> awesome!");
      }else {
        select('#goodFinal').html("");
      }
      //If the users are not able to destroy the wall in time they get the bad final
      if (timer == 0) {
        if(bricksLeft > 11){
          select("#finalText").html("This Wall <br> is still keeping apart <br>" + totNumber + " people.");
          select("#finalText2").html("Next year, find other friends <br> to destroy the wall!")
          }

      }else {
        countDown();
    }

}

//________________ FUNCTIONS ___________________________


//_____ BUTTONS functions ________________

// Move the canvas on the right
function rightMoveCanvas() {
  // Check the canvas position
  if (canvas.canvas.offsetLeft == -1200) {
    var movement = -2400; // set the canvas completely on the right
    rightButton.style('display', 'none'); // hide the button
  }else {
    var movement = -1200 // set the canvas on the center
    leftButton.style('display', 'block'); // display the left button
  }
  canvas.style('left',movement + 'px'); // Move the canvas
  // Move the backgrounds with parallax
  select('#sfondo2').style('left',movement/4 + 'px');
  select('#sfondo3').style('left',movement+ 'px');
};

// Move the canvas on the left
function leftMoveCanvas() {
  // Check the canvas position
  if (canvas.canvas.offsetLeft == -1200) {
    var movement = 0; // set the canvas completely on the left
    leftButton.style('display', 'none'); // hide the button
  }else {
    var movement = -1200 // set the canvas on the center
    rightButton.style('display', 'block'); // display the right button
  }
  canvas.style('left',movement + 'px'); // move the canvas
  // Move the backgrounds with parallax
  select('#sfondo2').style('left',movement/4 + 'px');
  select('#sfondo3').style('left',movement+ 'px');
}

// Display the status window
function displayStatusWindow() {
  socket.emit('askPeopleOnline'); // Ask the server for the number of people online
  // Gets the number of bricks left
  var bricksLeft = bricksLeftNumber();
  // Set the number with to 3 digits
  bricksLeft = ('000' + bricksLeft).substr(-3)
  select('#bricks').html(bricksLeft); // Set the number in the html

  // Display or hide the status window
  var container = select('#statusContainer')
  // Hide
  if (statusDisplay == true) {
    container.style('top', '-100%'); //hide
    select('#statusButton').html('i'); // change the button image
    statusDisplay = !statusDisplay; // Change the status display
  // Display
  }else {
    container.style('top', '0'); // display
    select('#statusButton').html('x'); // change the button image
    statusDisplay = !statusDisplay; // Change the status display
  }
}

//________________ SOCKET LISTENERS functions ________________

////// Take the data of the USER CLICKING and
////// make a SOUND based on the click distance
function soundOnClick(data) {
  // Make a sound only if the user is on the other side
  if (data.side != mySide) {
    //check if the user is the nearest
    var tempDistances = []; // stores all the distances
    for (var i = 0; i < cursors.length; i++) {
      var tempCursor = cursors[i];
      var d = dist(mouseX, mouseY, tempCursor.x, tempCursor.y); // distance YOUR mouse - OTHER user mouse
      tempDistances.push(d); // Store in the array
    }
    var minDistance = min(tempDistances); // Find the minimum
    var clickDistance = dist(mouseX, mouseY, data.x, data.y) // distance YOU - CLICK
    // If the click distance is the same of the nearest distance
    // (with an amount of error) make a sound
    if (minDistance >= clickDistance - 50 && minDistance <= clickDistance + 50) {

      var far = 1000; // far distance
      var medium = 500; // medium distance
      var near = 100; // near distance

      // Make the sound according to the distance
      if (clickDistance <= near) {
        soundNear.play();
      } else if (clickDistance <= medium) {
        soundMedium.play();
      } else if (clickDistance <= far) {
        soundFar.play();
      }

    }

  }
}


////// FILL THE "BRICKS" ARRAY WITH FIREBASE DATAS
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

////// COUNTDOWN function
function timeLeft() {
  // get the current date
  var currentDate = new Date();
  currentDate = currentDate.getTime();
  // end date
  var endDate = new Date("2020-02-13T00:00:00");
  // calculate the difference --> countDown
  return parseInt((endDate - currentDate) / 1000);
}

////// Set the timer to the formattation  -h -m -s
function timerText() {

  var h = String(parseInt(timer / 3600)); // Get hours
  var m = String(parseInt(timer / 60) % 60); // Get minutes
  var s = String(timer - 3600 * h - 60 * m); // Get seconds
  // convert numbers to strings and to two digits
  if (h.length == 1) {
    h = "0" + h;
  };
  if (m.length == 1) {
    m = "0" + m;
  };
  if (s.length == 1) {
    s = "0" + s;
  };
  // return correct formattation
  return h + "h " + m + "m " + s + "s";
}

////// Set the countdown in the HTML
function countDown(){
    select('#countDown').html(timerText());
    select('#countDown').parent('#canvasContainer');
}
//set the timer
var timer = timeLeft();

////// FIRES THE "CLICK" METHOD OF THE BRICKS WHEN THE USER CLICKS
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

////// RECEIVE THE CLICKED BRICK'S "ID" FROM THE SERVER
////// AND SET IT'S "STATO" TO "FALSE"
function clicker(data){
  // Find the brick on the BRICKS array that has the same ID
  // of the data received
  var getBrick = bricks.find(block => block.id === data);
  getBrick.stato = false; // Set the STATO to FALSE
}

////// CREATE OR UPDATE THE CURSORS OF OTHER USERS
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
    // If there is a cursor with that ID update the position and country
    else {
      getPos.x = data.x;
      getPos.y = data.y;
    }

  }
}

////// Returns the number of Bricks not destroyed
function bricksLeftNumber() {
  var bricksLeft = 0; //Bricks left on the wall
  // Check all the bricks
  for (var i = 0; i < bricks.length; i++) {
    // If the brick is not destroyed, increment BricksLeft
    if (bricks[i].stato == true) {
      bricksLeft++;
    }
  }
  return bricksLeft; // return number of bricks left
}

////// Hide pages of the tutorial (on click)
var tutorialCount = 0; // count the status to hide the div containing the pages
function hideElement(_element) {
  tutorialCount++; // next status
  _element.style.display = 'none'; // Hide the elemet clicked
  // if on status 3 Hide the div containing the pages
  if (tutorialCount == 3) {
    select('#tutorial').style('top', '-100%');
    gif2.style.display = 'none'; // hide the gif on the third page
  }
  if(tutorialCount ==2){
    gif1.style.display = 'none'; // hide the gif on the second page
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

    // Check if the mouse is over the brick
    if (mouseX > this.x && mouseX < this.x + this.w) {
      if (mouseY > this.y && mouseY < this.y + this.h) {
        // If the brick is not destroyed send the click to other clients
        if (this.stato == true) {
          var clickPosition = {
            x: mouseX,
            y: mouseY,
            side: mySide
          }
          socket.emit('click', clickPosition) // Emit the click
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
          // to false also on other clients
          var data = this.id;
          socket.emit('clickBrick', data);
        }
      }
    }
  }
}

//________________ CURSOR OF MAIN USER

function myCursor(){
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

    //If the ARRAY has more than 30 objects, delete the older one
    if(this.history.length > 30){
      this.history.splice(0,1);
    }
  }

  //Method which DISPLAYS the CURSOR
  this.display = function(){
    //For cycle which creates ellipses out of the PREVIOUS POSITIONS
    //The NEWEST POSITIONS create BIGGER ellipses
    noStroke();
    fill(	162, 255, 255, 30);
    for(var i = 0; i < this.history.length; i++){
      ellipse(this.history[i].x, this.history[i].y, i*2.5);
    }
    // ELLIPSE displaying the CURSOR
    fill(	162, 255, 255, 240);
    ellipse(mouseX, mouseY, 30);
    // Cross on the mouse position
    strokeWeight(1.3);
    stroke('#0E0C19');
    line(mouseX-3.5,mouseY,mouseX+3.5,mouseY);
    line(mouseX,mouseY-3.5,mouseX,mouseY+3.5);
  }
}

//________________ AURA OF MAIN USER
//________________ DISPLAYED ON CLICK

function Aura(){

  // ATTRIBUTES

  // It is set on the mouse position
  this.x = mouseX;
  this.y = mouseY;
  this.dim = 0; // starts little
  this.opacity = 255; // starts completely visible

  //Method which DISPLAYS the AURA and makes it DISAPPEAR GRADUALLY
  this.display = function(){
    this.dim += 5; // make it bigger
    this.opacity -= 10; // make it disappear
    // Display the aura
    noFill();
    strokeWeight(2);
    stroke(127, 255, 212, this.opacity);
    ellipse(this.x, this.y, this.dim);
  }
}

//________________ CURSOR OF OTHER USERS

// palette of the other users
var palette = [
  {r: 255, g: 127, b: 234 },
  {r: 255, g: 148, b: 127 },
  {r: 234, g: 255, b: 127 },
  {r: 127, g: 255, b: 148 },
  {r: 255, g: 84, b: 51 },
  {r: 255, g: 186, b: 51 },
  {r: 255, g: 51, b: 119 },
  {r: 119, g: 255, b: 51 },
  {r: 221, g: 255, b: 51 },
  {r: 51, g: 255, b: 84 }
]


function Cursor(_x, _y, _id){

  // CURSOR ATTRIBUTES

  // Cursor's position
  this.x = _x;
  this.y = _y;
  // Cursor's unique ID equal to it's SOCKET ID
  this.id = _id;
  // Random COLOR from the PALETTE
  this.color = palette[round(random(palette.length-1))]
  this.size = 30;
  // Old positions
  this.history = [];

  // CURSOR METHODS

  //UPDATE the HISTORY of positions
  this.update = function(){
    // Position
    var prevPos = {
      x: this.x,
      y: this.y
    }
    this.history.push(prevPos); // PUSH the position in HISTORY
    // If the there are 30 objects DELETE the OLDER one
    if(this.history.length > 30){
      this.history.splice(0,1);
    }
  }

  // DISPLAY
  // Draw the cursor with it's color
  this.display = function(){
    // Display the cursor trail from positions in the HISTORY array
    noStroke();
    fill(this.color.r, this.color.g, this.color.b, 30);
    for(var i = 0; i < this.history.length; i++){
      ellipse(this.history[i].x, this.history[i].y, i*2); // newest position --> bigger ellipse
    }
    // Display the center of the cursor
    fill(this.color.r, this.color.g, this.color.b, 150);
    ellipse(this.x, this.y, 20);

  }
}

//________________ SPECIAL FUNCTIONS TO MANAGE THE WALL DATAS IN FIREBASE _________________________

////// RESET ALL BRICKS "STATO" TO TRUE ON FIREBASE
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


////// WALL CREATION IN FIREBASE
function createTheWall() {
  // Bricks reference on firebase
  var brickRef = firebase.database().ref('bricks');

  // Create the wall in ROWS
  // J --> y position
  // I --> x position
  // the offset value move the odd rows of 50 pixels
  // to make a staggered position effect (as below)

  // [____][____][____][____][____][____][____][____][____][____][__
  // ___][____][____][____][____][____][____][____][____][____][____]
  // [____][____][____][____][____][____][____][____][____][____][__
  // ___][____][____][____][____][____][____][____][____][____][____]
  // [____][____][____][____][____][____][____][____][____][____][__

  for (var j = 0; j <= 550; j+=50) {
    // Check if is an odd row
    if ((j/50) % 2 == 1) {
      var offset = -50; // offset to move the odd rows
    }else {
      var offset = 0;
    }
    // Create all bricks of the row
    for (var i = 0; i <= 1200*3; i+=100) {
      // Create the single brick object
      var tempBrick = {
        x:i + offset,
        y:j,
        stato: true
      }
      brickRef.push(tempBrick) // Push it in firebase
    }
  }
}

// [____][____][____][____][____][____][____][____][____][____][__
// ___][____][____][____][____][____][____][____][____][____][____]
// [____][____][____][____][____][____][____][____][____][____][__

// THANKS FOR READING OUR CODE! (Check also server.js, index.html, style.css)
// Try to break all the walls and divisions out there.

// CODE BY:

// Martina Melillo           (u  w  u)
//
// Alessandro Piredda        (^  -  ^)
//
// Alessandro Quets          (ಡ ω ಡ)

// Creative Coding Class - a.a. 2019/2020 - Politecnico di Milano
// Teachers : Michele Mauri, Andrea Benedetti

// [____][____][____][____][____][____][____][____][____][____][__
// ___][____][____][____][____][____][____][____][____][____][____]
// [____][____][____][____][____][____][____][____][____][____][__
// ___][____][____][____][____][____][____][____][____][____][____]
// [____][____][____][____][____][____][____][____][____][____][__
