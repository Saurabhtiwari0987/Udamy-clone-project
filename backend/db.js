const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "udemy",
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function initDB() {
  // DB container late start ho to retry karega
  for (let i = 1; i <= 15; i++) {
    try {
      await pool.query("SELECT 1");
      console.log("✅ PostgreSQL connected");
      break;
    } catch (err) {
      console.log(`⏳ DB not ready (${i}/15): ${err.message}`);
      if (i === 15) throw err;
      await sleep(3000);
    }
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      instructor VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      price NUMERIC(8,2) NOT NULL DEFAULT 0,
      rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
      students INT NOT NULL DEFAULT 0,
      emoji VARCHAR(10) DEFAULT '📘',
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*) FROM courses");
  if (parseInt(rows[0].count) === 0) {
    const seed = [
      ["Complete Docker & Kubernetes Bootcamp", "Rahul Sharma", "DevOps", 499, 4.8, 12500, "🐳", "Docker, containers aur deployment zero se seekho."],
      ["React JS - The Complete Guide", "Amit Verma", "Web Development", 449, 4.7, 30210, "⚛️", "Hooks, routing aur real projects ke saath React."],
      ["Node.js & Express Masterclass", "Neha Singh", "Web Development", 399, 4.6, 18400, "🟢", "REST API aur PostgreSQL ke saath backend banao."],
      ["PostgreSQL for Beginners", "Karan Mehta", "Database", 349, 4.5, 9800, "🐘", "SQL queries, joins aur indexing."],
      ["Python for Data Science", "Priya Nair", "Data Science", 549, 4.8, 45000, "🐍", "Pandas, NumPy aur machine learning basics."],
      ["AWS Certified Cloud Practitioner", "Vikas Gupta", "Cloud", 599, 4.7, 22100, "☁️", "AWS services aur certification ki taiyari."],
    ];
    for (const s of seed) {
      await pool.query(
        `INSERT INTO courses (title, instructor, category, price, rating, students, emoji, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        s
      );
    }
    console.log("🌱 Sample courses seeded");
  }
}

module.exports = { pool, initDB };
