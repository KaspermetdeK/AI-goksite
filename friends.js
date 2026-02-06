const friendsKey = "nexed_arcade_friends";
const chatKey = "nexed_arcade_chats";

const statusEl = document.getElementById("friendsStatus");
const friendNameInput = document.getElementById("friendName");
const addFriendBtn = document.getElementById("addFriend");
const friendsListEl = document.getElementById("friendsList");
const activeFriendEl = document.getElementById("activeFriend");
const chatWindowEl = document.getElementById("chatWindow");
const chatMessageInput = document.getElementById("chatMessage");
const sendMessageBtn = document.getElementById("sendMessage");

let friends = JSON.parse(localStorage.getItem(friendsKey) || "[]");
let chats = JSON.parse(localStorage.getItem(chatKey) || "{}");
let activeFriend = null;

const saveFriends = () => {
  localStorage.setItem(friendsKey, JSON.stringify(friends));
};

const saveChats = () => {
  localStorage.setItem(chatKey, JSON.stringify(chats));
};

const setStatus = (message) => {
  statusEl.textContent = message;
};

const sanitizeName = (name) => name.trim().replace(/\s+/g, " ");

const renderFriends = () => {
  friendsListEl.innerHTML = "";
  if (!friends.length) {
    friendsListEl.textContent = "Nog geen vrienden.";
    return;
  }
  friends.forEach((name) => {
    const row = document.createElement("div");
    row.className = "friend-row";
    row.innerHTML = `
      <button class="btn btn-outline friend-btn">${name}</button>
      <button class="btn btn-outline friend-remove" aria-label="Verwijder ${name}">Verwijder</button>
    `;
    const [selectBtn, removeBtn] = row.querySelectorAll("button");
    selectBtn.addEventListener("click", () => selectFriend(name));
    removeBtn.addEventListener("click", () => removeFriend(name));
    friendsListEl.appendChild(row);
  });
};

const renderChat = () => {
  if (!activeFriend) {
    activeFriendEl.textContent = "Niemand";
    chatWindowEl.textContent = "Selecteer een vriend om te chatten.";
    return;
  }
  activeFriendEl.textContent = activeFriend;
  const messages = chats[activeFriend] || [];
  if (!messages.length) {
    chatWindowEl.textContent = "Nog geen berichten.";
    return;
  }
  chatWindowEl.innerHTML = messages.map((msg) => `
    <div class="chat-bubble ${msg.author === "me" ? "me" : "them"}">
      <span>${msg.text}</span>
      <small>${msg.time}</small>
    </div>
  `).join("");
  chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
};

const selectFriend = (name) => {
  activeFriend = name;
  renderChat();
  setStatus(`Chat geopend met ${name}`);
};

const removeFriend = (name) => {
  friends = friends.filter((item) => item !== name);
  if (activeFriend === name) {
    activeFriend = null;
  }
  saveFriends();
  renderFriends();
  renderChat();
  setStatus(`${name} verwijderd`);
};

const addFriend = () => {
  const name = sanitizeName(friendNameInput.value);
  if (!name) {
    setStatus("Voer een naam in.");
    return;
  }
  if (friends.includes(name)) {
    setStatus("Deze vriend staat al in je lijst.");
    return;
  }
  friends.push(name);
  saveFriends();
  friendNameInput.value = "";
  renderFriends();
  setStatus(`${name} toegevoegd`);
};

const sendMessage = () => {
  if (!activeFriend) {
    setStatus("Selecteer eerst een vriend.");
    return;
  }
  const text = chatMessageInput.value.trim();
  if (!text) {
    setStatus("Typ eerst een bericht.");
    return;
  }
  const time = new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  if (!chats[activeFriend]) chats[activeFriend] = [];
  chats[activeFriend].push({ author: "me", text, time });
  saveChats();
  chatMessageInput.value = "";
  renderChat();
  setStatus("Bericht verstuurd");
};

addFriendBtn.addEventListener("click", addFriend);
friendNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") addFriend();
});
sendMessageBtn.addEventListener("click", sendMessage);
chatMessageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});

renderFriends();
renderChat();
setStatus("Klaar");
