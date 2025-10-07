const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

const mongodbURL = "mongodb://127.0.0.1:27017";
const mongodbName = "chatapp";
const chatHistLimit = 50;

async function main() {
  const mongo = new MongoClient(mongodbURL);
  await mongo.connect();
  const db = mongo.db(mongodbName);

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
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: "*" } });

  // new login set to read from the mongo db REST API login
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
      .limit(chatHistLimit)
      .toArray()
      .then((arr) => arr.reverse());
  }
  // socket sec start

  io.on("connection", (socket) => {
    socket.data.username = null;
    socket.data.channel = null;

    socket.on("join", async ({ channel, user }) => {
      const username = user?.username?.trim();
      if (!channel || !username) {
        socket.emit("system:event", {
          type: "error",
          message: "join requires both channel and user.username",
          ts: Date.now(),
        });
        return;
      }

      // Leave previous channel
      if (socket.data.channel) {
        const prev = socket.data.channel;
        socket.leave(prev);
        removeMember(prev, socket.data.username);
        io.to(prev).emit("system:event", {
          type: "leave",
          user: { username: socket.data.username },
          ts: Date.now(),
        });
        io.to(prev).emit("onlineUsers", membersOf(prev));
      }

      // Join new channel
      socket.join(channel);
      socket.data.username = username;
      socket.data.channel = channel;
      addMember(channel, username);

      // Send history to the chat
      const history = await getHistory(channel);
      socket.emit("chat:history", history);

      // Notify others
      io.to(channel).emit("system:event", {
        type: "join",
        user: { username },
        ts: Date.now(),
      });
      io.to(channel).emit("onlineUsers", membersOf(channel));
    });

    // MESSAGE label above: user/channel/ non-empty text
    socket.on("chat:message", async (msg) => {
      const channel = msg?.channel || socket.data.channel;
      const text = msg?.text?.trim();
      const username = socket.data.username;

      if (!channel || !text || !username) {
        socket.emit("system:event", {
          type: "error",
          message: "chat:message requires channel, text, and a joined user",
          ts: Date.now(),
        });
        return;
      }

      const safeMsg = {
        channel,
        user: { username },
        text,
        ts: Date.now(),
      };

      await Messages.insertOne(safeMsg);
      io.to(channel).emit("chat:message", safeMsg);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      const ch = socket.data.channel;
      const name = socket.data.username;
      if (!ch || !name) return;

      removeMember(ch, name);
      io.to(ch).emit("system:event", {
        type: "leave",
        user: { username: name },
        ts: Date.now(),
      });
      io.to(ch).emit("onlineUsers", membersOf(ch));
    });
  });

  //group experiment

  //group experiment end

  const PORT = 3000;
  server.listen(PORT, () =>
    console.log(`Server + Mongo running on http://localhost:${PORT}`)
  );
}

main().catch((err) => console.error("Server failed:", err));
