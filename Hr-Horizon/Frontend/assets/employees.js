renderShell("employees", "Employees", "Search, filter, and manage every employee record.");

const params = new URLSearchParams(window.location.search);
let currentFilters = { search: params.get("q") || "", department: "", status: "", gender: "" };

const searchInput = document.getElementById("emp-search");
if (currentFilters.search) searchInput.value = currentFilters.search;

async function populateDeptFilter() {
  const settings = await api.get("/settings");
  const sel = document.getElementById("filter-department");
  (settings.leavePolicy ? Object.keys({ IT: 1, HR: 1, Finance: 1, Marketing: 1, Sales: 1 }) : []); // no-op guard
}

async function loadEmployees() {
  const q = new URLSearchParams();
  if (currentFilters.search) q.set("search", currentFilters.search);
  if (currentFilters.department) q.set("department", currentFilters.department);
  if (currentFilters.status) q.set("status", currentFilters.status);
  if (currentFilters.gender) q.set("gender", currentFilters.gender);

  try {
    const emps = await api.get("/employees?" + q.toString());
    renderTable(emps);
  } catch (err) {
    toast("Couldn't load employees: " + err.message, "error");
  }
}

function renderTable(emps) {
  const body = document.getElementById("emp-table-body");
  const empty = document.getElementById("emp-empty");
  if (!emps.length) {
    body.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  body.innerHTML = emps.map((e) => `
    <tr>
      <td>
        <div class="emp-cell">
          <div class="emp-avatar">${initials(e.name)}</div>
          <div>
            <div class="emp-name">${escapeHtml(e.name)}</div>
            <div class="emp-sub">${escapeHtml(e.cnic)}</div>
          </div>
        </div>
      </td>
      <td>
        <div>${escapeHtml(e.department)}</div>
        <div class="emp-sub" style="font-family:inherit">${escapeHtml(e.designation)}</div>
      </td>
      <td class="mono">${fmtMoney(e.basicSalary + e.houseRent + e.medical + e.transport)}</td>
      <td><span class="pill ${pillClass(e.status)}">${e.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-action" title="View" onclick="viewProfile('${e.id}')">${ICONS.view}</button>
          <a class="icon-action" title="Edit" href="add-employee.html?id=${e.id}">${ICONS.edit}</a>
          <button class="icon-action danger" title="Delete" onclick="deleteEmployee('${e.id}','${escapeHtml(e.name)}')">${ICONS.trash}</button>
        </div>
      </td>
    </tr>
  `).join("");
}

async function deleteEmployee(id, name) {
  if (!confirm(`Remove ${name} (${id}) from HR Horizon? This cannot be undone.`)) return;
  try {
    await api.del("/employees/" + id);
    toast(`${name} removed`, "success");
    loadEmployees();
  } catch (err) {
    toast("Delete failed: " + err.message, "error");
  }
}

async function viewProfile(id) {
  try {
    const e = await api.get("/employees/" + id);
    document.getElementById("profile-name").textContent = e.name;
    const gross = e.basicSalary + e.houseRent + e.medical + e.transport;
    const recentAttendance = e.attendanceHistory.slice(0, 6);
    const leaveRows = e.leaveHistory.slice(0, 5);

    document.getElementById("profile-body").innerHTML = `
      <div class="tabs">
        <button class="tab-btn active" data-tab="info">Info</button>
        <button class="tab-btn" data-tab="attendance">Attendance</button>
        <button class="tab-btn" data-tab="leave">Leave Balance</button>
      </div>
      <div class="tab-panel active" data-panel="info">
        <div class="form-grid" style="margin-bottom:16px">
          <div><div class="kpi-label">CNIC</div><div class="mono">${escapeHtml(e.cnic)}</div></div>
          <div><div class="kpi-label">Father Name</div><div>${escapeHtml(e.fatherName || "-")}</div></div>
          <div><div class="kpi-label">Department</div><div>${escapeHtml(e.department)}</div></div>
          <div><div class="kpi-label">Designation</div><div>${escapeHtml(e.designation)}</div></div>
          <div><div class="kpi-label">Joining Date</div><div>${fmtDate(e.joiningDate)}</div></div>
          <div><div class="kpi-label">Employment Type</div><div>${escapeHtml(e.employmentType)}</div></div>
          <div><div class="kpi-label">Email</div><div>${escapeHtml(e.email)}</div></div>
          <div><div class="kpi-label">Phone</div><div class="mono">${escapeHtml(e.phone)}</div></div>
          <div><div class="kpi-label">Address</div><div>${escapeHtml(e.address || "-")}</div></div>
          <div><div class="kpi-label">Gross Salary</div><div class="mono">${fmtMoney(gross)}</div></div>
        </div>
      </div>
      <div class="tab-panel" data-panel="attendance">
        ${recentAttendance.length ? `
        <table><thead><tr><th>Date</th><th>Status</th><th>Hours</th></tr></thead>
        <tbody>${recentAttendance.map((a) => `<tr><td>${fmtDate(a.date)}</td><td><span class="pill ${pillClass(a.status)}">${a.status}</span></td><td>${a.hours || 0}</td></tr>`).join("")}</tbody></table>
        ` : `<div class="empty-state">No attendance records yet.</div>`}
      </div>
      <div class="tab-panel" data-panel="leave">
        <div class="form-grid">
          ${Object.entries(e.leaveBalance || {}).map(([type, days]) => `
            <div class="kpi-card" style="--kpi-color:#C08A3E"><div class="kpi-label">${type}</div><div class="kpi-value" style="font-size:22px">${days} days</div></div>
          `).join("")}
        </div>
      </div>
    `;
    document.querySelectorAll("#profile-body .tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#profile-body .tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll("#profile-body .tab-panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        document.querySelector(`#profile-body .tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
      });
    });

    document.getElementById("profile-modal").classList.add("open");
  } catch (err) {
    toast("Couldn't load profile: " + err.message, "error");
  }
}

function closeProfile() {
  document.getElementById("profile-modal").classList.remove("open");
}

searchInput.addEventListener("input", debounce((e) => {
  currentFilters.search = e.target.value;
  loadEmployees();
}, 300));

document.getElementById("filter-department").addEventListener("change", (e) => { currentFilters.department = e.target.value; loadEmployees(); });
document.getElementById("filter-status").addEventListener("change", (e) => { currentFilters.status = e.target.value; loadEmployees(); });
document.getElementById("filter-gender").addEventListener("change", (e) => { currentFilters.gender = e.target.value; loadEmployees(); });

// Populate department dropdown from settings/departments
(async () => {
  try {
    const emps = await api.get("/employees");
    const depts = [...new Set(emps.map((e) => e.department))].sort();
    const sel = document.getElementById("filter-department");
    depts.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d; opt.textContent = d;
      sel.appendChild(opt);
    });
  } catch (e) {}
})();

loadEmployees();
