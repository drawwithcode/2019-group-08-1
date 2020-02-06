var socket;
var reset;

//Array which contains all elements of the wall
var bricks = [];

function preload(){
}

function setup() {

  //The canvas's width is 3 times bigger than the windowWidth
  createCanvas(windowWidth*3, windowHeight);

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

  socket = io.connect('http://192.168.43.125:3000');
  socket.on('brickBack', clicker);

  reset = createButton('reset');
  reset.position(width/2, height/2);
  reset.mousePressed(turnback);

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
  console.log(getBrick);
}


function draw() {
  background('peachpuff');

  // console.log('Sending: '+ mouseX + "," + mouseY);

  // var data = {
  //   x: mouseX,
  //   y: mouseY
  // }

  // socket.emit('mouse', data);

  for(var i = 0; i < bricks.length; i++){
    bricks[i].display();
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
    if(mouseIsPressed){
      if(mouseX > this.x && mouseX < this.x + this.w){
        if(mouseY > this.y && mouseY < this.y + this.h){
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
