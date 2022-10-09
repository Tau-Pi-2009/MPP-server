var Hash = require("./hash.js");
var {
    salt,
    default_name
} = require("./config.js");

var fs = require("fs"); // file read/write

function ipfriendlyname(ip) {
  return Hash("IPwowcoolip" + salt + process.env.SALT + ip.replace(/\./g, "_")).slice(0, 30);
}

var loadUsers = true;

class User {
    constructor(ip, cws, profile = {}) {
      //jf
      
        if(loadUsers) {
          try { this.profileFromFS = fs.readFileSync(__dirname + "/../users/" + ipfriendlyname(ip) + ".dbf"); } catch (e) { };
          if(this.profileFromFS) try { console.log("Got profile: " + this.profileFromFS); profile = JSON.parse(this.profileFromFS); } catch (e) { } 
        };
      
        this.save = () => {
          try {
            if(loadUsers) fs.writeFileSync(__dirname + "/../users/" + ipfriendlyname(ip) + ".dbf", JSON.stringify(Object({
              name: this.name,
              color: this.color,
              _id: this._id,
              isAdmin: false,      })));
            console.log("Made file  " + ip + ".dbf" + ", They should be found on next restart");
          } catch (e) {
            console.log("Couldn't save a profile ; -;", e);
          }
        };
      
        this.ws = cws; // Websocket connection
      
        this.searchingForRooms = false; // for room list (ls, +ls, -ls) events
      
        this.firstID = true; // Not used I don't think

        this.realIP = ip; // Their true IP address
      
        this.fullHash = Hash(ip + salt); // Salted hash thing
      
        this.isAdmin = profile.isAdmin || false; // User has admin
      
        this.setAdmin = (id) => {
          this.isAdmin = id;
          this.save();
        };
      
        this._id = profile._id || this.fullHash.slice(0, 24); // _id
      
        this.color = profile.color || "#" + this.fullHash.slice(100, 106); // Color
      
        this.name = profile.name || default_name || "Anonymous"; // Default name
      
        this.id = Hash(this._id).slice(0, 24); // Default hash, should probably not assign at this point since it will be instantly changed when they connect to a room
      
        this.prvlcid = (Math.random() * 3800).toString(16); // I forgot what i was using this for, I think it was fixing notes being resent to the player
        this.getJSON = () => Object({
            name: this.name,
            color: this.color,
            _id: this._id,
            id: this.id
        }); // get JS Object for the user in question
      
        this.room = null; // user room, comes in handy when you need to broadcast to that room in the main server.js code
      
        this.sendArray = data => {
            if (this.ws.readyState === 1) {
                // Websocket is open
                try {
                    this.ws.send(JSON.stringify(data))
                    return {
                        status: "Success"
                    }
                } catch (error) {
                    return {
                        status: "Error",
                        message: error
                    };
                }
            } else {
                return {
                    status: "Closed"
                };
            }
            return {
                status: "Unknown"
            };
        }; // try to send an array, wierd error/failsafe protection stuff, returns an object for if theres a problem or if its fine
      
        this._events = {};
        this.on = (event, callback) => {
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(callback);
        }; // event stuff
      
        this.prepareForNewRoom = roomuid => {
            this.id = Hash(roomuid + this._id).slice(0, 24);
        }; // regenerates their id for a new room, designed so when they join a room on an endless amount of connections they should *ALL* have the same id
      
        this.globalReload = () => {
            this.room.connections.forEach(c => c.sendArray([{
                m: "p",
                ...this.getJSON()
            }]))
        }; // resend the user data for this person to the room, incase something like their name has been updated
      
        cws.on("message", msg => {
            // console.log(msg);
            try {
                let evts = JSON.parse(msg);
                for(let i in evts) {
                    let c = evts[i];
                    if (this._events[c.m]) { try { this._events[c.m].forEach(b => { try { b(c) } catch (e) { } }); } catch (e) { } }
                    if (c.m === "bye") {
                      cws.close();
                      break;
                    }
                };
            } catch (e) {

            }
        }); // Handle actual websocket data
      
    }
};

module.exports = User;