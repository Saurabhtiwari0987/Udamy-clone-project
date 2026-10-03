import { useEffect, useState } from "react";

const API = "/api"; // nginx isko backend par bhejega

const emptyForm = { title: "", instructor: "", category: "", price: "", emoji: "📘", description: "" };

export default function App() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams({ search, category });
      const res = await fetch(`${API}/courses?${q}`);
      if (!res.ok) throw new Error("Backend error");
      setCourses(await res.json());
      setError("");
    } catch (e) {
      setError("Backend se connect nahi ho paa raha. ❌");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      setCategories(await res.json());
    } catch (e) {}
  };

  useEffect(() => {
    const t = setTimeout(loadCourses, 300); // debounce
    return () => clearTimeout(t);
  }, [search, category]);

  useEffect(() => {
    loadCategories();
  }, []);

  const addCourse = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: Number(form.price) || 0 }),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      loadCourses();
      loadCategories();
    } else {
      alert("Course add nahi hua");
    }
  };

  const deleteCourse = async (id) => {
    if (!confirm("Course delete karna hai?")) return;
    await fetch(`${API}/courses/${id}`, { method: "DELETE" });
    loadCourses();
  };

  const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

  return (
    <div>
      <header className="header">
        <h1>📚 LearnHub</h1>
        <input
          className="search"
          placeholder="Search for courses or instructors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Course"}
        </button>
      </header>

      <section className="hero">
        <h2>Learn new skills, build your career</h2>
        <p>Docker, React, Node, Cloud aur bahut kuch — sab ek jagah.</p>
      </section>

      {showForm && (
        <form className="form" onSubmit={addCourse}>
          <input required placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input required placeholder="Instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
          <input required placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Emoji" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn" type="submit">Save Course</button>
        </form>
      )}

      <div className="chips">
        <button className={!category ? "chip active" : "chip"} onClick={() => setCategory("")}>All</button>
        {categories.map((c) => (
          <button key={c} className={category === c ? "chip active" : "chip"} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="info">Loading...</p>}
      {!loading && !error && courses.length === 0 && <p className="info">Koi course nahi mila.</p>}

      <div className="grid">
        {courses.map((c) => (
          <div className="card" key={c.id}>
            <div className="thumb">{c.emoji}</div>
            <div className="body">
              <h3>{c.title}</h3>
              <p className="inst">{c.instructor}</p>
              <p className="desc">{c.description}</p>
              <div className="rating">
                <b>{Number(c.rating).toFixed(1)}</b> <span className="stars">{stars(c.rating)}</span>
                <small> ({Number(c.students).toLocaleString()})</small>
              </div>
              <div className="foot">
                <span className="price">₹{Number(c.price)}</span>
                <span className="tag">{c.category}</span>
              </div>
              <button className="del" onClick={() => deleteCourse(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <footer className="footer">© LearnHub — React + Node + PostgreSQL on Docker</footer>
    </div>
  );
}
