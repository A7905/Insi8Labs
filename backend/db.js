const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.resolve(__dirname, "db.sqlite");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Failed to open database:", err.message);
    process.exit(1);
  }
});


db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`
  );

 
  db.run(`ALTER TABLE documents ADD COLUMN last_accessed TEXT`, (err) => {
    if (err) {
      if (!err.message.includes("duplicate column name")) {
        console.error("ALTER TABLE error:", err);
      }
    } else {
      console.log("Added last_accessed column.");
    }
  });
});

module.exports = db;
