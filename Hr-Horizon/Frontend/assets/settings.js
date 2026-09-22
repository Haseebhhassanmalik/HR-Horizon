renderShell("settings", "Admin Panel", "Manage admin users, company settings, and audit history.");

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    if (btn.dataset.tab === "audit") loadAudit();
  });
});

async function loadUsers() {
  try {
    const [users, emps] = await Promise.all([api.get("/settings/users"), api.get("/employees")]);
    const empMap = Object.fromEntries(emps.map((e) => [e.id, e.name]));
    document.getElementById("users-body").innerHTML = users.map((u) => `
      <tr>
        <td class="mono">${escapeHtml(u.username)}</td>
        <td><span class="pill pill-leave">${escapeHtml(u.role)}</span></td>
        <td>${escapeHtml(empMap[u.employeeId] || "-")}</td>
      </tr>
    `).join("");
  } catch (err) {
    toast("Couldn't load users: " + err.message, "error");
  }
}

document.getElementById("new-user-btn").addEventListener("click", () => document.getElementById("user-modal").classList.add("open"));
function closeUserModal() { document.getElementById("user-modal").classList.remove("open"); }

document.getElementById("user-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api.post("/settings/users", data);
    toast("Admin user created", "success");
    closeUserModal();
    e.target.reset();
    loadUsers();
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
});

const settingsForm = document.getElementById("settings-form");

async function loadSettings() {
  try {
    const s = await api.get("/settings");
    Object.keys(s).forEach((key) => {
      const field = settingsForm.elements[key];
      if (field) field.value = s[key];
    });
    document.getElementById("leave-policy-fields").innerHTML = Object.entries(s.leavePolicy || {}).map(([type, days]) => `
      <div class="field"><label>${type}</label><input type="number" min="0" data-leave-type="${type}" value="${days}" /></div>
    `).join("");
  } catch (err) {
    toast("Couldn't load settings: " + err.message, "error");
  }
}

settingsForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.taxSlabPercent = Number(data.taxSlabPercent);
  data.leavePolicy = {};
  document.querySelectorAll("[data-leave-type]").forEach((el) => (data.leavePolicy[el.dataset.leaveType] = Number(el.value)));
  try {
    await api.put("/settings", data);
    toast("Settings saved", "success");
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
});

async function loadAudit() {
  try {
    const logs = await api.get("/settings/audit-logs");
    const el = document.getElementById("audit-body");
    el.innerHTML = logs.length ? logs.map((l) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div>
          <div><strong>${escapeHtml(l.action)}</strong></div>
          <div class="timeline-time">${escapeHtml(l.details)} · ${new Date(l.timestamp).toLocaleString()}</div>
        </div>
      </div>`).join("") : `<div class="empty-state">No changes recorded yet.</div>`;
  } catch (err) {
    toast("Couldn't load audit logs: " + err.message, "error");
  }
}

loadUsers();
loadSettings();
