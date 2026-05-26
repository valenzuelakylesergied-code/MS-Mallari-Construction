// 🔥 FIREBASE IMPORTS (ONLY ONCE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDjHW3fkwkSVyIsRHwc2-EwKD7xG35hfCg",
  authDomain: "ms-mallari-construction.firebaseapp.com",
  projectId: "ms-mallari-construction",
  storageBucket: "ms-mallari-construction.firebasestorage.app",
  messagingSenderId: "671436936152",
  appId: "1:671436936152:web:05cba235ff31a67dbad8ad",
};

// 🔥 INIT
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ LOGIN
async function loginAdmin(event) {
  event.preventDefault();

  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Login successful!");
    window.location.href = "adminpanel.html";
  } catch (error) {
    alert(error.message);
  }
}

// ✅ PROTECT ADMIN PAGE
function protectAdmin() {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

// ✅ LOGOUT
async function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");

  if (!confirmLogout) return;

  try {
    await signOut(auth);

    alert("Logged out successfully");
    window.location.href = "login.html";
  } catch (error) {
    alert(error.message);
  }
}

// ✅ RESET PASSWORD
async function resetPassword(event) {
  event.preventDefault();

  const email = document.getElementById("email")?.value;

  if (!email) {
    alert("Please enter your email");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    alert("Password reset email sent! Check your Gmail.");
  } catch (error) {
    alert(error.message);
  }
}

// 🌐 MAKE GLOBAL
window.loginAdmin = loginAdmin;
window.protectAdmin = protectAdmin;
window.logout = logout;
window.resetPassword = resetPassword;

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const db = getFirestore(app);

window.db = db;

// 🔥 EXCEL UPLOAD FUNCTION (WITH UI LOCK)
async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput?.files[0];

  if (!file) {
    alert("Please select an Excel file");
    return;
  }

  const reader = new FileReader();

  reader.onload = async (e) => {
    // 🔥 DISABLE USER ACTIONS
    document.body.style.pointerEvents = "none";
    document.body.style.opacity = "0.7"; // optional (visual effect)

    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    try {
      if (window.showProgress) window.showProgress();

      const batchSize = 400;
      let uploaded = 0;
      const total = jsonData.length;

      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = jsonData.slice(i, i + batchSize);

        chunk.forEach((row) => {
          const newDoc = doc(collection(db, "projects"));

          batch.set(newDoc, {
            project_name:
              row.project_name ||
              row["project_name"] ||
              row["Project Name"] ||
              "",
            location: row.location || row["Location"] || "",
            scope_of_work: row.scope_of_work || row["Scope of Work"] || "",
            type_of_project:
              row.type_of_project ||
              row["type_of_project"] ||
              row["Type of Project"] ||
              "",
            status: row.status || row["Status"] || "",
          });
        });

        await batch.commit();

        uploaded += chunk.length;

        const percent = Math.round((uploaded / total) * 100);
        if (window.updateProgress) window.updateProgress(percent);
      }

      if (window.hideProgress) window.hideProgress();

      alert("✅ Excel uploaded FAST!");

      await loadAdminProjects();
    } catch (error) {
      alert("❌ Upload failed: " + error.message);
    }

    // 🔥 ENABLE USER ACTIONS AGAIN
    document.body.style.pointerEvents = "auto";
    document.body.style.opacity = "1";
  };

  reader.readAsArrayBuffer(file);
}
window.uploadExcel = uploadExcel;
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("uploadBtn");

  if (btn) {
    btn.addEventListener("click", uploadExcel);
  }
});
