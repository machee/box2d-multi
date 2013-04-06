var express = require('express')
  , app     = express()
  , server  = require('http').createServer(app)
  , sio      = require('socket.io').listen(server)
  ;

sio.set('log level', 1);

// game process //
var game = require('child_process').fork('game.js');


// http server //
server.listen(80);


// express routes //
app.get('/', function (req, res) {
  res.sendfile('page.html');
});

// reset game
app.get('/reset', function (req, res) {
  res.end();
  console.log('resetting bodies');
  game.send({'type':'reset'});
});

app.use('/', express.static('public'));

var state = false;

// socket.io events //
sio.sockets.on('connection', function (socket) {
  console.log('new player: ' + socket.id);
  game.send({'type':'newPlayer','data':socket.id});

  socket.emit('playerId', socket.id);

  socket.on('disconnect', function () {
    console.log('player left: ' + socket.id);
    game.send({'type':'playerLeft','data':socket.id});
  });

  socket.on('up', function(data) {
    game.send({'type':'up','data':{'pressed':data,'id':socket.id}});
  });
  socket.on('down', function(data) {
    game.send({'type':'down','data':{'pressed':data,'id':socket.id}});
  });
  socket.on('left', function(data) {
    game.send({'type':'left','data':{'pressed':data,'id':socket.id}});
  });
  socket.on('right', function(data) {
    game.send({'type':'right','data':{'pressed':data,'id':socket.id}});
  });
});


// send game updates //
game.on('message', function(message) {
  state = message.data;
});


setTimeout(function() {
  if (state) {
    sio.sockets.emit('update', state);
  }

  setTimeout(arguments.callee, 50);
}, 100);

