renderShell("payroll", "Payroll Management", "Run automated salary calculations and generate pay slips.");

const monthInput = document.getElementById("payroll-month");
monthInput.value = new Date().toISOString().slice(0, 7);

let chartInstance = null;

function renderSlips(slips, totalNet, savedLabel) {
  document.getElementById("payroll-total").textContent = "Total Net Payout: " + fmtMoney(totalNet);
  document.getElementById("payroll-status").textContent = savedLabel;

  document.getElementById("payroll-body").innerHTML = slips.map((s) => `
    <tr>
      <td><div class="emp-name">${escapeHtml(s.employeeName)}</div><div class="emp-sub" style="font-family:inherit">${escapeHtml(s.designation)}</div></td>
      <td>${escapeHtml(s.department)}</td>
      <td class="mono">${fmtMoney(s.basicSalary)}</td>
      <td class="mono">${fmtMoney(s.houseRent + s.medical + s.transport)}</td>
      <td class="mono">${fmtMoney(s.gross)}</td>
      <td class="mono">${fmtMoney(s.tax)}</td>
      <td class="mono" style="font-weight:700">${fmtMoney(s.net)}</td>
    </tr>
  `).join("");

  const deptTotals = {};
  slips.forEach((s) => (deptTotals[s.department] = (deptTotals[s.department] || 0) + s.net));
  const labels = Object.keys(deptTotals);

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(document.getElementById("chart-payroll-dept"), {
    type: "bar",
    data: { labels, datasets: [{ data: labels.map((l) => deptTotals[l]), backgroundColor: "#2D4356", borderRadius: 6, maxBarThickness: 50 }] },
    options: { plugins: { legend: { display: false } }, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: "#EAEDF1" } }, x: { grid: { display: false } } } },
  });
}

document.getElementById("preview-btn").addEventListener("click", async () => {
  try {
    const data = await api.get("/payroll/preview/" + monthInput.value);
    renderSlips(data.slips, data.totalNet, "Preview — not yet saved");
  } catch (err) {
    toast("Preview failed: " + err.message, "error");
  }
});

document.getElementById("generate-btn").addEventListener("click", async () => {
  if (!confirm(`Generate the payroll run for ${monthInput.value}? This will save pay slips for all active employees.`)) return;
  try {
    const run = await api.post("/payroll/generate", { month: monthInput.value });
    renderSlips(run.slips, run.totalNet, `Saved run · generated ${fmtDate(run.generatedOn)}`);
    toast("Payroll run generated", "success");
  } catch (err) {
    toast("Generation failed: " + err.message, "error");
  }
});

document.getElementById("preview-btn").click();
