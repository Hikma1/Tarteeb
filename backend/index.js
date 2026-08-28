require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mern_practice",
  password: "postgres",
  port: 5432,
});

// ---------- AUTH MIDDLEWARE ----------

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.userId = decoded.userId;
    next();
  });
};

// ---------- AUTH ROUTES (public, no token needed) ----------

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );
    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: { id: user.id, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- COURSES (protected) ----------

app.post("/courses", authenticateToken, async (req, res) => {
  try {
    const { title, credits, instructor } = req.body;
    const result = await pool.query(
      "INSERT INTO courses (title, credits, instructor) VALUES ($1, $2, $3) RETURNING *",
      [title, credits, instructor || "TBA"]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/courses", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/courses/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/courses/:id", authenticateToken, async (req, res) => {
  try {
    const { title, credits, instructor } = req.body;
    const result = await pool.query(
      "UPDATE courses SET title = $1, credits = $2, instructor = $3 WHERE id = $4 RETURNING *",
      [title, credits, instructor, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/courses/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- TODOS (protected) ----------
app.post("/todos", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const result = await pool.query(
      "INSERT INTO todos (text, done, user_id) VALUES ($1, false, $2) RETURNING *",
      [text, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/todos", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY id",
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/todos/:id", authenticateToken, async (req, res) => {
  try {
    const { text, done } = req.body;
    const result = await pool.query(
      "UPDATE todos SET text = $1, done = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [text, done, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Todo not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/todos/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- TASKS (protected) ----------

app.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const { title, priority, category, due_date } = req.body;
    const result = await pool.query(
      "INSERT INTO tasks (title, priority, category, due_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, priority || "Medium", category || "Personal", due_date || null, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { title, priority, category, due_date, completed } = req.body;
    const result = await pool.query(
      "UPDATE tasks SET title = $1, priority = $2, category = $3, due_date = $4, completed = $5 WHERE id = $6 AND user_id = $7 RETURNING *",
      [title, priority, category, due_date, completed, req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/dashboard", authenticateToken, async (req, res) => {
  try {
    const totalTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE user_id = $1", [req.userId]);
    const completedTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE completed = true AND user_id = $1", [req.userId]);
    const highPriority = await pool.query("SELECT COUNT(*) FROM tasks WHERE priority = 'High' AND completed = false AND user_id = $1", [req.userId]);
    const totalTodos = await pool.query("SELECT COUNT(*) FROM todos WHERE user_id = $1", [req.userId]);
    const doneTodos = await pool.query("SELECT COUNT(*) FROM todos WHERE done = true AND user_id = $1", [req.userId]);

    res.json({
      totalTasks: parseInt(totalTasks.rows[0].count),
      completedTasks: parseInt(completedTasks.rows[0].count),
      highPriorityRemaining: parseInt(highPriority.rows[0].count),
      totalTodos: parseInt(totalTodos.rows[0].count),
      doneTodos: parseInt(doneTodos.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- HABITS (protected) ----------

app.post("/habits", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO habits (name, streak, last_completed_date, user_id) VALUES ($1, 0, NULL, $2) RETURNING *",
      [name, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/habits", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at", [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/habits/:id/checkin", authenticateToken, async (req, res) => {
  try {
    const habitResult = await pool.query("SELECT * FROM habits WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    const habit = habitResult.rows[0];
    if (!habit) return res.status(404).json({ error: "Habit not found" });

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = habit.last_completed_date
      ? habit.last_completed_date.toISOString().slice(0, 10)
      : null;

    if (lastDate === today) {
      return res.status(400).json({ error: "Already checked in today" });
    }

    let newStreak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (lastDate === yesterdayStr) {
      newStreak = habit.streak + 1;
    } else {
      newStreak = 1;
    }

    const result = await pool.query(
      "UPDATE habits SET streak = $1, last_completed_date = $2 WHERE id = $3  AND user_id = $4 RETURNING *",
      [newStreak, today, req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/habits/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM habits WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- SUBJECTS (protected) ----------

app.post("/subjects", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO subjects (name, progress, user_id) VALUES ($1, 0, $2) RETURNING *",
      [name, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/subjects", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects WHERE user_id = $1 ORDER BY id", [req.userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/subjects/:id", authenticateToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const result = await pool.query(
      "UPDATE subjects SET progress = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [progress, req.params.id, req.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/subjects/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM subjects WHERE id = $1 AND user_id = $2", [req.params.id, req.userId]);
    res.json({ message: "Subject deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- STUDY SESSIONS (protected) ----------

app.post("/sessions", authenticateToken, async (req, res) => {
  try {
    const { subject_id, duration_minutes, notes, } = req.body;
    const result = await pool.query(
      "INSERT INTO study_sessions (subject_id, duration_minutes, notes,user_id) VALUES ($1, $2, $3,$4) RETURNING *",
      [subject_id, duration_minutes, notes || null, req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT study_sessions.*, subjects.name AS subject_name FROM study_sessions JOIN subjects ON study_sessions.subject_id = subjects.id WHERE study_sessions.user_id = $1 ORDER BY session_date DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/sessions/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM study_sessions WHERE id = $1 AND user_id= $2 RETURNING *", [req.params.id, req.userId]);
    res.json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));