// process.exit();
// own;
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.url);

var WebSockets = require("ws");
var clients = {};

var adminkeys = require("./files/adminkeys.js");
//var adminRainbowPass = require("./files/adminRainbowPass.js");
var Room = require("./files/room.js");
var DummyRoom = require("./files/dummyroom.js");
var User = require("./files/user.js");
var config = require("./files/config.js");
var RoomWcoolbot = require("./files/roomwiththecoolbot.js");

var rooms = {
 // dum: new (require("./files/dummyroom.js")),
  cursoranimations: new (require("./files/cursoranimroom.js")),
  midi: new (require("./files/midiroom.js")),
  lobby: new Room("lobby", {}, {}),
  Bot: new RoomWcoolbot(), 
};

function sendServerTime() {
    Object.values(rooms).forEach(a => {
        a.sendArray([{
            m: "t",
            t: Date.now()
        }]); // broadcast time
    });
}

setInterval(sendServerTime, 2000); // send server time every 2000ms

function moveUserToChannel(user, channel, force) {
    let reject = () => user.sendArray([{
        class: "short",
        duration: 7000,
        m: "notification", 
        target: "#room",
        text: "You can't join that channel, did you get banned?",
        title: "Notice"
    }]); // Banned notice??
    let c = typeof channel === "string" ? rooms[channel] : channel; // Get actual channel
    if (force) return c.add(user); // force join idea was "inspired" by aeiou's mpp clone, but can come in very useful sometimes
    if (c._id === "illegalname") return reject(); // Bad room name lol
    if (c.connections.length < 1) return c.add(user); // lobby isn't full, allow them to join
    return reject(); // no conditions were met that let them in, just say something went wrong I guess
}

var Server = new WebSockets.Server({
    port: 8080 // Port 8080 cause why not
}); // Websocket server

var allUsers = []; // All the current users

var serversClosed = false;

