const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
app.use(express.json());
app.use(cors());

// User class defined, to be fixed tmrw
class User {
  constructor(username, birthdate, age, email, password, valid) {
    this.username = username;
    this.birthdate = birthdate;
    this.age = age;
    this.email = email;
    this.password = password;
    this.valid = valid;
  }
}

// hard-coded users
var users = [
  new User("Bella", "2001-05-20", 10, "b@gmail.com", "123", true),
  new User("Alex", "2000-11-02", 5, "alex@gmail.com", "123", true),
  new User("Malees", "1998-08-15", 3, "malees@gmail.com", "123", true),
];

// define the POST endpoint at api/auth
app.post("/api/auth", function (req, res) {
  // console.log("POST /api/auth", req.body);
  // contains data sent from front end email and password in req.body
  var email = req.body && req.body.email ? req.body.email : "";
  var password = req.body && req.body.password ? req.body.password : "";
  console.log(email, password);

  // loop through users to find a match and case sensitive when found take it and store it in foundUser variable
  // this section needs to get fixed
  var foundUser = null;
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (u.email === String(email) && u.password === String(password)) {
      foundUser = u;
      break;
    }
  }

  var safeUser = {
    username: foundUser.username,
    birthdate: foundUser.birthdate,
    age: foundUser.age,
    email: foundUser.email,
    // password: foundUser.password,
    valid: foundUser.valid,
  };

  res.json({ ok: true, user: safeUser });
  //res.send might be a better way to go about this.(alan's advice)
});

// start the server
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("API running at http://localhost:" + PORT);
});
