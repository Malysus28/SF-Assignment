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

// channels
const channels = [
  // for group 1 peer mentors
  { id: "c1", groupId: "g1", name: "Upcoming Workshops for Trimester 1" },
  { id: "c2", groupId: "g1", name: "Events hosted by Peer Mentors" },
  { id: "c3", groupId: "g1", name: "Ask us Anything" },
  // for group 2 Griffith Coding Club
  { id: "c4", groupId: "g2", name: "Hackathon Info" },
  { id: "c5", groupId: "g2", name: "ICPC Competition" },
  { id: "c6", groupId: "g2", name: "Q&A" },
  // for group 3 PASS Study Group
  { id: "c7", groupId: "g3", name: "Interaction Design Module" },
  { id: "c8", groupId: "g3", name: "Software Frameworks Module" },
  { id: "c9", groupId: "g3", name: "Web App Dev Module" },
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
// map this id to name
function groupIdsToNames(ids = []) {
  return ids.map((id) => groups.find((g) => g.id === id)?.name).filter(Boolean);
}

// define the POST endpoint at api/auth
app.post("/api/auth", function (req, res) {
  // console.log("POST /api/auth", req.body);
  // contains data sent from front end email and password in req.body
  var username = req.body && req.body.username ? req.body.username : "";
  var password = req.body && req.body.password ? req.body.password : "";
  console.log(username, password);

  // loop through users to find a match and case sensitive when found take it and store it in foundUser variable
  // this section needs to get fixed
  var foundUser = null;
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (u.username === String(username) && u.password === String(password)) {
      foundUser = u;
      break;
    }
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
  //res.send might be a better way to go about this.(alan's advice)
});

// start the server
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("API running at http://localhost:" + PORT);
});
