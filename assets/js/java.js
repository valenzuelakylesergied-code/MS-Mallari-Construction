// LOAD NAVBAR
fetch("./nav.html")
  .then(function (res) {
    return res.text();
  })
  .then(function (data) {
    document.getElementById("nav").innerHTML = data;

    // ACTIVE NAV LINK
    const currentPage = window.location.pathname.split("/").pop();

    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach(function (link) {
      const linkPage = link.getAttribute("href");

      if (linkPage === currentPage) {
        link.classList.add("active");
      }
    });
  });

// ACTIVE FOOTER LINK
fetch("./footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  });

// LOAD SHOW PASSWORD

function togglePassword() {
  var x = document.getElementById("myInput");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

// ACCORDON

const imageCol = document.getElementById("imageCol");
const allCollapses = document.querySelectorAll(".accordion-collapse");

function updateImage() {
  const openCount = [...allCollapses].filter((el) =>
    el.classList.contains("show"),
  ).length;
  if (openCount >= 2) {
    imageCol.classList.add("show-second");
  } else {
    imageCol.classList.remove("show-second");
  }
}

allCollapses.forEach((el) => {
  el.addEventListener("shown.bs.collapse", updateImage);
  el.addEventListener("hidden.bs.collapse", updateImage);
});

updateImage(); // run once on page load

function showUpdateMessage() {
  document.getElementById("update-message").style.display = "block";
}
