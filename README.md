
<p align="center">
<img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/cover.gif"
 </p>

### Table of Contents

1. [The Project](#the-project) <br>
  1a. [Context](#context) <br>
  1b. [Idea](#idea) <br>

2. [Design Challenges](#design-challenges) <br>
  2a. [Architecture](#architecture) <br>
  2b. [Visuals](#visuals) <br>
  2c. [Sounds](#sounds) <br>
  2d. [Interaction](#interaction) <br>

3. [Code Challenges](#code-challenges) <br>

4. [References](#references) <br>
  4a. [P5.js](#p5.js) <br>
  4b. [Firebase](#firebase) <br>
  4c. [Node.js](#node.js) <br>

5. [Credits](#credits) <br>

6. [Team Members](#team-members) <br>

7. [Course](#course) <br>


# The Project
Break the Wall is a one-day game which celebrates the anniversary of the fall of the Wall of Berlin, on the 30th of October. 

It's a reminder to always be against all kinds of divisions, whatever they are physical or psychological. Working side by side, users will be able to destroy the wall and be happy together.

## Context
We are living the years of the walls. Today, we live situations where humankind builds walls to separate nations, ethnicities and families. We took inspiration form the current historical events: The Mexico border wall, the Brexit, the Italian immigration policy issues and many more around the world. Moreover, we found our final inspiration from the Google doodle of the anniversary of Berlin's Wall fall.

## Idea
It's terrible to have a wall between us.

We wanted people to actually experience the feeling of division and "being on the other side", but also, to experience the joy of meeting who's behind the wall. 

At first, they are separated on two different sides, unable to see each other. To break free from this horrible situation they have to work together, showing that the more people are separated, the more they want to be together.

# Design Challenges
## Architecture
The game is divided in three main instances:

* A Tutorial at the start of the experience, explaining the game dynamics to the new user
* The actual game window, showing the wall and the online users interacting
* An info window, with the current status of the wall and players, and a brief description of the project

## Visuals
We chose a vector graphic style, making most of the elements with simple shapes of P5.js.<br>
The wall is designed to be the most concrete object of the game, in contrast with the users, whose cursors have a firefly-like appearance, underlining the difference of the hard nature of the wall and the emotional bondings between people.
<p align="center"><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/public/assets/tutorial2.gif"</p>
 
 The palette reminds of a nocturnal city landscape, with dark and cold colors for the wall, which would also make the lights of the cursors brighter. For the same reasons, we chose light and bright colors for the texts, making them more visibles.
<p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/fullpalette.png"</p>
 
 Lastly, we chose Roboto as our font. Since our experience is meant to be a Google doodle game, we used Google official type.
 <p><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/font.png"</p>

## Sounds
Users on different sides of the wall can't see each other, but they can hear the sounds the others are making on the other side. We used three different sound effects for three different distances: one weak knock, one louder hit and one metallic strike. This sounds are chosen to help the users to get closer to each other.

## Interactions
There are three main interactions in Break the Wall!

The first one happens when the user clicks on the wall, sending a sound to other side.

The second one is when the user receives the sound from other players.

And the last, but not the least, is when they click on the same brick, destroying it together.

<p align="center"><img src="https://github.com/drawwithcode/2019-group-08-1/blob/master/images/fatine%20insieme.gif"</p>
