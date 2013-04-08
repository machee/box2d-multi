This is an experiment with physics based multiplayer games in the browser using Box2D.

Tested using Node.js v0.10.2:

    npm install
    sudo node app.js

Browse to the server's address from multiple browsers.  Use the arrow keys to control the blue square.

Currently using WebSockets but I think WebRTC will be a be better option soon. Not to mention my implementation isn't great (too many updates per second I think).

