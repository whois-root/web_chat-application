const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const mysql = require("./db");
const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 4000;

let member_active_count = 0,
  new_member;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("loading");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/submitData", async function (req, res) {
  let { username, age } = req.body;
  let searchUser = await mysql.searchUser(username);
  if (searchUser.length === 0) {
    let uri_id = Buffer.from(username, "utf-8").toString("base64");
    mysql.newUser([username, age, uri_id, 1]);
    member_active_count = member_active_count + 1;
    new_member = username;
    res.redirect(`/chat/${uri_id}`);
  } else if (!searchUser[0].is_active) {
    mysql.updateStatus([1, searchUser[0].chat_token]);
    member_active_count = member_active_count + 1;
    new_member = username;
    res.redirect(`/chat/${searchUser[0].chat_token}`);
  } else {
    console.log("User with this username is already in the group chat!");
    res.redirect("/login");
  }
  return;
});

app.get("/chat/:chat_id", async function (req, res) {
  let chat_id = req.params.chat_id;
  const user_data = await mysql.thisUser(chat_id);
  res.render("chat_page", {
    username: user_data[0].username,
    member_id: chat_id,
    member_count: member_active_count,
  });
  return;
});

app.get(`/logout/:member_id`, (req, res) => {
  member_active_count = member_active_count - 1;
  let chat_id = req.params.member_id;
  mysql.updateStatus([0, chat_id]);
  res.redirect("/login");
});

io.on("connection", (socket) => {
  socket.broadcast.emit("new_user", {
    member_count: member_active_count,
    new_member: new_member,
  });

  socket.on("user_activity", (initialData) => {
    socket.broadcast.emit("someone_typing", { username: initialData });
  });

  socket.on("new_message", function (initialData) {
    socket.broadcast.emit("update_chat_list", initialData);
  });

  socket.on("user_left", function (initialData) {
    socket.broadcast.emit("user_group_left", {
      user: initialData.user,
      member_count: member_active_count,
    });
  });

  socket.on("disconnect", function () {
    // console.log("user is disconnected!");
  });
});

server.listen(PORT, () => {
  console.log(
    "app is listeneing to <enter your desired localhost address and port number>",
  );
});
