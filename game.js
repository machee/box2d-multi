var box2d   = require('box2dweb-commonjs').Box2D;

var b2Vec2         = box2d.Common.Math.b2Vec2;
var b2BodyDef      = box2d.Dynamics.b2BodyDef;
var b2Body         = box2d.Dynamics.b2Body;
var b2PolygonShape = box2d.Collision.Shapes.b2PolygonShape;
var b2FixtureDef   = box2d.Dynamics.b2FixtureDef;

 
// create the world//
var world = new box2d.Dynamics.b2World(new b2Vec2(0, -10), true);


// reusable fixture definition //
var fixture = new b2FixtureDef;
fixture.density = 0;


// static ground body //
fixture.shape = new b2PolygonShape;

var groundBodyDef = new b2BodyDef;

fixture.shape.SetAsBox(20, 1);

// bottom
groundBodyDef.position.Set(10, -20);
world.CreateBody(groundBodyDef).CreateFixture(fixture);

// top
groundBodyDef.position.Set(10, 0);
world.CreateBody(groundBodyDef).CreateFixture(fixture);

fixture.shape.SetAsBox(1, 20);

//left
groundBodyDef.position.Set(0, -10);
world.CreateBody(groundBodyDef).CreateFixture(fixture);

//right
groundBodyDef.position.Set(20, -10);
world.CreateBody(groundBodyDef).CreateFixture(fixture);


// dynamic bodies //
fixture.density = 1;
fixture.friction = .3;
fixture.restitution = .5;

var bodyDef = new b2BodyDef;
bodyDef.type = b2Body.b2_dynamicBody;

var junk = {};
function makeJunk(id) {
  junk[id] = {};
  junk[id].width  = (Math.random()+.1);
  junk[id].height = (Math.random()+.1);
  fixture.shape.SetAsBox(junk[id].width/2, junk[id].height/2);
  bodyDef.position.Set(Math.random()*15+2.5, Math.random()*-10-2);
  junk[id].body = world.CreateBody(bodyDef)
  junk[id].body.CreateFixture(fixture);
}
function resetJunk() {
  for (var x in junk) {
    world.DestroyBody(junk[x].body);
  }

  junk = {};

  for (var x=0;x<125;x++) {
    makeJunk(x);
  }
}
resetJunk();


// the loop //
var lastLoop = process.uptime();
var message  = {'type':'update'};
var bodies   = {};

var junktime = 0;
var junkid = 0;

var loop = function(callback) {
  var runs = 0;
  var report = false;
  while (process.uptime() - lastLoop >= 1/60) {
    if (runs > 0 && !(runs%60)) {
      console.log((process.uptime() - lastLoop) + ' behind...');
      if (process.uptime() - lastLoop >= 1) {
        break;
      }
      report = true;
    }

    lastLoop += 1/60;

    for (var id in bodies) {
      var vel = bodies[id].body.GetLinearVelocity();
      var pos = bodies[id].body.GetPosition();
      var topSpeed = 10;
      var impulse  = .5;
      if (bodies[id].up) {
        if (vel.y < topSpeed) {
          bodies[id].lastUpImpulse += impulse;
          bodies[id].body.ApplyImpulse(
            new b2Vec2(0, bodies[id].lastUpImpulse), 
            new b2Vec2(pos.x, pos.y)
          );
        } else {
          bodies[id].lastUpImpulse = 0;
        }
      } else if (bodies[id].down) {
        if (vel.y > -topSpeed) {
          bodies[id].body.ApplyImpulse(new b2Vec2(0, -impulse), new b2Vec2(pos.x, pos.y));
        }
      }
      if (bodies[id].left) {
        if (vel.x > -topSpeed) {
          bodies[id].body.ApplyImpulse(new b2Vec2(-impulse, 0), new b2Vec2(pos.x, pos.y));
        }
      } else if (bodies[id].right) {
        if (vel.x < topSpeed) {
          bodies[id].body.ApplyImpulse(new b2Vec2(impulse, 0), new b2Vec2(pos.x, pos.y));
        }
      }
    }

    if (junktime >= 15) {
      if (junkid >= 125) {
        junkid = 0;
      }
      world.DestroyBody(junk[junkid].body);
      makeJunk(junkid);
      junkid++;
      junktime = 0;
    }

    world.Step(1/60, 5, 2);

    runs++;
    junktime++;
  }

  if (runs) {
    message.data = {};
    message.data.b = {};
    for (var id in bodies) {
      message.data.b[id] = bodies[id].body.GetPosition();
      message.data.b[id].a = bodies[id].body.GetAngle();
    }
    message.data.j = {};
    for (var id in junk) {
      message.data.j[id] = junk[id].body.GetPosition();
      message.data.j[id].a = junk[id].body.GetAngle();
      message.data.j[id].w = junk[id].width;
      message.data.j[id].h = junk[id].height;
    }
    process.send(message);

    if (report) {
      console.log('Stepped '+runs+' times during one interval.');
    }
  }

  setImmediate(function(){callback(callback);});
};

function newPlayer(id) {
  fixture.shape.SetAsBox(.5, .5);
  bodyDef.position.Set(10+(Math.random()-.5), -3+(Math.random()-.5));
  bodies[id] = {
    'up':false,'down':false,'left':false,'right':false,
    'lastUpImpulse':0
  };
  bodies[id].body = world.CreateBody(bodyDef);
  bodies[id].body.CreateFixture(fixture);
}

function playerLeft(id) {
  world.DestroyBody(bodies[id].body);
  delete bodies[id];
}

function resetBodies() {
  for (var id in bodies) {
    playerLeft(id);
    newPlayer(id);
  }
  resetJunk();
}

function go(id, pressed, dir) {
  bodies[id][dir] = pressed;
}

process.on('message', function(message) {
  switch (message.type) {
    case 'reset':
      resetBodies();
      break;
    case 'newPlayer':
      newPlayer(message.data);
      break;
    case 'playerLeft':
      playerLeft(message.data);
      break;
    case 'up': case 'down': case 'left': case 'right':
      go(message.data.id, message.data.pressed, message.type);
      break;
  }
});


loop(loop);


