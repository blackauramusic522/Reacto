const circle = document.getElementById("circle");
const circleText = document.getElementById("circleText");
const ring = document.getElementById("ring");
const socket = io();
const startBtn = document.getElementById("startBtn");
const skipBtn = document.getElementById("skipBtn");
const stopBtn = document.getElementById("stopBtn");
const reportBtn = document.getElementById("reportBtn");

const warningPopup = document.getElementById("warningPopup");

let searching = false;

/* =========================
   WARNING SYSTEM (18+)
========================= */

function acceptWarning() {
  localStorage.setItem("reactoAccepted", "yes");
  warningPopup.style.display = "none";
}

window.addEventListener("load", () => {
  // Show popup only if not accepted before
  if (localStorage.getItem("reactoAccepted") !== "yes") {
    warningPopup.style.display = "flex";
  } else {
    warningPopup.style.display = "none";
  }

  // Check 24hr block
  let blockedUntil = localStorage.getItem("reactoBlockedUntil");

  if (blockedUntil && Date.now() < blockedUntil) {
    alert("You are blocked for 24 hours due to multiple reports.");
    startBtn.disabled = true;
  }
});

/* =========================
   START SEARCH
========================= */

startBtn.onclick = () => {
  searching = true;

  circleText.innerText = "Searching...";
  ring.style.display = "block";
  circle.classList.remove("green");

  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");
  skipBtn.classList.remove("hidden");
  reportBtn.classList.remove("hidden");

  // Fake connect after 3 seconds
  setTimeout(() => {
    if (searching) {
      circleText.innerText = "Connected";
      ring.style.display = "none";
      circle.classList.add("green");
    }
  }, 3000);
};

/* =========================
   SKIP USER
========================= */

skipBtn.onclick = () => {
  circleText.innerText = "Searching...";
  ring.style.display = "block";
  circle.classList.remove("green");

  setTimeout(() => {
    circleText.innerText = "Connected";
    ring.style.display = "none";
    circle.classList.add("green");
  }, 3000);
};

/* =========================
   STOP CALL
========================= */

stopBtn.onclick = () => {
  searching = false;

  circleText.innerText = "Reacto";
  ring.style.display = "none";
  circle.classList.remove("green");

  skipBtn.classList.add("hidden");
  reportBtn.classList.add("hidden");
  stopBtn.classList.add("hidden");
  startBtn.classList.remove("hidden");
};

/* =========================
   REPORT SYSTEM (3 REPORT = 24H BLOCK)
========================= */

reportBtn.onclick = () => {
  let reports = localStorage.getItem("reactoReports");
  reports = reports ? parseInt(reports) : 0;

  reports++;
  localStorage.setItem("reactoReports", reports);

  if (reports >= 3) {
    localStorage.setItem(
      "reactoBlockedUntil",
      Date.now() + 24 * 60 * 60 * 1000
    );
    alert("You have been blocked for 24 hours due to multiple reports.");
    location.reload();
  } else {
    alert("User reported.");
  }
};