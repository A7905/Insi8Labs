// backend/routes/documents.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");


const UPLOAD_DIR = path.resolve(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
   
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});


router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { originalname, path: filepath, size } = req.file;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO documents (filename, filepath, filesize, created_at) VALUES (?, ?, ?, ?)`,
      [originalname, filepath, size, createdAt],
      function (err) {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(500).json({ message: "Failed to save metadata" });
        }
        res.status(201).json({
          id: this.lastID,
          filename: originalname,
          filesize: size,
          created_at: createdAt,
          message: "Uploaded successfully",
        });
      }
    );
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});


router.get("/", (req, res) => {
  db.all(`SELECT id, filename, filepath, filesize, created_at FROM documents ORDER BY created_at DESC`, (err, rows) => {
    if (err) {
      console.error("DB read error:", err);
      return res.status(500).json({ message: "Failed to list documents" });
    }
    res.json(rows);
  });
});


router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM documents WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error("DB get error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (!row) return res.status(404).json({ message: "Document not found" });

   
    const filePath = path.resolve(row.filepath);
    if (!fs.existsSync(filePath)) {
      return res.status(410).json({ message: "File missing on server" });
    }
    
    const now = new Date().toISOString();
    db.run(`UPDATE documents SET last_accessed = ? WHERE id = ?`, [now, id], (updErr) => {
      if (updErr) console.error("Failed to update last_accessed:", updErr);
      // send file anyway
      res.download(filePath, row.filename, (downloadErr) => {
        if (downloadErr) console.error("Download error:", downloadErr);
      });
    });
  });
});


router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM documents WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error("DB get error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (!row) return res.status(404).json({ message: "Document not found" });

    const filePath = path.resolve(row.filepath);
    // Remove file if exists
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Failed to remove file:", e);
      }
    }

    db.run(`DELETE FROM documents WHERE id = ?`, [id], function (err2) {
      if (err2) {
        console.error("DB delete error:", err2);
        return res.status(500).json({ message: "Failed to delete metadata" });
      }
      res.json({ message: "Deleted successfully", id: Number(id) });
    });
  });
});

module.exports = router;