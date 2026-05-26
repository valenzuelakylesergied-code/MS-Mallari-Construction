import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

let allProjects = [];
let filteredProjects = [];

let currentPage = 1;
const perPage = 20;

let currentProjectType = "All";

// LOAD PROJECTS
async function loadProjects() {
  const table = document.getElementById("projectsTable");
  if (!table) return;

  // WAIT FOR FIREBASE
  if (!window.db) {
    console.log("Waiting for Firebase...");
    setTimeout(loadProjects, 500);
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(window.db, "projects"));

    allProjects = [];

    querySnapshot.forEach((doc) => {
      allProjects.push(doc.data());
    });

    console.log("Projects Loaded:", allProjects);

    filterProjects();
  } catch (error) {
    console.error("Error loading projects:", error);
  }
}

// FILTER PROJECTS
function filterProjects() {
  const selectedStatus =
    document.getElementById("statusFilter")?.value || "All";

  filteredProjects = allProjects.filter((p) => {
    // STATUS FILTER
    const matchStatus =
      selectedStatus === "All" ||
      (p.status || "").toLowerCase().trim() ===
        selectedStatus.toLowerCase().trim();

    // TYPE FILTER
    const matchType =
      currentProjectType === "All" ||
      (p.type_of_project || "").toLowerCase().trim() ===
        currentProjectType.toLowerCase().trim();

    return matchStatus && matchType;
  });

  renderPage(1);
  renderPagination();
}

// SET PROJECT TYPE
function setProjectType(type, button) {
  currentProjectType = type;

  // REMOVE ACTIVE STYLE
  document.querySelectorAll(".project-filter-btn").forEach((btn) => {
    btn.classList.remove("btn-dark", "active-filter");
    btn.classList.add("btn-outline-dark");
  });

  // ADD ACTIVE STYLE
  button.classList.remove("btn-outline-dark");
  button.classList.add("btn-dark", "active-filter");

  filterProjects();
}

// DISPLAY
function renderPage(page) {
  currentPage = page;

  const start = (page - 1) * perPage;
  const end = start + perPage;

  const container = document.getElementById("projectsTable");
  container.innerHTML = "";

  const dataToShow = filteredProjects.slice(start, end);

  if (dataToShow.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">
          No projects found
        </td>
      </tr>
    `;
    return;
  }

  dataToShow.forEach((p, index) => {
    container.innerHTML += `
      <tr>
        <td>${start + index + 1}</td>
        <td>${p.project_name || "-"}</td>
        <td>${p.location || "-"}</td>
        <td>${p.scope_of_work || "-"}</td>
        <td>${p.type_of_project || "-"}</td>
      </tr>
    `;
  });
}

// PAGINATION
function renderPagination() {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  const totalPages = Math.ceil(filteredProjects.length / perPage);

  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <button
        onclick="renderPage(${i})"
        class="btn btn-sm btn-outline-dark mx-1"
      >
        ${i}
      </button>
    `;
  }
}

// GLOBAL
window.renderPage = renderPage;
window.filterProjects = filterProjects;
window.setProjectType = setProjectType;

// INIT
document.addEventListener("DOMContentLoaded", loadProjects);
