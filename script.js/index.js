const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

const form = document.getElementById("loginForm");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const errorEl = document.getElementById("error");

const setError = (message) => { errorEl.textContent = message || ""; };
const goToIssues = () => { window.location.href = "./issues.html"; };
const isLoggedIn = () => sessionStorage.getItem("isAuthed") === "true";

if (isLoggedIn()) goToIssues();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const u = usernameEl.value.trim();
  const p = passwordEl.value.trim();

  if (u === DEMO_USERNAME && p === DEMO_PASSWORD) {
    sessionStorage.setItem("isAuthed", "true");
    sessionStorage.setItem("authedUser", u);
    setError("");
    goToIssues();
  } else {
    setError("Invalid credentials. Use admin / admin123");
  }
});