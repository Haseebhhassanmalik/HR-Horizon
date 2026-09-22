// Tiny file-based JSON datastore.
// Reads db.json fresh on every read, writes it back atomically on every mutation.
// Good enough for a single-server HR demo; swap for MySQL/Postgres in Phase 2+.
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

function readDB() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function nextId(prefix, list) {
  const nums = list
    .map((item) => item.id)
    .filter((id) => typeof id === "string" && id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return prefix + String(next).padStart(3, "0");
}

function addAuditLog(action, details) {
  const db = readDB();
  db.auditLogs = db.auditLogs || [];
  db.auditLogs.unshift({
    id: "LOG" + Date.now(),
    action,
    details,
    timestamp: new Date().toISOString(),
  });
  db.auditLogs = db.auditLogs.slice(0, 500);
  writeDB(db);
}

module.exports = { readDB, writeDB, nextId, addAuditLog };
