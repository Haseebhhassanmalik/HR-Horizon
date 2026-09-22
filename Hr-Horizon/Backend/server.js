const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/employees", require("./routes/employees"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/leaves", require("./routes/leaves"));
app.use("/api/payroll", require("./routes/payroll"));
app.use("/api/recruitment", require("./routes/recruitment"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/settings", require("./routes/settings"));

// Serve the frontend as static files, so the whole app runs from one server
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n  HR Horizon backend running:`);
  console.log(`  ->  http://localhost:${PORT}\n`);
});
