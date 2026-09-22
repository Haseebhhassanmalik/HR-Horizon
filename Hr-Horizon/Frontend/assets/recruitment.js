renderShell("recruitment", "Recruitment", "Post jobs, track applicants, and schedule interviews.");

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add("active");
    if (btn.dataset.tab === "applicants") loadApplicants();
    if (btn.dataset.tab === "interviews") loadInterviews();
  });
});

async function loadJobs() {
  try {
    const jobs = await api.get("/recruitment/jobs");
    document.getElementById("jobs-body").innerHTML = jobs.map((j) => `
      <tr>
        <td class="emp-name">${escapeHtml(j.title)}</td>
        <td>${escapeHtml(j.department)}</td>
        <td>${fmtDate(j.postedOn)}</td>
        <td><span class="pill ${j.status === "Active" ? "pill-active" : "pill-inactive"}">${j.status}</span></td>
        <td>
          <button class="btn btn-sm ${j.status === "Active" ? "btn-outline" : "btn-accent"}" onclick="toggleJob('${j.id}','${j.status}')">
            ${j.status === "Active" ? "Close" : "Reopen"}
          </button>
        </td>
      </tr>
    `).join("");

    const filter = document.getElementById("job-filter");
    filter.innerHTML = `<option value="">All Postings</option>` + jobs.map((j) => `<option value="${j.id}">${escapeHtml(j.title)}</option>`).join("");
  } catch (err) {
    toast("Couldn't load jobs: " + err.message, "error");
  }
}

async function toggleJob(id, currentStatus) {
  try {
    await api.put("/recruitment/jobs/" + id, { status: currentStatus === "Active" ? "Closed" : "Active" });
    toast("Job posting updated", "success");
    loadJobs();
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
}

document.getElementById("new-job-btn").addEventListener("click", () => document.getElementById("job-modal").classList.add("open"));
function closeJobModal() { document.getElementById("job-modal").classList.remove("open"); }

document.getElementById("job-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api.post("/recruitment/jobs", data);
    toast("Job posted", "success");
    closeJobModal();
    e.target.reset();
    loadJobs();
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
});

async function loadApplicants() {
  try {
    const jobId = document.getElementById("job-filter").value;
    const [applicants, jobs] = await Promise.all([
      api.get("/recruitment/applicants" + (jobId ? "?jobId=" + jobId : "")),
      api.get("/recruitment/jobs"),
    ]);
    const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j.title]));
    const STATUSES = ["Applied", "Interviewed", "Hired", "Rejected"];
    document.getElementById("applicants-body").innerHTML = applicants.length ? applicants.map((a) => `
      <tr>
        <td class="emp-name">${escapeHtml(a.name)}</td>
        <td>${escapeHtml(jobMap[a.jobId] || "-")}</td>
        <td><div>${escapeHtml(a.email)}</div><div class="emp-sub">${escapeHtml(a.phone || "")}</div></td>
        <td>${fmtDate(a.appliedOn)}</td>
        <td>
          <select onchange="updateApplicantStatus('${a.id}', this.value)">
            ${STATUSES.map((s) => `<option ${s === a.status ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="5"><div class="empty-state">No applicants yet for this posting.</div></td></tr>`;
  } catch (err) {
    toast("Couldn't load applicants: " + err.message, "error");
  }
}

async function updateApplicantStatus(id, status) {
  try {
    await api.put("/recruitment/applicants/" + id, { status });
    toast("Applicant status updated", "success");
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
}

document.getElementById("job-filter").addEventListener("change", loadApplicants);

async function loadInterviews() {
  try {
    const applicants = await api.get("/recruitment/applicants");
    const interviewed = applicants.filter((a) => a.status === "Interviewed");
    const el = document.getElementById("interviews-body");
    el.innerHTML = interviewed.length ? interviewed.map((a) => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div><strong>${escapeHtml(a.name)}</strong><div class="timeline-time">Interview stage · Applied ${fmtDate(a.appliedOn)}</div></div>
      </div>`).join("") : `<div class="empty-state">No interviews scheduled. Move an applicant to "Interviewed" in Applicant Tracking.</div>`;
  } catch (err) {
    toast("Couldn't load interviews: " + err.message, "error");
  }
}

loadJobs();
