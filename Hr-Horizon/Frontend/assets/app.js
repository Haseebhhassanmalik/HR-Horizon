// ===== Icon set (inline SVG, minimal feather-style) =====
const ICONS = {
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
  employees: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="8.5" r="2.6"/><path d="M21.5 20c0-2.7-1.9-5-4.5-5.7"/></svg>',
  addEmp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.2"/><path d="M2 20c0-3.3 2.7-6 7-6s7 2.7 7 6"/><path d="M19 8v6M16 11h6"/></svg>',
  attendance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="m8.5 15 2 2 4.5-4.5"/></svg>',
  leaves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12A8 8 0 1 1 12 4"/><path d="M20 4 12 12"/><path d="M15 4h5v5"/></svg>',
  payroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="12" cy="12" r="3.2"/><path d="M6 9h.01M18 15h.01"/></svg>',
  recruitment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 13h6M9 17h4"/></svg>',
  performance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg>',
  reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6M9 9h1"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>',
  view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M3 7l3-4h12l3 4M9 12h6"/></svg>',
};

const NAV_ITEMS = [
  { group: "Overview", items: [
    { key: "dashboard", label: "Dashboard", href: "index.html", icon: "dashboard" },
  ]},
  { group: "Workforce", items: [
    { key: "employees", label: "Employees", href: "employees.html", icon: "employees" },
    { key: "add-employee", label: "Add Employee", href: "add-employee.html", icon: "addEmp" },
    { key: "attendance", label: "Attendance", href: "attendance.html", icon: "attendance" },
    { key: "leaves", label: "Leave Management", href: "leaves.html", icon: "leaves" },
  ]},
  { group: "Operations", items: [
    { key: "payroll", label: "Payroll", href: "payroll.html", icon: "payroll" },
    { key: "recruitment", label: "Recruitment", href: "recruitment.html", icon: "recruitment" },
    { key: "performance", label: "Performance", href: "performance.html", icon: "performance" },
    { key: "reports", label: "Reports & Analytics", href: "reports.html", icon: "reports" },
  ]},
  { group: "System", items: [
    { key: "settings", label: "Admin Panel", href: "settings.html", icon: "settings" },
  ]},
];

function initials(name) {
  return (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function renderSidebar(activeKey) {
  const groups = NAV_ITEMS.map((g) => `
    <div class="nav-group-label">${g.group}</div>
    ${g.items.map((item) => `
      <a class="nav-link ${item.key === activeKey ? "active" : ""}" href="${item.href}">
        ${ICONS[item.icon]}<span>${item.label}</span>
      </a>`).join("")}
  `).join("");

  return `
    <div class="brand">
      <div class="brand-mark">HH</div>
      <div>
        <div class="brand-name">HR Horizon</div>
        <div class="brand-sub">Workforce OS</div>
      </div>
    </div>
    <nav>${groups}</nav>
    <div class="sidebar-footer">HR Horizon v1.0<br>&copy; 2026 HR Horizon</div>
  `;
}

function renderTopbar(title, subtitle) {
  return `
    <div>
      <h1 class="page-title">${title}</h1>
      ${subtitle ? `<div class="page-subtitle">${subtitle}</div>` : ""}
    </div>
    <div class="topbar-right">
      <div class="search-box" id="global-search-box">
        ${ICONS.search}
        <input type="text" id="global-search" placeholder="Search employees, CNIC, email..." />
      </div>
      <button class="icon-btn" title="Notifications">${ICONS.bell}<span class="badge-dot"></span></button>
      <div class="avatar" id="topbar-avatar">SK</div>
    </div>
  `;
}

function renderShell(activeKey, title, subtitle) {
  document.getElementById("sidebar").innerHTML = renderSidebar(activeKey);
  document.getElementById("topbar").innerHTML = renderTopbar(title, subtitle);

  const search = document.getElementById("global-search");
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && search.value.trim()) {
      window.location.href = "employees.html?q=" + encodeURIComponent(search.value.trim());
    }
  });
}

// ===== Toasts =====
function ensureToastWrap() {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  return wrap;
}

function toast(message, type = "default") {
  const wrap = ensureToastWrap();
  const el = document.createElement("div");
  el.className = "toast" + (type !== "default" ? " " + type : "");
  el.innerHTML = `${type === "success" ? ICONS.check : type === "error" ? ICONS.x : ""}<span>${message}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ===== Small helpers =====
function fmtMoney(n) {
  return "Rs. " + Math.round(n || 0).toLocaleString("en-PK");
}

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pillClass(status) {
  const map = {
    Active: "pill-active", Present: "pill-present", Approved: "pill-approved", Completed: "pill-completed",
    Inactive: "pill-inactive", Absent: "pill-absent", Rejected: "pill-rejected",
    Pending: "pill-pending", "Half Day": "pill-half", "Late Arrival": "pill-late", "In Progress": "pill-progress",
    "On Leave": "pill-leave", "Not Marked": "pill-pending",
  };
  return map[status] || "pill-leave";
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
