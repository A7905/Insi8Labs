
const express = require("express");
const cors = require("cors");
const path = require("path");
const documentsRouter = require("./routes/documents");
const db = require("./db"); // ensure db initialized

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.use("/documents", documentsRouter);


app.get("/", (req, res) => res.json({ message: "Patient docs backend is running" }));

app.listen(PORT, () => console.log(`Backend listening at http://localhost:${PORT}`));
const fs = require("fs");


const TTL_MINUTES = Number(process.env.TTL_MINUTES) || 1; 
const CLEANUP_INTERVAL_MINUTES = 1; 

function scheduleCleanup() {
  async function cleanupOnce() {
    console.log(`[cleanup] Running cleanup - TTL ${TTL_MINUTES} minutes`);
    const cutoffDate = new Date(Date.now() - TTL_MINUTES * 24 * 60 * 1000).toISOString();

   
    const sql = `
      SELECT id, filepath, filename, last_accessed, created_at
      FROM documents
      WHERE (last_accessed IS NOT NULL AND last_accessed < ?)
         OR (last_accessed IS NULL AND created_at < ?)
    `;

    db.all(sql, [cutoffDate, cutoffDate], (err, rows) => {
      if (err) {
        console.error("[cleanup] DB error:", err);
        return;
      }
      if (!rows || rows.length === 0) {
        console.log("[cleanup] No stale files found.");
        return;
      }

      rows.forEach((row) => {
        const filePath = path.resolve(row.filepath);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[cleanup] Removed file: ${filePath}`);
          } else {
            console.log(`[cleanup] File missing (will remove DB meta): ${filePath}`);
          }
        } catch (fsErr) {
          console.error(`[cleanup] Failed to delete file ${filePath}:`, fsErr);
        }

        
        db.run(`DELETE FROM documents WHERE id = ?`, [row.id], (delErr) => {
          if (delErr) console.error(`[cleanup] Failed to delete metadata for id ${row.id}:`, delErr);
          else console.log(`[cleanup] Deleted DB record id=${row.id} (${row.filename})`);
        });
      });
    });
  }

  
  cleanupOnce();

  
  setInterval(cleanupOnce, CLEANUP_INTERVAL_MINUTES * 60 * 1000);
}


scheduleCleanup();
