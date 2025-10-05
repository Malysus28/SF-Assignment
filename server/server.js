const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://127.0.0.1:27017";
const DB_NAME = "chatapp";
const HISTORY_LIMIT = 50;

async function main() {
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db(DB_NAME);

  const Users = db.collection("users");
  const Groups = db.collection("groups");
  const Messages = db.collection("messages");
  const GroupRequests = db.collection("group_requests");

  // Seed data only if DB empty
  if ((await Users.countDocuments()) === 0) {
    await Users.insertMany([
      {
        username: "Bella",
        birthdate: "2001-05-20",
        age: 10,
        email: "b@gmail.com",
        password: "123",
        valid: true,
        roles: ["Group-Admin"],
        groups: ["g1"],
      },
      {
        username: "Alex",
        birthdate: "2000-11-02",
        age: 5,
        email: "alex@gmail.com",
        password: "123",
        valid: true,
        roles: ["Super-Admin"],
        groups: ["g1", "g2", "g3"],
      },
      {
        username: "superadmin",
        birthdate: "2000-11-02",
        age: 5,
        email: "superadmin@gmail.com",
        password: "123",
        valid: true,
        roles: ["Super-Admin"],
        groups: ["g1", "g2", "g3"],
      },
      {
        username: "Malees",
        birthdate: "1998-08-15",
        age: 3,
        email: "malees@gmail.com",
        password: "123",
        valid: true,
        roles: ["User"],
        groups: ["g1"],
      },
    ]);
  }

  if ((await Groups.countDocuments()) === 0) {
    await Groups.insertMany([
      { id: "g1", name: "Peer Mentors" },
      { id: "g2", name: "Griffith Coding Club" },
      { id: "g3", name: "PASS Study Group" },
    ]);
  }

  const app = express();
  app.use(express.json());
  app.use(cors());

  // new login set to read from the mongo db
  app.post("/api/auth", async (req, res) => {
    const username = req.body?.username;
    const password = req.body?.password;
    const user = await Users.findOne({ username, password });
    if (!user)
      return res.status(401).json({ ok: false, error: "Invalid credentials" });

    const allGroups = await Groups.find({}).toArray();
    const groupNames = (user.groups || [])
      .map((id) => allGroups.find((g) => g.id === id)?.name)
      .filter(Boolean);

    res.json({
      ok: true,
      user: {
        username: user.username,
        birthdate: user.birthdate,
        age: user.age,
        email: user.email,
        roles: user.roles,
        valid: user.valid,
        groups: user.groups,
        groupNames,
      },
    });
  });

  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  // stuff in the memory
  const channelMembers = new Map();
  const membersOf = (ch) => Array.from(channelMembers.get(ch) || []);
  const addMember = (ch, name) => {
    const set = channelMembers.get(ch) || new Set();
    set.add(name);
    channelMembers.set(ch, set);
  };
  const removeMember = (ch, name) => {
    const set = channelMembers.get(ch);
    if (!set) return;
    set.delete(name);
    if (set.size === 0) channelMembers.delete(ch);
  };

  // get histroy from mongo (refer to mongo compasss)
  async function getHistory(channel) {
    return await Messages.find({ channel })
      .sort({ ts: -1 })
      .limit(HISTORY_LIMIT)
      .toArray()
      .then((arr) => arr.reverse());
  }

  io.on("connection", (socket) => {
    socket.data.username = null;
    socket.data.channel = null;

    socket.on("join", async ({ channel, user }) => {
      const username = user?.username || "anon";

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

      socket.join(channel);
      socket.data.username = username;
      socket.data.channel = channel;
      addMember(channel, username);

      const history = await getHistory(channel);
      socket.emit("chat:history", history);
      io.to(channel).emit("system:event", {
        type: "join",
        user: { username },
        ts: Date.now(),
      });
      io.to(channel).emit("presence", membersOf(channel));
    });

    socket.on("chat:message", async (msg) => {
      const channel = msg?.channel || socket.data.channel;
      if (!channel || !msg?.text) return;

      const safeMsg = {
        channel,
        user: { username: socket.data.username },
        text: msg.text,
        ts: Date.now(),
      };

      await Messages.insertOne(safeMsg);
      io.to(channel).emit("chat:message", safeMsg);
    });

    socket.on("disconnect", () => {
      const ch = socket.data.channel;
      if (!ch) return;
      removeMember(ch, socket.data.username);
      io.to(ch).emit("system:event", {
        type: "leave",
        user: { username: socket.data.username },
        ts: Date.now(),
      });
      io.to(ch).emit("presence", membersOf(ch));
    });
  });
  //group experiment

  //group experiment enf
  const PORT = 3000;
  server.listen(PORT, () =>
    console.log(`Server + Mongo running on http://localhost:${PORT}`)
  );
}

main().catch((err) => console.error("Server failed:", err));
