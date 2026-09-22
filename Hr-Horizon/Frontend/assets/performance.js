renderShell("performance", "Performance Management", "Set goals, run reviews, and track appraisal history.");

async function loadReviews() {
  try {
    const reviews = await api.get("/reviews");
    document.getElementById("reviews-body").innerHTML = reviews.length ? reviews.map((r) => `
      <tr>
        <td class="emp-name">${escapeHtml(r.employeeName)}</td>
        <td>${escapeHtml(r.period)}</td>
        <td style="max-width:260px">${escapeHtml(r.goals || "-")}</td>
        <td>${stars(r.selfRating)}</td>
        <td>${stars(r.managerRating)}</td>
        <td><span class="pill ${pillClass(r.status)}">${r.status}</span></td>
      </tr>
    `).join("") : `<tr><td colspan="6"><div class="empty-state">No performance reviews yet. Start a new review cycle.</div></td></tr>`;
  } catch (err) {
    toast("Couldn't load reviews: " + err.message, "error");
  }
}

function stars(n) {
  n = Number(n) || 0;
  return `<span class="mono">${"★".repeat(n)}${"☆".repeat(5 - n)}</span>`;
}

document.getElementById("new-review-btn").addEventListener("click", async () => {
  document.getElementById("review-modal").classList.add("open");
  if (!document.getElementById("review-employee").options.length) {
    const emps = await api.get("/employees?status=Active");
    document.getElementById("review-employee").innerHTML = emps.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join("");
  }
});
function closeReviewModal() { document.getElementById("review-modal").classList.remove("open"); }

document.getElementById("review-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.selfRating = Number(data.selfRating);
  data.managerRating = Number(data.managerRating);
  data.status = "Completed";
  try {
    await api.post("/reviews", data);
    toast("Review saved", "success");
    closeReviewModal();
    e.target.reset();
    loadReviews();
  } catch (err) {
    toast("Failed: " + err.message, "error");
  }
});

loadReviews();