Server.on("connection", (cws, req) => {
    let user = new User(req.headers['x-forwarded-for'].split(",")[0], cws);
    user.req = req;
    allUsers.push(user);
	
    cws.on("close", msg => {
        if (user.room) user.room.remove(user);
    }); // Disconnected? remove from the room!
	
    user.sendArray([{
        m: "hi",
        v: 3.0,
        codename: "test-mpp-server",
        u: user.getJSON()
    }]); // hi message, because it's kind!
  

  

  
   // return;
  
    if(serversClosed) return user.sendArray([{
      class: "long",
      duration: 7000,
      m: "notification", 
      target: "#piano",
      html: `<p style="font-size: 30px">Sorry!</p><br><p>The Server is down right now, sorry for the inconvenience.</p><br><p>The Server may be down for a reason:</p><br><p>Either I might be working on the server, or it got crashed.</p>`,
      title: "Notice"
    }]);
  
    
	
    user.setChannel = (msg, force) => {
        let oldroom = user.room;
        if(user.room && user.room.connectionscount) {
          user.room.connectionscount--;
          user.room.reload();
        }
        let prepared = false;
        if (!rooms[msg._id]) {
            console.log("Creating room");
            console.log({
                Room
            });
            user.prepareForNewRoom(msg._id);
            prepared = true;
            rooms[msg._id] = new Room(msg._id, (typeof msg.set === "object" ? msg.set : null), user);
            rooms[msg._id].deletefunc = function() {
              delete rooms[msg._id];
              delete this;
            }
            console.log("Created new room for ", msg._id);
        } else {
            console.log("Room", msg._id, "Already exists!");
        }
        if (oldroom) oldroom.remove(user);
        if (!prepared) user.prepareForNewRoom(msg._id);
        moveUserToChannel(user, rooms[msg._id], force);
    }; // Room stuff ;-;
	
    user.on("ch", msg => {
        if (user.room && user.room._id === msg._id) return;
        if (!msg.hasOwnProperty('_id')) return console.log("NO _ID");
        user.setChannel(msg);
        console.log("Appending user to", msg._id, "- ip is", user.realIP, "- uid is", user._id);
    })
  
    user.on("a", msg => {
        let serv = {
            name: "Server",
            _id: "server",
            id: "server",
          color: //"#"+Math.floor(Math.random()*10000000).toString(16)
          "#3a77d9"
        }; // Server profile?
        if (msg.message.length > 512) return console.log("MSG too long");
     
        if //(msg.message.startsWith(config.evalKey) ||
(msg.message.startsWith(">") && user.isAdmin) {
            console.log("Executing js");
            user.room.sendArray([{
              m: "a",
              a: "JavaScript -> " + msg.message.replace(config.evalKey, "").replace(">", ""),
              p: { ...user.getJSON(), _id: "" + user._id },
              t: Date.now()
            }]);
            try {
                user.room.sendArray([{
                    m: "a",
                    a: String(eval(msg.message.replace(config.evalKey, " ").replace(">", " "))),
                    p: { ...serv, //color: "#12F145"
                       },
                    t: Date.now()
                }]);
            } catch (e) {
                user.room.sendArray([{
                    m: "a",
                    a: String(e),
                    p: { ...serv, //color: "#F12345" 
                       },
                    t: Date.now()
                }]);
            }
            return console.log("JS thing done");
        };
      
        
if (msg.message.startsWith(adminkeys)) {
            user.room.sendArray([{
              m: "a",
              a: `Verified ${user.name} [${user._id}] as an admin.`,
              p: { ...serv, color: "#FFFFFF" },
              t: Date.now()
            }]);
             user.setAdmin(user._id);
            return console.log("Admin key set thing done");
        }
if (msg.message.startsWith("$rainbow")) {
      user.room.sendArray([
        {
          m: "a",
          a:
            `Added rainbow to user: ${user.name}. ${user.name}'s _ID: ${user._id}`,
          p: { ...serv},
          t: Date.now(),
        },
      ]);
 
      var count = 0;
      var size = 100;
      var rainbow = new Array(size);

      for (var i = 0; i < size; i++) {
        var red = sin_to_hex(i, (0 * Math.PI * 2) / 3); // 0   deg
        var blue = sin_to_hex(i, (1 * Math.PI * 2) / 3); // 120 deg
        var green = sin_to_hex(i, (2 * Math.PI * 2) / 3); // 240 deg

        rainbow[i] = "#" + red + green + blue;
      }

      function sin_to_hex(i, phase) {
        var sin = Math.sin((Math.PI / size) * 2 * i + phase);
        var int = Math.floor(sin * 127) + 128;
        var hex = int.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
      }

      setInterval(function () {
        if (count > rainbow.length) count = 0;
        count++;
        user.color = rainbow[count];
        user.globalReload();
        user.save();
      }, 100);
      return;
    }
      
               user.room.sendArray([{
            m: "a",
            a: msg.message,
            t: Date.now(),
            p: user.getJSON()
        }])
    });
	
    user.on("userset", msg => {
        if (typeof msg.set !== "object" || Array.isArray(msg.set)) return; // Bad message, refuse to continue running the code because it could cause a crash
        if (msg.set.name && msg.set.name.length <= 999) {
            user.name = msg.set.name; // change their name
            user.globalReload(); // resend user data for others in the room so the name update shows up
            user.save();
        };
      if (msg.set.color) {
        user.color = msg.set.color; user.globalReload(); // resend user data for others in the room so the name update shows up
            user.save();

      }
    });
	
    user.on("chown", msg => {
        if (!user.room.crown || user.room.crown.userId !== user._id) return; // No crown or the user dosen't have it, refuse crown action
        if (!user.room.findParticipantById(msg.id)) return; // Bad id, refuse crown action
        user.room.giveChown(user.room.findParticipantById(msg.id)); // Everything seems good, run crown action
    });
	
    user.on("m", msg => {
        user.room.where(c => c._id !== user._id /* Where filter will prevent the original user(s) on that ip from recieving their own cursor movement */).broadcast([{
            m: "m", // message type
            x: msg.x || 50, // mouse x or centre if not provided
            y: msg.y || 50, // mouse y or centre if not provided
            id: user.id // user id
        }]);
    });
	
    user.on("n", msg => {
        if (!msg.t || !msg.n || !Array.isArray(msg.n)) return; // don't broadcast invalid messages ig
        msg.n = msg.n.filter(c => c && c.n && c.n.length < 6 && (c.v ? (c.v = parseFloat(c.v)) : c.hasOwnProperty("s"))); // dumb note stuff
		
        user.room.where(c => c.prvlcid !== user.prvlcid /* Where filter will prevent the original user hearing the notes again */).broadcast([{
            m: "n", // message type
            n: msg.n, // note stuff
            t: msg.t, // message timing
            p: user.id // user id
        }]);
    });
	
    user.on("kickban", msg => {
		if(user.room) return; // The user isn't in a room so they can't kickban
        let args = [user, user.room.get(msg._id)[0], msg.ms]; // function arguments

        user.room.ban(...args); // use function arguments with spread syntax
		// The user has tried to ban someone
    });
	
    user.on("+ls", msg => {
        user.searchingForRooms = true; // Variable for room list broadcaster to pick up on
        user.sendArray([{
            m: "ls",
            u: Object.values(rooms).map(c => c.getJSON("list")) // every room, put into an array.
        }]);
		// The user has opened the room list, we're going to send them the current rooms array then allow the room list broadcast to send to them
    });
	
    user.on("-ls", msg => {
        user.searchingForRooms = false; // Variable for room list broadcaster to pick up on
		// The user has finished checking the rooms list, we can stop the room list broadcast from sending to them
    });
	
});

setInterval(() => {
    allUsers.filter(c => c.searchingForRooms).forEach(cr => {
        cr.sendArray([{
            m: "ls",
            u: Object.values(rooms).map(c => c.getJSON("list"))
        }]);
    });
}, 2000);