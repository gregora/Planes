var socket = io();

if (localStorage.cash) {

  document.getElementById("cash").innerHTML = "Cash: " + localStorage.cash + "$";

}

var players = [];
var objects = [];

if (localStorage.user) {

  var loggedin = localStorage.user;
  document.getElementById("link").innerHTML = "Log out(" + localStorage.name + ")";

} else {

  var loggedin = false;

}

var id = 0;

var unCoef = 1;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var trees = [];

var islandImg = new Image();
islandImg.src = "/images/island.png";

var island2Img = new Image();
island2Img.src = "/images/island2.png";

var island3Img = new Image();
island3Img.src = "/images/island3.png";

var island4Img = new Image();
island4Img.src = "/images/island4.png";

var plImg = new Image();

var plane = "/images/fighter.png"

var img = new Image();
img.src = plane;

socket.on("giveId", function(data) {

  id = data.id;
  players = data.data;
  //console.log("got id: "+data.id);

});


socket.on("data", function(data) {

  orCash = cash;
  players = data[0];
  objects = data[1];


});


socket.on("cash", function(data) {

  cash = data;
  localStorage.cash = cash;

  if (cash != false && orCash != cash) {

    document.getElementById("cash").innerHTML = "Cash: " + cash + "$";

  }

});

function start(airplane) {


  if (airplane == "comm") {

    plane = "/images/airplane.png";


  } else {

    plane = "/images/fighter.png";

  }

  socket.emit('join', [plane, loggedin, localStorage.name]);

  img.src = plane;

  document.getElementById("menu").style.display="block";

  x = document.getElementsByClassName("hide");

  for (var i in x) {

    x[i].style.display = "none";

  }






}


function menu(){

  socket.emit("clientDisconnect", "disconnect");

  document.getElementById("menu").style.display="none";

  x = document.getElementsByClassName("hide");

  for (var i in x) {

    x[i].style.display = "block";

  }

}

socket.on("serverDisconnect", function(res){

  menu();

  document.getElementById("menu").style.display="none";

  x = document.getElementsByClassName("hide");

  for (var i in x) {

    x[i].style.display = "block";

  }

});


setInterval(frame, 20);



function frame() {

  //get all info


  x = players[id].x;
  y = players[id].y;
  ang = players[id].ang;


  //console.log(x, y, ang);


  height = window.innerHeight;
  width = window.innerWidth;


  unit = (height + width) / 500 * unCoef; //1 unit = 10m

  un = unit;

  canvas.height = height;
  canvas.width = width;

  ctx.translate(width / 2, height / 2);

  ctx.rotate(-ang * Math.PI / 180);




  //draw islands


  ctx.drawImage(islandImg, -x * unit, y * unit, 400 * unit, 400 * unit);

  ctx.drawImage(island2Img, (800 - x) * unit, (y - 800) * unit, 300 * unit, 300 * unit);

  ctx.drawImage(island3Img, (200 - x) * unit, (y - 1000) * unit, 500 * unit, 500 * unit);

  ctx.drawImage(island4Img, (3000 - x) * unit, (y - 5000) * unit, 500 * unit, 500 * unit);



  //draw other players


  for (pl in players) {

    if (players[pl].id != id && players[pl].socketId != "no" && players[pl].airplane != false) {


      relPosX = x - players[pl].x;
      relPosY = y - players[pl].y;


      ctx.translate(-(relPosX) * unit, (relPosY) * unit);

      ctx.rotate(players[pl].ang * Math.PI / 180);


      plImg.src = players[pl].airplane;

      if (unCoef < 0.2) {

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(-3, 2);
        ctx.lineTo(0, -5);
        ctx.lineTo(3, 2);
        ctx.fill();
        ctx.fillStyle = "black";

      } else {

        ctx.drawImage(plImg, -10 * unit, -10 * unit, 20 * unit, 20 * unit);
        ctx.fillStyle = "black";
        ctx.lineWidth = 1;
        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(players[pl].name, 0, 20 * unit);

      }

      ctx.rotate(-players[pl].ang * Math.PI / 180);

      ctx.translate((relPosX) * unit, -(relPosY) * unit);



    }

  }


  //draw objects

  for (ob in objects) {


    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc((objects[ob].x - x) * unit, (y - objects[ob].y) * unit, 10 * unit, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "black";


  }




  //draw the player


  ctx.rotate(ang * Math.PI / 180);



  if (unCoef < 0.2) {

    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.lineTo(0, -5);
    ctx.lineTo(3, 2);
    ctx.fill();
    ctx.fillStyle = "black";


  } else {

    ctx.drawImage(img, -10 * unit, -10 * unit, 20 * unit, 20 * unit);

  }





}


document.onkeypress = function(e) {
  e = e || window.event;

  //console.log(e.keyCode);

  if (e.keyCode == 97) {
    //a
    socket.emit("key", "a");
  } else if (e.keyCode == 100) {
    //d
    socket.emit("key", "d");

  } else if (e.keyCode == 43 && unCoef < 17.9) {

    unCoef = unCoef * 1.1;

  } else if (e.keyCode == 45 && unCoef > 0.012) {

    unCoef = unCoef / 1.1;

  }
};

function speed() {

  socket.emit("speed", document.getElementById("slider").value);

}
