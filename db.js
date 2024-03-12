//CONNECT YOUR DATABASE AND CREATE A TABLE OF 4 COLUMNS [USERNAME, AGE, CHAT_TOKEN, IS_ACTIVE]

const mysql = require("mysql2");
const conn = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
  // port:
});

conn.connect(function (err) {
  if (err) throw err;
  console.log("connected to database!");
});

module.exports = {
  newUser: function (values) {
    var insert_query =
      "INSERT INTO `group_chat`(`username`, `age`, `chat_token`, `is_active`) VALUES (?,?,?,?)";
    conn.query(insert_query, values, (err) => {
      if (err) throw err;
      console.log("data inserted!");
    });
  },
  searchUser: function (name) {
    return new Promise(function (resolve, reject) {
      var search_query = "SELECT * FROM `group_chat` WHERE username = ?";
      conn.query(search_query, name, function (err, data) {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
  thisUser: function (login_token) {
    return new Promise(function (resolve, reject) {
      var select_query = "SELECT * FROM `group_chat` WHERE chat_token = ?";
      conn.query(select_query, login_token, function (err, data) {
        if (err) reject(err);
        resolve(data);
      });
    });
  },
  updateStatus: function (values) {
    var update_query =
      "UPDATE `group_chat` SET `is_active`= ? WHERE `chat_token` = ?";
    conn.query(update_query, values, function (err) {
      if (err) throw err;
      console.log("user status updated!");
    });
  },
};
