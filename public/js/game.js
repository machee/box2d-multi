
var init = function()
{
  var socket   = io.connect('http://10.10.220.210');
  var bodies   = {};
  var junk     = {};
  var playerId = false;
  var canvas   = document.getElementById('canvas').getContext('2d');


  socket.on('playerId', function(id) {
    playerId = id;
  });


  canvas.fillStyle = "rgb(0, 0, 0)";
  socket.on('update', function(data) {
    canvas.clearRect(0, 0, 600, 600);
    for (var id in data.b) {
      canvas.save();
      if (playerId && playerId == id) {
        canvas.fillStyle = "rgb(0, 0, 255)";
      }
      canvas.translate(data.b[id].x*30, data.b[id].y*-30);
      canvas.rotate(-data.b[id].a);
      canvas.fillRect(-15, -15, 30, 30);
      canvas.restore();
    }
    for (var id in data.j) {
      canvas.save();
      canvas.translate(data.j[id].x*30, data.j[id].y*-30);
      canvas.rotate(-data.j[id].a);
      canvas.strokeRect(
        data.j[id].w*-15, data.j[id].h*-15, 
        data.j[id].w*30, data.j[id].h*30
      );
      canvas.restore();
    }
  });

  window.addEventListener('keydown', function(key){
    switch (key.keyCode) {
      case 38: case 87:
        socket.emit('up', true);
        break;
      case 40:
        socket.emit('down', true);
        break;
      case 37:
        socket.emit('left', true);
        break;
      case 39:
        socket.emit('right', true);
        break;
    }
  });
  window.addEventListener('keyup', function(key){
    switch (key.keyCode) {
      case 38: case 87:
        socket.emit('up', false);
        break;
      case 40:
        socket.emit('down', false);
        break;
      case 37:
        socket.emit('left', false);
        break;
      case 39:
        socket.emit('right', false);
        break;
    }
  });
}

window.onload = init;
