const socket = io();
const chat_list = document.getElementsByClassName("msger-chat");
const username = document.getElementById("user_name").innerText;

window.addEventListener("beforeunload", function (e) {
  e.preventDefault();
  e.returnValue = "";
});

$("#message").on("keypress", () => {
  socket.emit("user_activity", username);
});

socket.on("someone_typing", (initialData) => {
  $(".user_typing").text(initialData.username);
  toggleUserActivity(1);
});

socket.on("new_user", function (initialData) {
  document.getElementById("member_count").innerText = initialData.member_count;
  let new_member_div = $(
    `<div class="new_user_joined text-center">${initialData.new_member} joined the chat.</div>`,
  );
  $(new_member_div).insertBefore(".activity");
});

$("#sendMessage").click(() => {
  let user_message = $("#message").val();
  socket.emit("new_message", { text: user_message, user: username });
  appendMessage(user_message);
  $("#message").val(" ");
});

socket.on("update_chat_list", (initialData) => {
  toggleUserActivity(0);
  let new_message_div = $(
    `<div class="msg left-msg"><div class="msg-bubble"><div class="msg-info"><div class="msg-info-name">${initialData.user}</div><div class="msg-info-time">${new Date().toLocaleTimeString()}</div></div> <div class="msg-text">${initialData.text}</div></div></div>`,
  );
  $(new_message_div).insertBefore(".activity");
});

$("#signout").click(() => {
  socket.emit("user_left", { user: username });
});

socket.on("user_group_left", (initialData) => {
  let member_count = document.getElementById("member_count").innerText - 1;
  document.getElementById("member_count").innerText = member_count;
  let new_member_div = $(
    `<div class="new_user_left text-center">${initialData.user} left the chat.</div>`,
  );
  $(new_member_div).insertBefore(".activity");
});

function toggleUserActivity(counter) {
  if (counter === 1) {
    $(".activity").show();
  } else if (counter === 0) {
    $(".activity").hide();
  }
}

function appendMessage(message) {
  let new_message_div = $(
    `<div class="msg right-msg"><div class="msg-bubble"><div class="msg-info"><div class="msg-info-name">${username}</div><div class="msg-info-time">${new Date().toLocaleTimeString()}</div></div> <div class="msg-text">${message}</div></div></div>`,
  );
  $(new_message_div).insertBefore(".activity");
}
