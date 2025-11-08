// ====================== STORAGE KEYS ======================
const LS_USERS = "lms_users";
const LS_BOOKS = "library_books";
const ADMIN_EMAIL = "admin@library.org";
const ADMIN_PASS = "1234";

// ✅ Ensure admin exists
(function ensureAdmin() {
  const users = JSON.parse(localStorage.getItem(LS_USERS)) || [];
  const exists = users.some(u => u.username.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  if (!exists) {
    users.push({ name: "Admin", username: ADMIN_EMAIL, password: ADMIN_PASS });
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }
})();

function getUsers() {
  return JSON.parse(localStorage.getItem(LS_USERS)) || [];
}
function saveUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}
function userExists(username) {
  return getUsers().some(u => u.username.toLowerCase() === username.toLowerCase());
}
function findUser(username, password) {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
}
function isOrgUsername(u) {
  return u && u.trim().toLowerCase().endsWith(".org");
}
function isStrongPassword(p) {
  return p.length >= 8 && /\d/.test(p);
}



// ====================== REGISTER ======================
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("fullName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const pass = document.getElementById("regPassword").value.trim();
    const confirm = document.getElementById("regConfirm").value.trim();
    const regAlert = document.getElementById("regAlert");
    const regSuccess = document.getElementById("regSuccess");

    function showErr(msg) {
      regAlert.textContent = msg;
      regAlert.classList.remove("d-none");
      regSuccess.classList.add("d-none");
    }
    function showOk(msg) {
      regSuccess.textContent = msg;
      regSuccess.classList.remove("d-none");
      regAlert.classList.add("d-none");
    }

    if (!name) return showErr("Please enter your full name.");
    if (!isOrgUsername(username)) return showErr("Username must end with .org (e.g., user@library.org).");
    if (userExists(username)) return showErr("This username already exists.");
    if (!isStrongPassword(pass)) return showErr("Password must be 8+ characters and contain a number.");
    if (pass !== confirm) return showErr("Passwords do not match.");

    const users = getUsers();
    users.push({ name, username, password: pass });
    saveUsers(users);
    showOk("✅ User Registered Successfully!");

    setTimeout(() => {
      localStorage.setItem("current_user", username);
      if (username.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        window.location.href = "dashboard.html"; // admin
      } else {
        window.location.href = "user-dashboard.html"; // normal user
      }
    }, 1000);    
  });
}

// ====================== LOGIN ======================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const uname = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("error");

    if (!isOrgUsername(uname)) {
      errorBox.textContent = "⚠ Username must end with .org";
      errorBox.classList.remove("d-none");
      return;
    }

    const user = findUser(uname, pass);
    if (user) {
      localStorage.setItem("current_user", uname);
      if (uname.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        window.location.href = "dashboard.html"; // admin
      } else {
        window.location.href = "user-dashboard.html"; // normal user
      }
    }
    
     else {
      errorBox.textContent = "Invalid username or password!";
      errorBox.classList.remove("d-none");
    }
  });
}

// ====================== LOGOUT (Both dashboards) ======================
if (document.getElementById("logoutBtn")) {
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("current_user");
    window.location.href = "index.html";
  });
}

// ====================== BOOK STORAGE ======================
function getBooks() {
  return JSON.parse(localStorage.getItem(LS_BOOKS)) || [];
}
function saveBooks(books) {
  localStorage.setItem(LS_BOOKS, JSON.stringify(books));
}

// redirect guards
if (window.location.pathname.includes("dashboard.html")) {
  const currentUser = localStorage.getItem("current_user");
  if (!currentUser) window.location.href = "index.html";
  if (currentUser.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    alert("🚫 Access denied! Only admin can open the dashboard.");
    window.location.href = "user-dashboard.html";
  }
}

if (window.location.pathname.includes("user-dashboard.html")) {
  const currentUser = localStorage.getItem("current_user");
  if (!currentUser) window.location.href = "index.html";
  if (currentUser.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    window.location.href = "dashboard.html";
  }
}
// ====================== ADMIN DASHBOARD ======================
if (window.location.pathname.includes("dashboard.html")) {
  const currentUser = localStorage.getItem("current_user");
  const welcomeMsg = document.getElementById("welcomeMsg");

  if (!currentUser) {
    alert("⚠ Please log in first!");
    window.location.href = "index.html";
  } else if (currentUser.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    alert("🚫 Access denied! Only admin can open the dashboard.");
    window.location.href = "index.html";
  } else {
    welcomeMsg.innerText = `👋 Welcome, ${currentUser}`;
  }
}

