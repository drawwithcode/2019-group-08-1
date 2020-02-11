
<p align="center">
<img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/cover2.gif"
 </p>

### Table of Contents

1. [The Project](#the-project) <br>
  1a. [Context](#context) <br>
  1b. [Idea](#idea) <br>

2. [Design Challenges](#design-challenges) <br>
  2a. [Architecture](#architecture) <br>
  2b. [Visuals](#visuals) <br>
  2c. [Sounds](#sounds) <br>
  2d. [Interactions](#interactions) <br>

3. [Code Challenges](#code-challenges) <br>

4. [References](#references) <br>
  4a. [P5.js](#p5.js) <br>
  4b. [Node.js](#node.js) <br>
  4c. [Firebase](#firebase) <br>
  4d. [Heroku](#heroku) <br>

5. [Credits](#credits) <br>

6. [Team Members](#team-members) <br>

7. [Course](#course) <br>


# The Project
Break the Wall is a one-day desktop game which celebrates the anniversary of the fall of the Wall of Berlin, on the 30th of October. 

It's a reminder to always be against all kinds of divisions, whatever they are physical or psychological. Working side by side, users will be able to destroy the wall and be happy together.

## Context
We are living the years of the walls. Today, we live situations where humankind builds walls to separate nations, ethnicities and families. We took inspiration form the current historical events: The Mexico border wall, the Brexit, the Italian immigration policy issues and many more around the world. Moreover, we found our final inspiration from the Google doodle of the anniversary of Berlin's Wall fall.

## Idea
It's terrible to have a wall between us.

We wanted people to actually experience the feeling of division and "being on the other side", but also, to experience the joy of meeting who's behind the wall. 

At first, they are separated on two different sides, unable to see each other. To break free from this horrible situation they have to work together, showing that the more people are separated, the more they want to be together.

<p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/fatine%20insieme.gif"</p>

# Design Challenges
## Architecture
The game is divided in three main instances:

* A Tutorial at the start of the experience, explaining the game dynamics to the new user
* The actual game window, showing the wall and the online users interacting
* An info window, with the current status of the wall and players, and a brief description of the project

## Visuals
We chose a vector graphic style, making most of the elements with simple shapes of P5.js.<br>
The wall is designed to be the most concrete object of the game, in contrast with the users, whose cursors have a firefly-like appearance, underlining the difference of the hard nature of the wall and the emotional bondings between people.
<p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/break.gif"</p>
 
 The palette reminds of a nocturnal city landscape, with dark and cold colors for the wall, which would also make the lights of the cursors brighter. For the same reasons, we chose light and bright colors for the texts, making them more visibles.
<p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/fullpalette.png"</p>
 
 Lastly, we chose Roboto as our font. Since our experience is meant to be a Google doodle game, we used Google official type.
 <p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/font.png"</p>

## Sounds
Users on different sides of the wall can't see each other, but they can hear the sounds the others are making on the other side. We used three different sound effects for three different distances: one weak knock, one louder hit and one metallic strike. This sounds are chosen to help the users to get closer to each other.

## Interactions
There are three main interactions in Break the Wall!

* The first one happens when the user clicks on the wall, sending a sound to other side.

* The second one is when the user receives the sound from other players.

* And the last, but not the least, is when they click on the same brick, destroying it together.

When the users destroy the entire wall, a text will appear, displaying how many people cooperated to break the wall.

<p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/finalfinal.gif"</p>
 
 # Code Challenges
 To make this project we had to code and think a lot of ways to find solutions to get the result we wanted. <br>
 These are some examples of coding solutions we used:
 
 * Cursor display <br>
 To give the user's cursor a firefly-like appearance, we created an object which follows the mouse and keeps track of its previous positions.
 
 ```javascript
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
 
 ```
 
  * Aura display <br>
  We needed to give the user a visual feedback when they click. So we designed an animation using another object displaying the "echo" of the click
  
 ```
 function Aura(){
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
 
 ```
 
  * Cursors management <br>
  This is how we managed to display the cursors of the other users on each device connected.
  
   What happens on the emitter client:
 ```
 // Emit the mouse position to the server
 var mousePosition = {
   x: mouseX,
   y: mouseY,
   side: mySide,
 }
 socket.emit('mouse', mousePosition);
 ```
   What happens on the server:
 
 ```
 // receive the MOUSE POSITION from client and broadcast it to other clients adding the USER ID
 socket.on('mouse', function(data) {
    var mouseData = {
      x: data.x,
      y: data.y,
      id: socket.id,
      side: data.side,
    }

    socket.broadcast.emit('posMouse', mouseData);
  });
 ```
   What happens on the receiver client:
 
 ```
 // Receive the MOUSE POSITIONS of the other clients and add the new users to the CURSORS array
 socket.on('posMouse', mousePos);

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
 
 ```
 
  * Wall <br>
  To give our wall the classic positioning of the bricks, we had to code two for loops with an offset position on the odd rows of the wall.
  
 ```
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
 
 ```
 
 # References
 ## P5.js
 We used this library to make the graphics of the game and the client-side of the experience. We used our knowledge gained in the course to manage interactions, animations and sounds.
 
 ## Node.js
 Thanks to Node.js, we've been able to script the server-side of the game, connecting users from different devices and locations on the same instance of the website. Throught Node.js we used two frameworks:
 
 * Socket.io: To manage the emitters and the listeners, to connect server and clients.
 * Express: To develop the server in an easier way.
 
 ## Firebase
 With this free database service hosted by Google, we've been able to manage the status of the bricks, and to keep track of the number of users joining our website.
 
 ## Heroku
 A web server where we published our website.
 
 # Credits
 * The Coding Train on Youtube <br>
 Daniel Shiffman has helped us understanding <br>
 how Firebase and Node.js work.
 
 * CodePen.io <br>
 We found interesting visual inspirations on this <br>
 website, which we applied to our project.
 
 * StackOverflow.com <br>
 Everytime we had troubles and questions, Google <br>
 leaded us to this website where we found very helpful answers.
 
 
 # Team Members
 * Martina Melillo (u w u)
 * Alessandro Piredda (^ - ^)
 * Alessandro Quets (ಡ ω ಡ)
 
 # Course
 Creative Coding 2019/2020 (https://drawwithcode.github.io/2019/) <br>
 Politecnico di Milano - Scuola del Design

 Teachers: Michele Mauri, Andrea Benedetti
