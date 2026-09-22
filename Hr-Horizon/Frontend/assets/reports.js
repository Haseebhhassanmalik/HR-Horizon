renderShell("reports", "Reports & Analytics", "Turn raw HR data into decisions.");

let chart1, chart2;
let currentTableData = { headers: [], rows: [] };

function destroyCharts() {
  if (chart1) chart1.destroy();
  if (chart2) chart2.destroy();
}

function kpi(label, value, color) {
  return `<div class="kpi-card" style="--kpi-color:${color}"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`;
}

function drawBar(canvasId, labels, data, color) {
  return new Chart(document.getElementById(canvasId), {
    type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: color, borderRadius: 6, maxBarThickness: 44 }] },
    options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: "#EAEDF1" } }, x: { grid: { display: false } } } },
  });
}

function drawDoughnut(canvasId, labels, data) {
  return new Chart(document.getElementById(canvasId), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: ["#2D4356", "#C08A3E", "#3A7D5C", "#8AA1B4", "#B24C4C", "#6D5A9E"] }] },
    options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } }, cutout: "60%" },
  });
}

function setTable(title, headers, rows) {
  document.getElementById("table-title").textContent = title;
  document.getElementById("report-thead").innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  document.getElementById("report-tbody").innerHTML = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  currentTableData = { headers, rows };
}

