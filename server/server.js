const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
app.use(express.json());
app.use(cors());

//chat histroy
const HistoryMsgLimit = 50; // how many messages to send on join
const channelHistory = new Map();
const channelMembers = new Map(); // channel username

//experimenting socket.io
function getHistory(channel, limit = HistoryMsgLimit) {
  const list = channelHistory.get(channel) || [];
  return list.slice(-limit);
}

function pushHistory(channel, msg) {
  const list = channelHistory.get(channel) || [];
  list.push(msg);
  if (list.length > 500) list.splice(0, list.length - 500);
  channelHistory.set(channel, list);
}

function addMember(channel, username) {
  const set = channelMembers.get(channel) || new Set();
  set.add(username);
  channelMembers.set(channel, set);
}

function removeMember(channel, username) {
  const set = channelMembers.get(channel);
  if (!set) return;
  set.delete(username);
  if (set.size === 0) channelMembers.delete(channel);
}

function membersOf(channel) {
  return Array.from(channelMembers.get(channel) || []);
}
//MY EXPERIMENT SOCKET END

// roles
const Roles = {
  SuperAdmin: "Super-Admin",
  GroupAdmin: "Group-Admin",
  USER: "User",
};

const groups = [
  { id: "g1", name: "Peer Mentors" },
  { id: "g2", name: "Griffith Coding Club" },
  { id: "g3", name: "PASS Study Group" },
];

// User class defined, to be fixed tmrw
class User {
  constructor(
    id,
    username,
    birthdate,
    age,
    email,
    password,
    valid,
    roles,
    groups
  ) {
    this.id = id;
    this.username = username;
    this.birthdate = birthdate;
    this.age = age;
    this.email = email;
    this.password = password;
    this.valid = valid;
    this.roles = roles || [Roles.USER];
    this.groups = groups || [];
  }
}

// hard-coded users
var users = [
  new User(
    "uid1",
    "Bella",
    "2001-05-20",
    10,
    "b@gmail.com",
    "123",
    true,
    [Roles.GroupAdmin],
    ["g1"]
  ),
  new User(
    "uid2",
    "Alex",
    "2000-11-02",
    5,
    "alex@gmail.com",
    "123",
    true,
    [Roles.SuperAdmin],
    ["g1", "g2", "g3"]
  ),
  new User(
    "uid3",
    "superadmin",
    "2000-11-02",
    5,
    "superadmin@gmail.com",
    "123",
    true,
    [Roles.SuperAdmin],
    ["g1", "g2", "g3"]
  ),
  new User(
    "uid4",
    "Malees",
    "1998-08-15",
    3,
    "malees@gmail.com",
    "123",
    true,
    [Roles.USER],
    ["g1"]
  ),
];
//used to convert the group id to readable names so that i can show that in the profile page.
function groupIdsToNames(ids = []) {
  return ids.map((id) => groups.find((g) => g.id === id)?.name).filter(Boolean);
}

// this is for the login authentication
app.post("/api/auth", function (req, res) {
  var username = req.body && req.body.username ? req.body.username : "";
  var password = req.body && req.body.password ? req.body.password : "";
  console.log(username, password);

  // loop through users to find a match and case sensitive when found take it and store it in foundUser variable
  var foundUser = null;
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (u.username === String(username) && u.password === String(password)) {
      foundUser = u;
      break;
    }
  }

  // test
  if (!foundUser) {
    return res.status(401).json({ ok: false, error: "Invalid credentials" });
  }

  var safeUser = {
    username: foundUser.username,
    birthdate: foundUser.birthdate,
    age: foundUser.age,
    email: foundUser.email,
    roles: foundUser.roles,
    valid: foundUser.valid,
    groups: foundUser.groups,
    groupNames: groupIdsToNames(foundUser.groups),
  };

  res.json({ ok: true, user: safeUser });
});

// create an HTTP server from Express (instead of app.listen)
const server = http.createServer(app);

// attach Socket.IO to the smy server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// chat handlers
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  // remember who/where this socket is
  socket.data.username = null;
  socket.data.channel = null;

  socket.on("join", ({ channel, user }) => {
    const username = user?.username || "anon";

    // if switching rooms, clean up previous presence
    if (socket.data.channel) {
      const prev = socket.data.channel;
      socket.leave(prev);
      removeMember(prev, socket.data.username);
      io.to(prev).emit("system:event", {
        type: "leave",
        user: { username: socket.data.username },
        ts: Date.now(),
      });
      io.to(prev).emit("presence", membersOf(prev));
    }

    // join the new room
    socket.join(channel);
    socket.data.username = username;
    socket.data.channel = channel;

    // presence + history + join notice
    addMember(channel, username);
    socket.emit("chat:history", getHistory(channel));
    io.to(channel).emit("system:event", {
      type: "join",
      user: { username },
      ts: Date.now(),
    }); // notify room
    io.to(channel).emit("presence", membersOf(channel)); // broadcast current members
    console.log(`${username} joined ${channel}`);
  });

  socket.on("chat:message", (msg) => {
    const channel = msg?.channel || socket.data.channel;
    if (!channel || !msg?.text) return;

    const safeMsg = {
      channel,
      user: { username: socket.data.username || msg?.user?.username || "anon" },
      text: String(msg.text),
      ts: msg.ts || Date.now(),
    };

    pushHistory(channel, safeMsg);
    io.to(channel).emit("chat:message", safeMsg);
  });

  socket.on("leave", () => {
    const channel = socket.data.channel;
    if (!channel) return;
    socket.leave(channel);
    removeMember(channel, socket.data.username);
    io.to(channel).emit("system:event", {
      type: "leave",
      user: { username: socket.data.username },
      ts: Date.now(),
    });
    io.to(channel).emit("presence", membersOf(channel));
    socket.data.channel = null;
  });

  socket.on("disconnect", () => {
    const channel = socket.data.channel;
    if (channel) {
      removeMember(channel, socket.data.username);
      io.to(channel).emit("system:event", {
        type: "leave",
        user: { username: socket.data.username },
        ts: Date.now(),
      });
      io.to(channel).emit("presence", membersOf(channel));
    }
    console.log("socket disconnected", socket.id);
  });
});

//start server
var PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log("API + Socket.IO running at http://localhost:" + PORT);
});
