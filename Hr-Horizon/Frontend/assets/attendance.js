renderShell("attendance", "Attendance Management", "Mark today's attendance and review historical trends.");

// Tabs
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    if (btn.dataset.tab === "reports") loadReports();
  });
});

const dateInput = document.getElementById("attendance-date");
dateInput.value = todayISO();

const STATUS_OPTIONS = ["Not Marked", "Present", "Absent", "Half Day", "Late Arrival", "On Leave"];

async function loadSheet() {
  const date = dateInput.value;
  const dept = document.getElementById("attendance-dept-filter").value;
  try {
    let sheet = await api.get(`/attendance/today/${date}`);
    if (dept) sheet = sheet.filter((r) => r.department === dept);
    renderSheet(sheet, date);
  } catch (err) {
    toast("Couldn't load attendance: " + err.message, "error");
  }
}

function renderSheet(sheet, date) {
  const body = document.getElementById("attendance-body");
  const present = sheet.filter((r) => r.status === "Present" || r.status === "Late Arrival").length;
  document.getElementById("attendance-summary").textContent = `${present} / ${sheet.length} present`;

  body.innerHTML = sheet.map((r) => `
    <tr data-emp="${r.employeeId}">
      <td>
        <div class="emp-cell">
          <div class="emp-avatar">${initials(r.employeeName)}</div>
          <div class="emp-name">${escapeHtml(r.employeeName)}</div>
        </div>
      </td>
      <td>${escapeHtml(r.department)}</td>
      <td>
        <select class="status-select" data-emp="${r.employeeId}">
          ${STATUS_OPTIONS.map((s) => `<option ${s === r.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td><input type="time" class="in-input" data-emp="${r.employeeId}" value="${r.punchIn || ""}" /></td>
      <td><input type="time" class="out-input" data-emp="${r.employeeId}" value="${r.punchOut || ""}" /></td>
      <td class="mono">${r.hours || 0}</td>
    </tr>
  `).join("");

  body.querySelectorAll(".status-select, .in-input, .out-input").forEach((el) => {
    el.addEventListener("change", () => saveRow(el.dataset.emp, date));
  });
}

async function saveRow(employeeId, date) {
  const row = document.querySelector(`tr[data-emp="${employeeId}"]`);
  const status = row.querySelector(".status-select").value;
  const punchIn = row.querySelector(".in-input").value;
  const punchOut = row.querySelector(".out-input").value;
  try {
    await api.post("/attendance", { employeeId, date, status, punchIn, punchOut });
    toast(`Attendance saved for ${row.querySelector(".emp-name").textContent}`, "success");
    loadSheet();
  } catch (err) {
    toast("Save failed: " + err.message, "error");
  }
}

dateInput.addEventListener("change", loadSheet);
document.getElementById("attendance-dept-filter").addEventListener("change", loadSheet);

// Populate department filter + time-tracking employee select
(async () => {
  const emps = await api.get("/employees");
  const depts = [...new Set(emps.map((e) => e.department))].sort();
  const deptSel = document.getElementById("attendance-dept-filter");
  depts.forEach((d) => { const o = document.createElement("option"); o.value = d; o.textContent = d; deptSel.appendChild(o); });

  const ttSel = document.getElementById("tt-employee");
  emps.filter((e) => e.status === "Active").forEach((e) => {
    const o = document.createElement("option"); o.value = e.id; o.textContent = `${e.name} (${e.id})`;
    ttSel.appendChild(o);
  });
})();

document.getElementById("tt-save").addEventListener("click", async () => {
  const employeeId = document.getElementById("tt-employee").value;
  const punchIn = document.getElementById("tt-in").value;
  const punchOut = document.getElementById("tt-out").value;
  if (!employeeId || !punchIn || !punchOut) return toast("Fill employee, punch in and punch out", "error");
  try {
    const rec = await api.post("/attendance", { employeeId, date: todayISO(), status: "Present", punchIn, punchOut });
    document.getElementById("tt-result").textContent = `Total work hours: ${rec.hours} hrs`;
    toast("Punch record saved", "success");
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
});

async function loadReports() {
  try {
    const [all, dash] = await Promise.all([api.get("/attendance"), api.get("/dashboard")]);
    // Monthly summary: count by status
    const counts = {};
    all.forEach((a) => (counts[a.status] = (counts[a.status] || 0) + 1));
    const labels = Object.keys(counts);
    new Chart(document.getElementById("chart-monthly-att"), {
      type: "bar",
      data: { labels, datasets: [{ data: labels.map((l) => counts[l]), backgroundColor: "#2D4356", borderRadius: 6, maxBarThickness: 40 }] },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: "#EAEDF1" } }, x: { grid: { display: false } } } },
    });

    const ar = dash.charts.attendanceRatio;
    new Chart(document.getElementById("chart-dept-att"), {
      type: "bar",
      data: { labels: ar.map((a) => a.department), datasets: [{ data: ar.map((a) => a.ratio), backgroundColor: "#C08A3E", borderRadius: 6, maxBarThickness: 40 }] },
      options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { y: { beginAtZero: true, suggestedMax: 100, grid: { color: "#EAEDF1" } }, x: { grid: { display: false } } } },
    });
  } catch (err) {
    toast("Couldn't load reports: " + err.message, "error");
  }
}

loadSheet();
