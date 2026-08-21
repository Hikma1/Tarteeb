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

// ---------- COURSES ----------

app.post("/courses", async (req, res) => {
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

app.get("/courses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/courses/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/courses/:id", async (req, res) => {
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

app.delete("/courses/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [req.params.id]);
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- TODOS ----------

app.post("/todos", async (req, res) => {
  try {
    const { text } = req.body;
    const result = await pool.query(
      "INSERT INTO todos (text, done) VALUES ($1, false) RETURNING *",
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/todos/:id", async (req, res) => {
  try {
    const { text, done } = req.body;
    const result = await pool.query(
      "UPDATE todos SET text = $1, done = $2 WHERE id = $3 RETURNING *",
      [text, done, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM todos WHERE id = $1", [req.params.id]);
    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ---------- TASKS ----------
// Create a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, priority, category, due_date } = req.body;
    const result = await pool.query(
      "INSERT INTO tasks (title, priority, category, due_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, priority || "Medium", category || "Personal", due_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//get a specific task by ID
app.get("/tasks/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//updating
app.put("/tasks/:id", async (req, res) => {
  try {
    const { title, priority, category, due_date, completed } = req.body;
    const result = await pool.query(
      "UPDATE tasks SET title = $1, priority = $2, category = $3, due_date = $4, completed = $5 WHERE id = $6 RETURNING *",
      [title, priority, category, due_date, completed, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//deleting
app.delete("/tasks/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/dashboard", async (req, res) => {
  try {
    const totalTasks = await pool.query("SELECT COUNT(*) FROM tasks");
    const completedTasks = await pool.query("SELECT COUNT(*) FROM tasks WHERE completed = true");
    const highPriority = await pool.query("SELECT COUNT(*) FROM tasks WHERE priority = 'High' AND completed = false");
    const totalTodos = await pool.query("SELECT COUNT(*) FROM todos");
    const doneTodos = await pool.query("SELECT COUNT(*) FROM todos WHERE done = true");

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

// ---------- HABITS ----------

app.post("/habits", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO habits (name, streak, last_completed_date) VALUES ($1, 0, NULL) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/habits", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM habits ORDER BY created_at");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/habits/:id/checkin", async (req, res) => {
  try {
    const habitResult = await pool.query("SELECT * FROM habits WHERE id = $1", [req.params.id]);
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
      "UPDATE habits SET streak = $1, last_completed_date = $2 WHERE id = $3 RETURNING *",
      [newStreak, today, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/habits/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM habits WHERE id = $1", [req.params.id]);
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ---------- SUBJECTS ----------

app.post("/subjects", async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO subjects (name, progress) VALUES ($1, 0) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/subjects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/subjects/:id", async (req, res) => {
  try {
    const { progress } = req.body;
    const result = await pool.query(
      "UPDATE subjects SET progress = $1 WHERE id = $2 RETURNING *",
      [progress, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/subjects/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM subjects WHERE id = $1", [req.params.id]);
    res.json({ message: "Subject deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- STUDY SESSIONS ----------

app.post("/sessions", async (req, res) => {
  try {
    const { subject_id, duration_minutes, notes } = req.body;
    const result = await pool.query(
      "INSERT INTO study_sessions (subject_id, duration_minutes, notes) VALUES ($1, $2, $3) RETURNING *",
      [subject_id, duration_minutes, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/sessions", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT study_sessions.*, subjects.name AS subject_name FROM study_sessions JOIN subjects ON study_sessions.subject_id = subjects.id ORDER BY session_date DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/sessions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM study_sessions WHERE id = $1", [req.params.id]);
    res.json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));