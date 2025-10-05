const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
app.use(express.json());
app.use(cors());

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

// ✅ ADD: create an HTTP server from Express (instead of app.listen)
const server = http.createServer(app);

// ✅ ADD: attach Socket.IO to the same server
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*", // dev only; tighten for prod
  },
});

// chat handlers
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("join", ({ channel, user }) => {
    socket.join(channel);
    console.log(`${user?.username} joined ${channel}`);
  });

  socket.on("chat:message", (msg) => {
    // msg = { channel, user:{username}, text, ts }
    if (!msg?.channel || !msg?.text) return;
    io.to(msg.channel).emit("chat:message", msg);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
  });
});

//start server
var PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log("API + Socket.IO running at http://localhost:" + PORT);
});
