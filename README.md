#Planes - a simple browser based multiplayer game
Planes is a simple multiplayer game, that runs in browser and back-end runs on node.js

#Getting Started
To run Planes you first need to download node.js and this repository. You also need to have a mysql server running. First thing you need to do is to create a new database on your server called "planes". After that, change lines 11 and 12 in /server.js, so you have your mysql user and password instead of "root" and "". Now you can start the server. Open the terminal and navigate to the repository. Once in repository, execute this command: "node server.js". This will run a game server on port 8080.

#Built With

Node.js
  - express.js
  - socket.io
