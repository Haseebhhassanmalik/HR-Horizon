const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

renderShell("add-employee", editId ? "Edit Employee" : "Add New Employee", editId ? `Updating record ${editId}` : "Register a new employee in HR Horizon.");

const form = document.getElementById("emp-form");
const submitBtn = document.getElementById("submit-btn");

const NUMERIC_FIELDS = ["basicSalary", "houseRent", "medical", "transport"];

function fillForm(emp) {
  Object.keys(emp).forEach((key) => {
    const field = form.elements[key];
    if (field) field.value = emp[key] ?? "";
  });
}

async function loadForEdit() {
  if (!editId) return;
  try {
    const emp = await api.get("/employees/" + editId);
    fillForm(emp);
    submitBtn.textContent = "Update Employee";
  } catch (err) {
    toast("Couldn't load employee: " + err.message, "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  NUMERIC_FIELDS.forEach((f) => (data[f] = Number(data[f]) || 0));

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";
  try {
    if (editId) {
      await api.put("/employees/" + editId, data);
      toast("Employee updated", "success");
    } else {
      await api.post("/employees", data);
      toast("Employee added", "success");
    }
    setTimeout(() => (window.location.href = "employees.html"), 500);
  } catch (err) {
    toast("Save failed: " + err.message, "error");
    submitBtn.disabled = false;
    submitBtn.textContent = editId ? "Update Employee" : "Save Employee";
  }
});

loadForEdit();
