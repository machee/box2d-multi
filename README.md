This is an experiment with physics based multiplayer games in the browser using Box2D.

Ran this using Node.js v0.8.21 (been a while since I actually worked on it):

    npm install
    sudo node app.js

Browse to the server's address from multiple browsers.  Use the arrow keys to control the blue square.

Currently using WebSockets but I think there may be better options soon. Not to mention my implementation isn't great (too many updates per second I think).

