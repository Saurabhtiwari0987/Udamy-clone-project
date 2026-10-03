const express = require("express");
const cors = require("cors");
const { pool, initDB } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Health check (DB bhi check karta hai)
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// Saare courses (search + category filter)
app.get("/api/courses", async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM courses
       WHERE (title ILIKE $1 OR instructor ILIKE $1)
       AND ($2 = '' OR category = $2)
       ORDER BY id DESC`,
      [`%${search}%`, category]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Categories list
app.get("/api/categories", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT DISTINCT category FROM courses ORDER BY category"
    );
    res.json(rows.map((r) => r.category));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Ek course
app.get("/api/courses/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM courses WHERE id=$1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Course not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Naya course add
app.post("/api/courses", async (req, res) => {
  try {
    const { title, instructor, category, price, emoji, description } = req.body;
    if (!title || !instructor || !category) {
      return res.status(400).json({ error: "title, instructor, category required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO courses (title, instructor, category, price, emoji, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, instructor, category, price || 0, emoji || "📘", description || ""]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Course delete
app.delete("/api/courses/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id=$1", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

initDB()
  .then(() => app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Backend running on port ${PORT}`)))
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
