/* =========================================================
   Department Notice Board System
   Storage: localStorage (key: "dnbs_notices")
   Admin auth: localStorage (key: "dnbs_admin_session")
   Demo admin credentials: admin / admin123
   ========================================================= */

const STORAGE_KEY = "dnbs_notices";
const SESSION_KEY = "dnbs_admin_session";
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

/* ---------- Utility: seed sample data on first run ---------- */
function seedNoticesIfEmpty() {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];
  const in7 = new Date(today); in7.setDate(in7.getDate() + 7);
  const in14 = new Date(today); in14.setDate(in14.getDate() + 14);
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30);

  const sample = [
    {
      id: cryptoId(),
      title: "Semester End Examination Timetable Released",
      department: "GENERAL",
      priority: "High",
      content: "The timetable for the semester end examinations has been published. All students are requested to check the schedule on the department notice board and report any clashes to the exam cell before the deadline.",
      attachmentUrl: "",
      postedOn: fmt(today),
      expiryDate: fmt(in30)
    },
    {
      id: cryptoId(),
      title: "Guest Lecture on Artificial Intelligence",
      department: "CSE",
      priority: "Medium",
      content: "A guest lecture on 'Recent Advances in Artificial Intelligence' will be conducted by an industry expert. All CSE students are encouraged to attend. Venue and time will be shared shortly.",
      attachmentUrl: "",
      postedOn: fmt(today),
      expiryDate: fmt(in14)
    },
    {
      id: cryptoId(),
      title: "Lab Maintenance - Circuits Lab Closed",
      department: "ECE",
      priority: "Low",
      content: "The Circuits & Systems lab will remain closed for scheduled maintenance. Regular lab sessions will resume from the next working day.",
      attachmentUrl: "",
      postedOn: fmt(today),
      expiryDate: fmt(in7)
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
}

function cryptoId() {
  return "n_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getNotices() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveNotices(notices) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}

function isExpired(notice) {
  if (!notice.expiryDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return notice.expiryDate < today;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ================= PUBLIC HOME PAGE ================= */
function initHomePage() {
  const noticeList = document.getElementById("noticeList");
  const emptyState = document.getElementById("emptyState");
  const statsEl = document.getElementById("stats");
  const deptFilter = document.getElementById("deptFilter");
  const priorityFilter = document.getElementById("priorityFilter");
  const searchBox = document.getElementById("searchBox");

  const modal = document.getElementById("noticeModal");
  const closeModal = document.getElementById("closeModal");
  const modalDept = document.getElementById("modalDept");
  const modalTitle = document.getElementById("modalTitle");
  const modalMeta = document.getElementById("modalMeta");
  const modalContent = document.getElementById("modalContent");
  const modalAttachment = document.getElementById("modalAttachment");

  function render() {
    const dept = deptFilter.value;
    const priority = priorityFilter.value;
    const query = searchBox.value.trim().toLowerCase();

    let notices = getNotices().filter(n => !isExpired(n));

    if (dept !== "all") notices = notices.filter(n => n.department === dept);
    if (priority !== "all") notices = notices.filter(n => n.priority === priority);
    if (query) {
      notices = notices.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
      );
    }

    // newest first
    notices.sort((a, b) => (a.postedOn < b.postedOn ? 1 : -1));

    noticeList.innerHTML = "";
    statsEl.textContent = `Showing ${notices.length} active notice(s)`;

    if (notices.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    notices.forEach(n => {
      const card = document.createElement("div");
      card.className = `notice-card priority-${n.priority}`;
      card.innerHTML = `
        <span class="badge">${escapeHtml(n.department)}</span>
        <h3>${escapeHtml(n.title)}</h3>
        <p class="excerpt">${escapeHtml(n.content.slice(0, 100))}${n.content.length > 100 ? "…" : ""}</p>
        <span class="priority-tag ${n.priority}">${n.priority} Priority</span>
        <span class="date-line">Posted: ${n.postedOn}${n.expiryDate ? " | Valid till: " + n.expiryDate : ""}</span>
      `;
      card.addEventListener("click", () => openModal(n));
      noticeList.appendChild(card);
    });
  }

  function openModal(n) {
    modalDept.textContent = n.department;
    modalTitle.textContent = n.title;
    modalMeta.textContent = `Priority: ${n.priority} | Posted: ${n.postedOn}${n.expiryDate ? " | Valid till: " + n.expiryDate : ""}`;
    modalContent.textContent = n.content;
    if (n.attachmentUrl) {
      modalAttachment.href = n.attachmentUrl;
      modalAttachment.style.display = "inline-block";
    } else {
      modalAttachment.style.display = "none";
    }
    modal.classList.remove("hidden");
  }

  closeModal.addEventListener("click", () => modal.classList.add("hidden"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.add("hidden"); });

  deptFilter.addEventListener("change", render);
  priorityFilter.addEventListener("change", render);
  searchBox.addEventListener("input", render);

  render();
}

/* ================= ADMIN PAGE ================= */
function initAdminPage() {
  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const logoutBtn = document.getElementById("logoutBtn");

  const noticeForm = document.getElementById("noticeForm");
  const noticeIdField = document.getElementById("noticeId");
  const formTitle = document.getElementById("formTitle");
  const submitBtn = document.getElementById("submitBtn");
  const cancelEditBtn = document.getElementById("cancelEditBtn");

  const titleInput = document.getElementById("title");
  const departmentInput = document.getElementById("department");
  const priorityInput = document.getElementById("priority");
  const expiryInput = document.getElementById("expiryDate");
  const contentInput = document.getElementById("content");
  const attachmentInput = document.getElementById("attachmentUrl");

  const tableBody = document.getElementById("noticeTableBody");
  const noticeCount = document.getElementById("noticeCount");
  const noNotices = document.getElementById("noNotices");

  function isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "true";
  }

  function showDashboard() {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    renderTable();
  }

  function showLogin() {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
  }

  if (isLoggedIn()) showDashboard();
  else showLogin();

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, "true");
      loginError.textContent = "";
      loginForm.reset();
      showDashboard();
    } else {
      loginError.textContent = "Invalid username or password. Try again.";
    }
  });

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  function resetForm() {
    noticeForm.reset();
    noticeIdField.value = "";
    formTitle.textContent = "Add New Notice";
    submitBtn.textContent = "Publish Notice";
    cancelEditBtn.classList.add("hidden");
  }

  cancelEditBtn.addEventListener("click", resetForm);

  noticeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const notices = getNotices();
    const id = noticeIdField.value;

    const record = {
      id: id || cryptoId(),
      title: titleInput.value.trim(),
      department: departmentInput.value,
      priority: priorityInput.value,
      content: contentInput.value.trim(),
      attachmentUrl: attachmentInput.value.trim(),
      postedOn: id ? notices.find(n => n.id === id).postedOn : new Date().toISOString().split("T")[0],
      expiryDate: expiryInput.value || ""
    };

    if (id) {
      const idx = notices.findIndex(n => n.id === id);
      notices[idx] = record;
    } else {
      notices.push(record);
    }

    saveNotices(notices);
    resetForm();
    renderTable();
  });

  function renderTable() {
    const notices = getNotices().sort((a, b) => (a.postedOn < b.postedOn ? 1 : -1));
    tableBody.innerHTML = "";
    noticeCount.textContent = notices.length;

    if (notices.length === 0) {
      noNotices.style.display = "block";
      return;
    }
    noNotices.style.display = "none";

    notices.forEach(n => {
      const tr = document.createElement("tr");
      const expired = isExpired(n);
      tr.innerHTML = `
        <td>${escapeHtml(n.title)}</td>
        <td>${escapeHtml(n.department)}</td>
        <td>${escapeHtml(n.priority)}</td>
        <td>${n.postedOn}</td>
        <td>${n.expiryDate || "-"} ${expired ? "<br><small style='color:#d64545;'>Expired</small>" : ""}</td>
        <td class="actions">
          <button class="edit-btn" data-id="${n.id}">Edit</button>
          <button class="delete-btn" data-id="${n.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    tableBody.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => loadForEdit(btn.dataset.id));
    });
    tableBody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteNotice(btn.dataset.id));
    });
  }

  function loadForEdit(id) {
    const notice = getNotices().find(n => n.id === id);
    if (!notice) return;
    noticeIdField.value = notice.id;
    titleInput.value = notice.title;
    departmentInput.value = notice.department;
    priorityInput.value = notice.priority;
    expiryInput.value = notice.expiryDate;
    contentInput.value = notice.content;
    attachmentInput.value = notice.attachmentUrl;
    formTitle.textContent = "Edit Notice";
    submitBtn.textContent = "Update Notice";
    cancelEditBtn.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteNotice(id) {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    const notices = getNotices().filter(n => n.id !== id);
    saveNotices(notices);
    renderTable();
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  seedNoticesIfEmpty();
  document.getElementById("year").textContent = new Date().getFullYear();

  if (document.getElementById("noticeList")) {
    initHomePage();
  }
  if (document.getElementById("loginForm")) {
    initAdminPage();
  }
});
