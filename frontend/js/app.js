// ====== CONFIG ======
// Change these URLs to match your backend
const API_BASE = "http://localhost:5004/api";
const LOGIN_URL = API_BASE + "/auth/login";
const REGISTER_URL = API_BASE + "/auth/register";
const JOBS_URL = API_BASE + "/jobs";

// ====== DOM ELEMENTS ======
const navLogin = document.getElementById("nav-login");
const navRegister = document.getElementById("nav-register");

const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

const jobsSection = document.getElementById("jobs-section");
const jobsList = document.getElementById("jobs-list");
const jobsUnauth = document.getElementById("jobs-unauth");
const jobsLoading = document.getElementById("jobs-loading");
const jobsEmpty = document.getElementById("jobs-empty");

const currentUserLabel = document.getElementById("current-user-label");
const btnLogout = document.getElementById("btn-logout");

const goRegister = document.getElementById("go-register");
const goLogin = document.getElementById("go-login");

// ====== NAV TOGGLE (LOGIN / REGISTER) ======
function showLogin() {
  navLogin.classList.add("active");
  navRegister.classList.remove("active");
  loginView.classList.add("visible");
  registerView.classList.remove("visible");
}

function showRegister() {
  navRegister.classList.add("active");
  navLogin.classList.remove("active");
  registerView.classList.add("visible");
  loginView.classList.remove("visible");
}

navLogin.addEventListener("click", showLogin);
navRegister.addEventListener("click", showRegister);
goRegister.addEventListener("click", showRegister);
goLogin.addEventListener("click", showLogin);

// ====== AUTH STATE ======
function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

// Basic user label from backend response (if you want more, store it here)
function setCurrentUserLabel(name, role) {
  if (!name) {
    currentUserLabel.classList.add("hidden");
    return;
  }
  currentUserLabel.textContent = name + (role ? " (" + role + ")" : "");
  currentUserLabel.classList.remove("hidden");
}

// ====== LOGIN ======
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const res = await fetch(LOGIN_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    if (data.token) {
      setToken(data.token);
      alert("Login successful");
      setCurrentUserLabel(data.name || email, data.role);
      btnLogout.classList.remove("hidden");
      jobsUnauth.classList.add("hidden");
      fetchJobs();
    } else {
      alert("Token not received from server");
    }
  } catch (err) {
    console.error(err);
    alert("Error during login");
  }
});

// ====== REGISTER ======
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value.trim();
  const role = document.getElementById("register-role").value;

  try {
    const res = await fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    // Some backends also return token on register; handle both cases
    if (data.token) {
      setToken(data.token);
      alert("Registered & logged in successfully");
      setCurrentUserLabel(name, role);
      btnLogout.classList.remove("hidden");
      jobsUnauth.classList.add("hidden");
      showLogin();
      fetchJobs();
    } else {
      alert("Registered successfully. Please login now.");
      showLogin();
    }
  } catch (err) {
    console.error(err);
    alert("Error during registration");
  }
});

// ====== LOGOUT ======
btnLogout.addEventListener("click", () => {
  clearToken();
  setCurrentUserLabel(null);
  btnLogout.classList.add("hidden");
  jobsList.classList.add("hidden");
  jobsEmpty.classList.add("hidden");
  jobsUnauth.classList.remove("hidden");
});

// ====== FETCH JOBS ======
async function fetchJobs() {
  const token = getToken();
  if (!token) {
    jobsUnauth.classList.remove("hidden");
    jobsList.classList.add("hidden");
    jobsEmpty.classList.add("hidden");
    return;
  }

  jobsUnauth.classList.add("hidden");
  jobsEmpty.classList.add("hidden");
  jobsList.classList.add("hidden");
  jobsLoading.classList.remove("hidden");

  try {
    const res = await fetch(JOBS_URL, {
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
    });

    const jobs = await res.json();
    jobsLoading.classList.add("hidden");

    if (!Array.isArray(jobs) || jobs.length === 0) {
      jobsEmpty.classList.remove("hidden");
      jobsList.classList.add("hidden");
      return;
    }

    jobsList.innerHTML = "";
    jobs.forEach((job) => {
      const li = document.createElement("li");
      li.className = "job-card";

      const title = document.createElement("div");
      title.className = "job-title";
      title.textContent = job.title || "Untitled Role";

      const meta = document.createElement("div");
      meta.className = "job-meta";
      const company = job.company || "Unknown company";
      const location = job.location || "Not specified";
      meta.textContent = company + " • " + location;

      const desc = document.createElement("div");
      desc.className = "job-meta";
      if (job.description) {
        desc.textContent = job.description;
      }

      li.appendChild(title);
      li.appendChild(meta);
      if (job.description) li.appendChild(desc);

      jobsList.appendChild(li);
    });

    jobsList.classList.remove("hidden");
  } catch (err) {
    console.error("Error loading jobs", err);
    jobsLoading.classList.add("hidden");
    alert("Could not load jobs. Check console for details.");
  }
}

// ====== INIT: if already logged in, show jobs ======
(function init() {
  if (getToken()) {
    btnLogout.classList.remove("hidden");
    jobsUnauth.classList.add("hidden");
    fetchJobs();
  }
})();