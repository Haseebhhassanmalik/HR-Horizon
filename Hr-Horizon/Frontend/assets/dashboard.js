renderShell("dashboard", "Dashboard", "Welcome back — here's what's happening across HR Horizon today.");

const PALETTE = ["#2D4356", "#C08A3E", "#3A7D5C", "#8AA1B4", "#B24C4C", "#6D5A9E"];

function kpiCard({ label, value, color, trend }) {
  return `
    <div class="kpi-card" style="--kpi-color:${color}">
      <div class="kpi-label">${label}</div>
      <div class="kpi-value">${value}</div>
      ${trend ? `<div class="kpi-trend">${trend}</div>` : ""}
    </div>`;
}

async function loadDashboard() {
  try {
    const data = await api.get("/dashboard");
    const k = data.kpis;

    document.getElementById("kpi-grid").innerHTML = [
      kpiCard({ label: "Total Employees", value: k.totalEmployees, color: "#2D4356" }),
      kpiCard({ label: "Present Today", value: k.presentToday, color: "#3A7D5C" }),
      kpiCard({ label: "Total Departments", value: k.totalDepartments, color: "#C08A3E" }),
      kpiCard({ label: "Monthly Salary", value: fmtMoney(k.monthlySalary), color: "#8AA1B4" }),
      kpiCard({ label: "Turnover Rate", value: k.turnoverRate + "%", color: "#B24C4C" }),
      kpiCard({ label: "Average Tenure", value: k.avgTenure + " yrs", color: "#6D5A9E" }),
      kpiCard({ label: "Pending Leaves", value: k.pendingLeaves, color: "#C08A3E" }),
    ].join("");

    // Department bar chart
    const deptLabels = Object.keys(data.charts.departmentCounts);
    new Chart(document.getElementById("chart-dept"), {
      type: "bar",
      data: {
        labels: deptLabels,
        datasets: [{
          data: deptLabels.map((d) => data.charts.departmentCounts[d]),
          backgroundColor: "#2D4356",
          borderRadius: 6,
          maxBarThickness: 42,
        }],
      },
      options: baseOpts({ legend: false }),
    });

    // Gender pie
    const genderLabels = Object.keys(data.charts.genderCounts);
    new Chart(document.getElementById("chart-gender"), {
      type: "doughnut",
      data: {
        labels: genderLabels,
        datasets: [{ data: genderLabels.map((g) => data.charts.genderCounts[g]), backgroundColor: PALETTE }],
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { family: "Inter" } } } }, cutout: "62%" },
    });

    // Salary trend line
    new Chart(document.getElementById("chart-salary"), {
      type: "line",
      data: {
        labels: data.charts.salaryTrend.map((m) => m.month),
        datasets: [{
          data: data.charts.salaryTrend.map((m) => m.total),
          borderColor: "#C08A3E",
          backgroundColor: "rgba(192,138,62,0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        }],
      },
      options: baseOpts({ legend: false }),
    });

    // Employee flow (joins vs departures, derived from employees list - simple monthly joins)
    const emps = await api.get("/employees");
    const flowMonths = data.charts.salaryTrend.map((m) => m.month);
    const now = new Date();
    const joinsByMonth = flowMonths.map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
      const ym = d.toISOString().slice(0, 7);
      return emps.filter((e) => e.joiningDate && e.joiningDate.slice(0, 7) === ym).length;
    });
    new Chart(document.getElementById("chart-flow"), {
      type: "bar",
      data: {
        labels: flowMonths,
        datasets: [
          { label: "Joined", data: joinsByMonth, backgroundColor: "#3A7D5C", borderRadius: 5, maxBarThickness: 26 },
          { label: "Exited", data: flowMonths.map(() => 0), backgroundColor: "#B24C4C", borderRadius: 5, maxBarThickness: 26 },
        ],
      },
      options: baseOpts({ legend: true }),
    });

    // Attendance ratio by department
    const ar = data.charts.attendanceRatio;
    new Chart(document.getElementById("chart-attendance"), {
      type: "bar",
      data: {
        labels: ar.map((a) => a.department),
        datasets: [{ data: ar.map((a) => a.ratio), backgroundColor: "#8AA1B4", borderRadius: 5, maxBarThickness: 30 }],
      },
      options: baseOpts({ legend: false, suggestedMax: 100 }),
    });

    // Education/seniority vs salary
    const sb = data.charts.educationVsSalary;
    new Chart(document.getElementById("chart-education"), {
      type: "bar",
      data: {
        labels: sb.map((b) => b.band),
        datasets: [{ data: sb.map((b) => b.avg), backgroundColor: "#6D5A9E", borderRadius: 5, maxBarThickness: 30 }],
      },
      options: baseOpts({ legend: false }),
    });

    // Recent activity
    const activityEl = document.getElementById("recent-activity");
    if (!data.recentActivity.length) {
      activityEl.innerHTML = `<div class="empty-state" style="padding:20px">No recent activity yet.</div>`;
    } else {
      activityEl.innerHTML = data.recentActivity.map((a) => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div>
            <div><strong>${escapeHtml(a.action)}</strong></div>
            <div class="timeline-time">${escapeHtml(a.details)}</div>
          </div>
        </div>`).join("");
    }
  } catch (err) {
    toast("Couldn't load dashboard: " + err.message, "error");
  }
}

function baseOpts({ legend = false, suggestedMax } = {}) {
  return {
    plugins: { legend: { display: legend, labels: { boxWidth: 10, font: { family: "Inter" } } } },
    scales: {
      y: { beginAtZero: true, suggestedMax, grid: { color: "#EAEDF1" }, ticks: { font: { family: "Inter" } } },
      x: { grid: { display: false }, ticks: { font: { family: "Inter" } } },
    },
    maintainAspectRatio: false,
  };
}

loadDashboard();
