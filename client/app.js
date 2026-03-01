const socket = io();

/* =========================
   WARNING SYSTEM
========================= */

function acceptWarning() {
  localStorage.setItem("reactoAccepted", "yes");
  const popup = document.getElementById("warningPopup");
  if (popup) popup.style.display = "none";
}

window.addEventListener("load", () => {
  const popup = document.getElementById("warningPopup");

  if (localStorage.getItem("reactoAccepted") !== "yes") {
    popup.style.display = "flex";
  } else {
    popup.style.display = "none";
  }

  const acceptBtn = document.getElementById("acceptBtn");
  if (acceptBtn) {
    acceptBtn.onclick = acceptWarning;
  }
});

/* =========================
   UI ELEMENTS
========================= */

const circle = document.getElementById("circle");
const circleText = document.getElementById("circleText");
const ring = document.getElementById("ring");

const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const stopBtn = document.getElementById("stopBtn");

let localStream;
let peerConnection;

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

/* =========================
   START SEARCH
========================= */

startBtn.onclick = async () => {
  try {
    circleText.innerText = "Requesting Mic...";
    ring.style.display = "block";

    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    console.log("Mic granted ✅");

    circleText.innerText = "Searching...";
    socket.emit("find");

  } catch (err) {
    console.error("Mic error:", err);
    alert("Mic permission denied or error occurred.");
  }
};

/* =========================
   MATCHED
========================= */

socket.on("matched", () => {
  circleText.innerText = "Connected";
  ring.style.display = "none";
  circle.classList.add("green");

  createPeer(true);
});

/* =========================
   PARTNER LEFT
========================= */

socket.on("partner-left", () => {
  circleText.innerText = "Searching...";
  ring.style.display = "block";
  circle.classList.remove("green");

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
});

/* =========================
   CREATE PEER CONNECTION
========================= */

function createPeer(isCaller) {
  peerConnection = new RTCPeerConnection(configuration);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = event => {
    const audio = new Audio();
    audio.srcObject = event.streams[0];
    audio.play();
  };

  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate);
    }
  };

  if (isCaller) createOffer();
}

async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer);
}

socket.on("offer", async (offer) => {
  createPeer(false);
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", async (answer) => {
  await peerConnection.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (candidate) => {
  if (peerConnection) {
    await peerConnection.addIceCandidate(candidate);
  }
});