async function runReport(type) {
  destroyCharts();
  try {
    const [emps, leaves, attendance, dash] = await Promise.all([
      api.get("/employees"), api.get("/leaves"), api.get("/attendance"), api.get("/dashboard"),
    ]);

    if (type === "turnover") {
      const active = emps.filter((e) => e.status === "Active").length;
      const inactive = emps.filter((e) => e.status === "Inactive").length;
      document.getElementById("report-kpis").innerHTML = [
        kpi("Turnover Rate", dash.kpis.turnoverRate + "%", "#B24C4C"),
        kpi("Active Employees", active, "#3A7D5C"),
        kpi("Exited Employees", inactive, "#B24C4C"),
        kpi("Avg. Tenure", dash.kpis.avgTenure + " yrs", "#2D4356"),
      ].join("");
      document.getElementById("chart1-title").textContent = "Active vs Exited";
      chart1 = drawDoughnut("report-chart-1", ["Active", "Exited"], [active, inactive]);
      const deptLabels = Object.keys(dash.charts.departmentCounts);
      document.getElementById("chart2-title").textContent = "Headcount by Department";
      chart2 = drawBar("report-chart-2", deptLabels, deptLabels.map((d) => dash.charts.departmentCounts[d]), "#2D4356");
      setTable("Employee Status Detail", ["Name", "Department", "Status", "Joining Date"],
        emps.map((e) => [escapeHtml(e.name), escapeHtml(e.department), `<span class="pill ${pillClass(e.status)}">${e.status}</span>`, fmtDate(e.joiningDate)]));

    } else if (type === "attendance") {
      const counts = {};
      attendance.forEach((a) => (counts[a.status] = (counts[a.status] || 0) + 1));
      const presentPct = attendance.length ? Math.round(((counts["Present"] || 0) + (counts["Late Arrival"] || 0)) / attendance.length * 100) : 0;
      document.getElementById("report-kpis").innerHTML = [
        kpi("Total Records", attendance.length, "#2D4356"),
        kpi("Present Rate", presentPct + "%", "#3A7D5C"),
        kpi("Absences", counts["Absent"] || 0, "#B24C4C"),
        kpi("Late Arrivals", counts["Late Arrival"] || 0, "#C08A3E"),
      ].join("");
      document.getElementById("chart1-title").textContent = "Status Breakdown";
      chart1 = drawDoughnut("report-chart-1", Object.keys(counts), Object.values(counts));
      const ar = dash.charts.attendanceRatio;
      document.getElementById("chart2-title").textContent = "Attendance Ratio by Department";
      chart2 = drawBar("report-chart-2", ar.map((a) => a.department), ar.map((a) => a.ratio), "#8AA1B4");
      setTable("Recent Attendance", ["Employee", "Department", "Date", "Status", "Hours"],
        attendance.slice(0, 40).map((a) => [escapeHtml(a.employeeName), escapeHtml(a.department), fmtDate(a.date), `<span class="pill ${pillClass(a.status)}">${a.status}</span>`, a.hours || 0]));

    } else if (type === "leave") {
      const byType = {};
      leaves.forEach((l) => (byType[l.type] = (byType[l.type] || 0) + 1));
      const pending = leaves.filter((l) => l.status === "Pending").length;
      const approved = leaves.filter((l) => l.status === "Approved").length;
      document.getElementById("report-kpis").innerHTML = [
        kpi("Total Requests", leaves.length, "#2D4356"),
        kpi("Pending", pending, "#C08A3E"),
        kpi("Approved", approved, "#3A7D5C"),
        kpi("Rejected", leaves.filter((l) => l.status === "Rejected").length, "#B24C4C"),
      ].join("");
      document.getElementById("chart1-title").textContent = "Requests by Type";
      chart1 = drawDoughnut("report-chart-1", Object.keys(byType), Object.values(byType));
      const byStatus = { Pending: pending, Approved: approved, Rejected: leaves.filter((l) => l.status === "Rejected").length };
      document.getElementById("chart2-title").textContent = "Requests by Status";
      chart2 = drawBar("report-chart-2", Object.keys(byStatus), Object.values(byStatus), "#C08A3E");
      setTable("Leave Requests", ["Employee", "Type", "Dates", "Status"],
        leaves.map((l) => [escapeHtml(l.employeeName), escapeHtml(l.type), `${fmtDate(l.startDate)} – ${fmtDate(l.endDate)}`, `<span class="pill ${pillClass(l.status)}">${l.status}</span>`]));

    } else if (type === "payroll") {
      const preview = await api.get("/payroll/preview/" + new Date().toISOString().slice(0, 7));
      document.getElementById("report-kpis").innerHTML = [
        kpi("Total Net Payout", fmtMoney(preview.totalNet), "#2D4356"),
        kpi("Employees Paid", preview.slips.length, "#3A7D5C"),
        kpi("Avg. Net Salary", fmtMoney(preview.totalNet / (preview.slips.length || 1)), "#C08A3E"),
        kpi("Departments", new Set(preview.slips.map((s) => s.department)).size, "#8AA1B4"),
      ].join("");
      const deptTotals = {};
      preview.slips.forEach((s) => (deptTotals[s.department] = (deptTotals[s.department] || 0) + s.net));
      document.getElementById("chart1-title").textContent = "Net Payout by Department";
      chart1 = drawBar("report-chart-1", Object.keys(deptTotals), Object.values(deptTotals), "#2D4356");
      document.getElementById("chart2-title").textContent = "Gross vs Net (aggregate)";
      const totalGross = preview.slips.reduce((s, x) => s + x.gross, 0);
      const totalTax = preview.slips.reduce((s, x) => s + x.tax, 0);
      chart2 = drawDoughnut("report-chart-2", ["Net Payout", "Tax Withheld"], [preview.totalNet, totalTax]);
      setTable("Pay Slips (current month preview)", ["Employee", "Department", "Gross", "Tax", "Net"],
        preview.slips.map((s) => [escapeHtml(s.employeeName), escapeHtml(s.department), fmtMoney(s.gross), fmtMoney(s.tax), fmtMoney(s.net)]));
    }
  } catch (err) {
    toast("Couldn't build report: " + err.message, "error");
  }
}

document.getElementById("report-type").addEventListener("change", (e) => runReport(e.target.value));

document.getElementById("export-csv").addEventListener("click", () => {
  const { headers, rows } = currentTableData;
  if (!rows.length) return toast("Nothing to export", "error");
  const strip = (html) => html.replace(/<[^>]*>/g, "");
  const csv = [headers.join(",")].concat(rows.map((r) => r.map((c) => `"${strip(String(c)).replace(/"/g, '""')}"`).join(","))).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = document.getElementById("report-type").value + "-report.csv"; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("export-pdf").addEventListener("click", () => window.print());

runReport("turnover");
