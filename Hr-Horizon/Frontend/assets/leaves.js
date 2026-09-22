renderShell("leaves", "Leave Management", "Apply for leave, review balances, and manage approvals.");

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    if (btn.dataset.tab === "dashboard") loadBalance();
    if (btn.dataset.tab === "requests") loadRequests();
    if (btn.dataset.tab === "history") loadHistory();
  });
});

let allEmployees = [];

async function loadEmployeeDropdowns() {
  allEmployees = await api.get("/employees?status=Active");
  const opts = allEmployees.map((e) => `<option value="${e.id}">${escapeHtml(e.name)} (${e.id})</option>`).join("");
  document.getElementById("leave-employee").innerHTML = opts;
  document.getElementById("balance-employee").innerHTML = opts;
}

document.getElementById("leave-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  if (data.endDate < data.startDate) return toast("End date can't be before start date", "error");
  try {
    await api.post("/leaves", data);
    toast("Leave request submitted", "success");
    e.target.reset();
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
});

async function loadBalance() {
  const empId = document.getElementById("balance-employee").value;
  if (!empId) return;
  try {
    const balance = await api.get("/leaves/balance/" + empId);
    document.getElementById("balance-grid").innerHTML = Object.entries(balance).map(([type, days]) => `
      <div class="kpi-card" style="--kpi-color:#C08A3E">
        <div class="kpi-label">${type}</div>
        <div class="kpi-value">${days}</div>
        <div class="kpi-trend">days remaining</div>
      </div>`).join("");

    const emp = allEmployees.find((e) => e.id === empId);
    const leaves = await api.get("/leaves?employeeId=" + empId);
    renderCalendar(leaves, emp ? emp.name : "");
  } catch (err) {
    toast("Couldn't load balance: " + err.message, "error");
  }
}

function renderCalendar(leaves, empName) {
  const now = new Date();
  const label = now.toLocaleString("en-US", { month: "long", year: "numeric" });
  document.getElementById("cal-month-label").textContent = label;

  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const leaveDays = new Set();
  leaves.filter((l) => l.status === "Approved" || l.status === "Pending").forEach((l) => {
    let d = new Date(l.startDate);
    const end = new Date(l.endDate);
    while (d <= end) { leaveDays.add(d.getDate()); d.setDate(d.getDate() + 1); }
  });

  let cells = "";
  for (let i = 0; i < firstDay; i++) cells += `<div></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isLeave = leaveDays.has(d);
    cells += `<div style="padding:8px 4px; text-align:center; font-size:12px; border-radius:6px; ${isLeave ? "background:var(--accent-tint); color:var(--accent); font-weight:700;" : "color:var(--ink-soft);"}">${d}</div>`;
  }

  document.getElementById("leave-calendar").innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:6px; font-size:11px; text-transform:uppercase; color:var(--muted); text-align:center">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(7,1fr); gap:4px">${cells}</div>
    <div style="margin-top:12px; font-size:12px; color:var(--muted)">Highlighted days show ${escapeHtml(empName)}'s pending/approved leave this month.</div>
  `;
}

document.getElementById("balance-employee").addEventListener("change", loadBalance);

async function loadRequests() {
  const status = document.getElementById("requests-status-filter").value;
  try {
    const leaves = await api.get("/leaves" + (status ? "?status=" + status : ""));
    const body = document.getElementById("requests-body");
    if (!leaves.length) {
      body.innerHTML = `<tr><td colspan="6"><div class="empty-state">No requests found.</div></td></tr>`;
      return;
    }
    body.innerHTML = leaves.map((l) => `
      <tr>
        <td><div class="emp-name">${escapeHtml(l.employeeName)}</div></td>
        <td>${escapeHtml(l.type)}</td>
        <td class="mono">${fmtDate(l.startDate)} – ${fmtDate(l.endDate)}</td>
        <td>${escapeHtml(l.reason || "-")}</td>
        <td><span class="pill ${pillClass(l.status)}">${l.status}</span></td>
        <td>
          ${l.status === "Pending" ? `
            <div class="row-actions">
              <button class="icon-action" title="Approve" onclick="decideLeave('${l.id}','Approved')">${ICONS.check}</button>
              <button class="icon-action danger" title="Reject" onclick="decideLeave('${l.id}','Rejected')">${ICONS.x}</button>
            </div>` : ""}
        </td>
      </tr>
    `).join("");
  } catch (err) {
    toast("Couldn't load requests: " + err.message, "error");
  }
}

async function decideLeave(id, status) {
  try {
    await api.put("/leaves/" + id, { status });
    toast(`Request ${status.toLowerCase()}`, "success");
    loadRequests();
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
}

document.getElementById("requests-status-filter").addEventListener("change", loadRequests);

async function loadHistory() {
  try {
    const leaves = await api.get("/leaves");
    const body = document.getElementById("history-body");
    body.innerHTML = leaves.map((l) => `
      <tr>
        <td>${escapeHtml(l.employeeName)}</td>
        <td>${escapeHtml(l.type)}</td>
        <td class="mono">${fmtDate(l.startDate)} – ${fmtDate(l.endDate)}</td>
        <td>${fmtDate(l.appliedOn)}</td>
        <td><span class="pill ${pillClass(l.status)}">${l.status}</span></td>
      </tr>
    `).join("");
    window.__leaveHistoryCache = leaves;
  } catch (err) {
    toast("Couldn't load history: " + err.message, "error");
  }
}

document.getElementById("export-leave-csv").addEventListener("click", () => {
  const leaves = window.__leaveHistoryCache || [];
  if (!leaves.length) return toast("Nothing to export", "error");
  const header = "Employee,Type,Start,End,Applied On,Status\n";
  const rows = leaves.map((l) => [l.employeeName, l.type, l.startDate, l.endDate, l.appliedOn, l.status].join(",")).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "leave-history.csv"; a.click();
  URL.revokeObjectURL(url);
});

(async () => {
  await loadEmployeeDropdowns();
  loadBalance();
  loadRequests();
})();
