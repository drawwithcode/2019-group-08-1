var socket;
var reset;
//Array which contains all elements of the wall
var bricks = [];
var cursors = [];

var mouse;

function preload(){
}

function setup() {

  //The canvas's width is 3 times bigger than the windowWidth
  createCanvas(1920*3, 1080);


  //Firebase configuration
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

  //Creating a variable containing the database
  var database = firebase.database();
  var ref = database.ref('bricks');
  ref.once('value', gotData, errData);

  socket = io.connect();
  //socket = io.connect('http://192.168.43.171:3000');
  //socket = io();
  socket.on('brickBack', clicker);

  reset = createButton('reset');
  reset.position(width/2, height/2);
  reset.mousePressed(turnback);

  socket.on('posMouse', mousePos);

  socket.on('deleteCursor', function(data) {
    var getPos = cursors.findIndex(cursor => cursor.id === data);
    cursors.splice(getPos, 1)
  })

}

function turnback(){
  for (i = 0; i < bricks.length; i++) {
    var tempBrick = bricks[i]
    var brickRef = firebase.database().ref('bricks/' + tempBrick.id);
    brickRef.update({
      stato: true
    });
  }
}

function gotData(data){
  //Variables which contains all the values of the database
  var blocchi = data.val();

  //Array which contains all the keys in the database
  var keys = Object.keys(blocchi);

  //For cycle to create the array containg the bricks using database datas
  for(i = 0; i < keys.length; i++){
    var k = keys[i]; //key of the keys array in position i
    var brick = blocchi[k]; //brick corresponding to the k key
    tempBrick = new Brick(k, brick.x, brick.y, brick.stato);
    bricks.push(tempBrick);
  }
}

function errData(err){
  console.log(err);
}

function clicker(data){
  var getBrick = bricks.find(block => block.id === data);
  getBrick.stato = false;
  console.log(data);
}

function mousePos(data){
  var getPos = cursors.find(cursor => cursor.id === data.id);
  if (getPos == undefined) {
    var tempCursor = new Cursor(data.x, data.y, data.id);
    cursors.push(tempCursor);
  }else {
    getPos.x = data.x;
    getPos.y = data.y;
  }
}


function draw() {
  background('black');

  var mouse = {
    x: mouseX,
    y: mouseY
  }

  socket.emit('mouse', mouse);

  // console.log('Sending: '+ mouseX + "," + mouseY);

  for(var i = 0; i < bricks.length; i++){
    bricks[i].display();
  }

  for(var i = 0; i < cursors.length; i++){
    cursors[i].display();
  }
}

function mousePressed(){
  for(var i =0; i < bricks.length; i++){
    bricks[i].click();
  }
}

function Brick(_id, _x, _y, _stato){
  this.id = _id;
  this.x = _x;
  this.y = _y;
  this.stato = _stato;
  this.w = 100;
  this.h = 50;

  this.display = function() {
    if (this.stato == true) {
      fill(255, 0, 0);
      rect(this.x, this.y, this.w, this.h);
    }
}


  this.click = function(){
      if(mouseX > this.x && mouseX < this.x + this.w){
        if(mouseY > this.y && mouseY < this.y + this.h){
          var a = cursors.find(cursor => cursor.x >= this.x && cursor.x <= this.x + this.w && cursor.y >= this.y && cursor.y <= this.y + this.h);
          if (a != undefined) {
            this.stato = false;
            var brickRef = firebase.database().ref('bricks/' + this.id);
            brickRef.update({stato: false});

            var data = this.id;
            socket.emit('clickBrick', data);
          }
      }
    }
  }
}

function Cursor(_x, _y, _id){
  this.x = _x;
  this.y = _y;
  this.id = _id;

  this.display = function(){
    fill('blue');
    ellipse(this.x, this.y, 50);
  }
}