function addBook() {
  const title = prompt("Enter Book Title:");
  const author = prompt("Enter Author Name:");
  const id = Date.now().toString();
  if (!title || !author) {
    alert("⚠ Please enter valid book details!");
    return;
  }

  const books = getBooks();
  books.push({ id, title, author, issued: false, issuedBy: null });
  saveBooks(books);
  alert(`✅ Book "${title}" added successfully!`);
  viewBooks();
}

function issueBook() {
  const id = prompt("Enter Book ID to issue:");
  const userEmail = prompt("Enter User Email who is issuing the book:");
  const books = getBooks();
  const book = books.find(b => b.id === id);

  if (!book) return alert("⚠ Book not found!");
  if (book.issued) return alert("⚠ Book already issued!");
  if (!userExists(userEmail)) return alert("⚠ No such registered user exists!");

  book.issued = true;
  book.issuedBy = userEmail;
  saveBooks(books);
  alert(`📤 Book "${book.title}" issued to ${userEmail}`);
  viewBooks();
}

function returnBook() {
  const id = prompt("Enter Book ID to return:");
  const books = getBooks();
  const book = books.find(b => b.id === id);
  if (!book) return alert("⚠ Book not found!");
  if (!book.issued) return alert("⚠ This book was not issued!");
  book.issued = false;
  book.issuedBy = null;
  saveBooks(books);
  alert(`📥 Book "${book.title}" returned successfully!`);
  viewBooks();
}

function viewBooks() {
  const div = document.getElementById("bookList");
  const books = getBooks();
  if (!div) return;

  if (books.length === 0) {
    div.innerHTML = "<p class='text-warning'>No books available yet!</p>";
    return;
  }

  let html = `<table class="table table-bordered mt-4 text-center">
  <thead class="table-dark"><tr><th>ID</th><th>Title</th><th>Author</th><th>Status</th><th>Issued To</th></tr></thead><tbody>`;
  books.forEach((b) => {
    html += `<tr>
      <td>${b.id}</td>
      <td>${b.title}</td>
      <td>${b.author}</td>
      <td>${b.issued ? "❌ Issued" : "✅ Available"}</td>
      <td>${b.issuedBy ? b.issuedBy : "-"}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  div.innerHTML = html;
}

// ====================== USER DASHBOARD ======================
if (window.location.pathname.includes("user-dashboard.html")) {
  const currentUser = localStorage.getItem("current_user");
  const welcome = document.getElementById("welcomeUser");
  const bookList = document.getElementById("userBookList");

  if (!currentUser) {
    alert("⚠ Please log in first!");
    window.location.href = "index.html";
  } else {
    welcome.innerText = `👋 Welcome, ${currentUser}`;
    showAvailableBooks();
  }

  function showAvailableBooks() {
    const books = getBooks();
    if (books.length === 0) {
      bookList.innerHTML = "<p class='text-warning'>No books available yet!</p>";
      return;
    }

    let html = `<table class="table table-bordered mt-4 text-center">
    <thead class="table-success"><tr><th>ID</th><th>Title</th><th>Author</th><th>Action</th></tr></thead><tbody>`;
    books.forEach(b => {
      if (!b.issued) {
        html += `<tr>
          <td>${b.id}</td>
          <td>${b.title}</td>
          <td>${b.author}</td>
          <td><button class="btn btn-sm btn-primary" onclick="userIssueBook('${b.id}', '${currentUser}')">Issue</button></td>
        </tr>`;
      }
    });
    html += "</tbody></table>";
    bookList.innerHTML = html;
  }
}

function userIssueBook(bookId, userEmail) {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) return alert("⚠ Book not found!");
  if (book.issued) return alert("⚠ Already issued!");
  book.issued = true;
  book.issuedBy = userEmail;
  saveBooks(books);
  alert(`✅ Book "${book.title}" issued successfully to you!`);
  location.reload();
}
