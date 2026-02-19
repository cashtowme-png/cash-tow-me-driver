<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cash Tow Me – Driver</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="manifest.json">

<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

<style>
html, body {
  margin:0;
  padding:0;
  font-family:-apple-system, BlinkMacSystemFont, sans-serif;
  background:#0f0f0f;
  color:white;
  height:100%;
}

header {
  background:#2563eb;
  color:white;
  text-align:center;
  padding:25px 10px;
  font-size:22px;
  font-weight:bold;
  box-shadow:0 4px 8px rgba(0,0,0,0.3);
}

.container {
  padding:15px;
  display:flex;
  flex-direction:column;
  gap:15px;
}

.card {
  background:#1c1c1e;
  padding:20px;
  border-radius:20px;
}

input, select {
  width:100%;
  padding:16px;
  margin-bottom:12px;
  border-radius:12px;
  border:none;
  font-size:16px;
  background:#2c2c2e;
  color:white;
}

button {
  width:100%;
  padding:16px;
  border:none;
  border-radius:14px;
  font-size:16px;
  font-weight:bold;
  margin-bottom:10px;
  cursor:pointer;
}

.btn-action { background:#2563eb; color:white; }
.btn-online { background:#16a34a; color:white; }
.btn-offline { background:#dc2626; color:white; }

#statusText, #gpsText {
  text-align:center;
  margin-top:10px;
  font-size:14px;
  color:#ccc;
}
</style>
</head>

<body>

<header>🚛 Cash Tow Me – Driver</header>

<div class="container">

  <!-- Profile Card -->
  <div class="card">
    <input id="name" placeholder="Driver Name">
    <input id="company" placeholder="Company Name">
    <input id="phone" placeholder="Phone Number">
    <input id="city" placeholder="City">
    
    <!-- Updated tow services input -->
    <select id="services" multiple>
      <option value="Flatbed">Flatbed</option>
      <option value="Winch">Winch</option>
      <option value="Lockout">Lockout</option>
      <option value="Jump Start">Jump Start</option>
      <option value="Tire Change">Tire Change</option>
    </select>

    <button class="btn-action" onclick="saveDriver()">💾 Save Profile</button>
    <button class="btn-action" onclick="paySubscription('daily')">💳 Pay Daily</button>
    <button class="btn-action" onclick="paySubscription('monthly')">💳 Pay Monthly</button>
  </div>

  <!-- Online/Offline Toggle -->
  <div class="card">
    <button id="toggleBtn" class="btn-online" onclick="toggleStatus()">Go Online</button>
    <p id="statusText">Status: OFFLINE</p>
    <p id="gpsText">GPS: Not Active</p>
  </div>

</div>

<script>
// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cash-dispatch.firebaseapp.com",
  projectId: "cash-dispatch",
  storageBucket: "cash-dispatch.appspot.com",
  messagingSenderId: "79166345159",
  appId: "1:79166345159:web:c763c3d806d2fc24db53e2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let driverId = localStorage.getItem("driverId");
let status = "OFF";
let watchId = null;

// Save profile
function saveDriver() {
  const name = document.getElementById("name").value;
  const company = document.getElementById("company").value;
  const phone = document.getElementById("phone").value;
  const city = document.getElementById("city").value;

  // Get selected services
  const servicesSelect = document.getElementById("services");
  const services = Array.from(servicesSelect.selectedOptions).map(opt => opt.value);

  if (!name || !phone) return alert("Name and Phone required");

  if (driverId) {
    db.collection("drivers").doc(driverId).update({name, company, phone, city, services});
    alert("Profile updated");
  } else {
    db.collection("drivers").add({
      name, company, phone, city, services,
      approved:false, paid:false, status:"OFF",
      latitude:null, longitude:null,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    }).then(doc => {
      driverId = doc.id;
      localStorage.setItem("driverId", driverId);
      alert("Profile saved. Await admin approval & payment.");
    });
  }
}

// Stripe payment
function paySubscription(type) {
  const url = type === "daily" 
    ? "https://buy.stripe.com/test_daily_link" 
    : "https://buy.stripe.com/test_monthly_link";
  window.open(url, "_blank");
}

// Toggle online/offline
function toggleStatus() {
  if (!driverId) return alert("Save profile first");

  db.collection("drivers").doc(driverId).get().then(doc => {
    const data = doc.data();
    if (!data.paid || !data.approved) return alert("Must be approved and pay before going online");

    if (status === "OFF") {
      status = "ON";
      document.getElementById("toggleBtn").innerText = "Go Offline";
      document.getElementById("toggleBtn").className = "btn-offline";
      document.getElementById("statusText").innerText = "Status: ONLINE";
      startGPS();
    } else {
      status = "OFF";
      document.getElementById("toggleBtn").innerText = "Go Online";
      document.getElementById("toggleBtn").className = "btn-online";
      document.getElementById("statusText").innerText = "Status: OFFLINE";
      stopGPS();
    }
    db.collection("drivers").doc(driverId).update({status});
  });
}

// GPS
function startGPS() {
  if (!navigator.geolocation) return;
  watchId = navigator.geolocation.watchPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    document.getElementById("gpsText").innerText = `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    db.collection("drivers").doc(driverId).update({latitude:lat, longitude:lng});
  }, err => alert("GPS error"), {enableHighAccuracy:true});
}

function stopGPS() {
  if (watchId) navigator.geolocation.clearWatch(watchId);
  watchId = null;
  document.getElementById("gpsText").innerText = "GPS: Not Active";
}

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log("Service Worker registered"))
    .catch(err => console.error("Service Worker failed:", err));
}
</script>

</body>
</html>
