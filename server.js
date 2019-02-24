var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
var mysql = require("mysql");


//connect to mysql

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "planes",
  insecureAuth : true
});

con.connect(function(err) {
  if (err) throw err;


  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json());

  players = [ /*{"x": 5, "y": 0, "speed": 0, "id":0, "speed":0, "ang": 0, "socketId": "dadfasdf"}*/ ];

  objects = [];

  setInterval(addObjects, 20000);


//airplanes data

  airplanes = {
    "comm": {
      spcoef: 1,
      tucoef: 1,
      width: 20,
      height: 20,
    },
    "fighter": {
      spcoef: 1.5,
      tucoef: 3,
      width: 10,
      height: 10,
    },
  };


//set up web server

  app.use(express.static('public'));

  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });

  app.get("/login", function(req, res) {

    res.sendFile(__dirname + '/public/login.html');

  });

  //sign up

  app.post("/signup", function(req, res) {

    name = req.body.name;
    password = req.body.password;
    newId = Math.random() * Math.pow(10, 8);
    newId = newId.toFixed(0);



    sql = "SELECT * FROM users WHERE name = " + mysql.escape(name);


    con.query(sql, function(err, result) {
      if (err) throw err;
      if (result.length > 0 || name == "" || password == "") {

        res.write("error");
        res.end();

      } else {

        sql = "INSERT INTO users (id, name, password, cash, bullets) VALUES ?"

        values = [
          [newId, name, password, 0, 0]
        ];


        con.query(sql, [values], function(err, result) {
          if (err) throw err;
        });

        res.write(JSON.stringify([newId, name, 0]));
        res.end();

      }
    });





  });

  //log in

  app.post("/loginup", function(req, res) {

    name = req.body.name;
    password = req.body.password;

    sql = "SELECT * FROM users WHERE name = " + mysql.escape(name) + " AND password =" + mysql.escape(password);


    con.query(sql, function(err, result) {

      if (result.length > 0) {

        res.write(JSON.stringify([result[0].id, result[0].name, result[0].cash]));

      } else {

        res.write("error");

      }

      res.end();

    });


  });


  //start the server

  server.listen(8080);
  console.log("listening at port 8080");

  //wait for socket connection

  io.on('connection', function(socket) {

    console.log("A player has connected. Socket Id: " + socket.id);

    var userId = players.length;

    var cash = 0;

    //initial message

    socket.emit("giveId", {
      "id": userId,
      "data": players
    });

    //add player

    players.push({
      "id": userId,
      "airplane": false,
      "name": false,
      "x": 0,
      "y": 0,
      "speed": 0,
      "ang": 0,
      "socketId": socket.id,
    });

    //send data

    socket.emit("data", [players, objects]);


    socket.on("clientDisconnect", function(res){

      players[userId] = {
        "socketId": "no"
      };

    });


    socket.on('join', function(data) {

      players[userId]={
        "id": userId,
        "airplane": false,
        "name": false,
        "x": 1000*Math.random(),
        "y": 1000*Math.random(),
        "speed": 0,
        "ang": 0,
        "socketId": socket.id,
      };


      players[userId].airplane = data[0];
      loggedin = data[1];
      username = data[2];
      if (username) {} else {
        username = "guest"
      }
      players[userId].name = username;

      sql = "SELECT * FROM users WHERE id = " + mysql.escape(loggedin);


      con.query(sql, function(err, result) {
        if (err) throw err;
        if (result.length > 0) {

          cash = result[0].cash;
          giveCash();

        }
      });


      //calculate for each player

      setInterval(calculate, 20);

    });


    function giveCash() {

      socket.emit("cash", cash);

    }


    //this function runs every 50ms
    //it recalculates player's position and if it is touching any objects

    function calculate() {

      x = players[userId].x;
      y = players[userId].y;
      ang = players[userId].ang;
      speed = players[userId].speed;
      apname = players[userId].airplane;

      if (apname == "/images/airplane.png") {

        spcoef = airplanes.comm.spcoef;

      } else {

        spcoef = airplanes.fighter.spcoef;

      }

      for (ob in objects) {

        xDif = x - objects[ob].x;
        yDif = y - objects[ob].y;

        if (Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2)) <= 20) {

          objects.splice(ob, 1);


          sql = "UPDATE users SET cash=cash+1 WHERE id = " + mysql.escape(loggedin);



          con.query(sql, function(err, result) {

            console.log("added cash to player");
            cash = cash + 1;
            giveCash();

          });

          break;

        }

      }



      players[userId].y = y - Math.sin((ang - 90) * Math.PI / 180) * (speed + 10) * spcoef / 50;
      players[userId].x = x + Math.cos((ang - 90) * Math.PI / 180) * (speed + 10) * spcoef / 50;

      //console.log(cash);

      socket.emit("data", [players, objects]);

    }

    socket.on("key", function(data) {

      apname = players[userId].airplane;

      if (apname == "/images/airplane.png") {

        tucoef = airplanes.comm.tucoef;

      } else {

        tucoef = airplanes.fighter.tucoef;

      }

      if (data == "a") {

        players[userId].ang = players[userId].ang - 0.2 * tucoef;

      } else if (data == "d") {

        players[userId].ang = players[userId].ang + 0.2 * tucoef;

      } else if (data == "-2") {

        players[userId].ang = players[userId].ang - 2 * tucoef;

      } else if (data = "+2") {

        players[userId].ang = players[userId].ang + 2 * tucoef;


      }

    });

    socket.on("speed", function(data) {

      if(data>100){

        data=100;

      }

      players[userId].speed = data / 4;

    });

    socket.on("disconnect", function() {

      console.log("A player has disconnected. Socket Id: " + socket.id);
      players[userId] = {
        "socketId": "no"
      };

    });

  });


  //add "baloons". If player touches them he gets 1$

  function addObjects() {

    if (objects.length < 3) {

      objects.push({
        "x": 1500 * Math.random(),
        "y": 1500 * Math.random(),
      });

    }

  }


});
