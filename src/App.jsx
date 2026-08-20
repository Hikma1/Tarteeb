import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // --- Todos ---
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [editIndex, setEditIndex] = useState(null)

  // --- Tasks ---
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState("")
  const [taskPriority, setTaskPriority] = useState("Medium")
  const [taskCategory, setTaskCategory] = useState("Personal")
  const [taskDueDate, setTaskDueDate] = useState("")

  // --- Habits ---
  const [habits, setHabits] = useState([])
  const [habitName, setHabitName] = useState("")

  // --- Study: Subjects ---
  const [subjects, setSubjects] = useState([])
  const [subjectName, setSubjectName] = useState("")

  // --- Study: Sessions ---
  const [sessions, setSessions] = useState([])
  const [sessionSubjectId, setSessionSubjectId] = useState("")
  const [sessionDuration, setSessionDuration] = useState("")
  const [sessionNotes, setSessionNotes] = useState("")

  // --- Dashboard ---
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch("http://localhost:3000/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.log(err))

    fetch("http://localhost:3000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.log(err))

    fetch("http://localhost:3000/habits")
      .then((res) => res.json())
      .then((data) => setHabits(data))
      .catch((err) => console.log(err))

    fetch("http://localhost:3000/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.log(err))

    fetch("http://localhost:3000/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((err) => console.log(err))
  }, [])

  useEffect(() => {
    fetch("http://localhost:3000/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log(err))
  }, [tasks, todos])

  // --- Todo functions ---
  const handleAdd = async () => {
    if (inputValue.trim() === "") return

    if (editIndex !== null) {
      const todoToUpdate = todos[editIndex]
      const res = await fetch(`http://localhost:3000/todos/${todoToUpdate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputValue, done: todoToUpdate.done })
      })
      const updated = await res.json()
      const updatedTodos = [...todos]
      updatedTodos[editIndex] = updated
      setTodos(updatedTodos)
      setEditIndex(null)
    } else {
      const res = await fetch("http://localhost:3000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputValue })
      })
      const newTodo = await res.json()
      setTodos([...todos, newTodo])
    }
    setInputValue("")
  }

  const handleDelete = async (index) => {
    const todoToDelete = todos[index]
    await fetch(`http://localhost:3000/todos/${todoToDelete.id}`, { method: "DELETE" })
    setTodos(todos.filter((todo, i) => i !== index))
  }

  const handleEdit = (index) => {
    setInputValue(todos[index].text)
    setEditIndex(index)
  }

  const handleToggleDone = async (index) => {
    const todo = todos[index]
    const res = await fetch(`http://localhost:3000/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: todo.text, done: !todo.done })
    })
    const updated = await res.json()
    const updatedTodos = [...todos]
    updatedTodos[index] = updated
    setTodos(updatedTodos)
  }

  // --- Task functions ---
  const handleAddTask = async () => {
    if (taskTitle.trim() === "") return
    const res = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: taskTitle,
        priority: taskPriority,
        category: taskCategory,
        due_date: taskDueDate || null
      })
    })
    const newTask = await res.json()
    setTasks([newTask, ...tasks])
    setTaskTitle("")
    setTaskDueDate("")
  }

  const handleDeleteTask = async (id) => {
    await fetch(`http://localhost:3000/tasks/${id}`, { method: "DELETE" })
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleToggleTaskDone = async (task) => {
    const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        priority: task.priority,
        category: task.category,
        due_date: task.due_date,
        completed: !task.completed
      })
    })
    const updated = await res.json()
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)))
  }

  // --- Habit functions ---
  const handleAddHabit = async () => {
    if (habitName.trim() === "") return
    const res = await fetch("http://localhost:3000/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: habitName })
    })
    const newHabit = await res.json()
    setHabits([...habits, newHabit])
    setHabitName("")
  }

  const handleCheckIn = async (id) => {
    const res = await fetch(`http://localhost:3000/habits/${id}/checkin`, {
      method: "POST"
    })
    if (!res.ok) {
      const error = await res.json()
      alert(error.error)
      return
    }
    const updated = await res.json()
    setHabits(habits.map((h) => (h.id === id ? updated : h)))
  }

  const handleDeleteHabit = async (id) => {
    await fetch(`http://localhost:3000/habits/${id}`, { method: "DELETE" })
    setHabits(habits.filter((h) => h.id !== id))
  }

  // --- Study functions ---
  const handleAddSubject = async () => {
    if (subjectName.trim() === "") return
    const res = await fetch("http://localhost:3000/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subjectName })
    })
    const newSubject = await res.json()
    setSubjects([...subjects, newSubject])
    setSubjectName("")
  }

  const handleUpdateProgress = async (id, progress) => {
    const res = await fetch(`http://localhost:3000/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress })
    })
    const updated = await res.json()
    setSubjects(subjects.map((s) => (s.id === id ? updated : s)))
  }

  const handleAddSession = async () => {
    if (!sessionSubjectId || !sessionDuration) return
    const res = await fetch("http://localhost:3000/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject_id: sessionSubjectId,
        duration_minutes: sessionDuration,
        notes: sessionNotes
      })
    })
    const newSession = await res.json()
    const subject = subjects.find((s) => s.id === parseInt(sessionSubjectId))
    setSessions([{ ...newSession, subject_name: subject.name }, ...sessions])
    setSessionDuration("")
    setSessionNotes("")
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "tasks", label: "Tasks", icon: "✅" },
    { id: "todos", label: "To-Do", icon: "📝" },
    { id: "habits", label: "Habits", icon: "🔥" },
    { id: "study", label: "Study", icon: "📚" },
  ]

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Tarteeb</div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === "dashboard" && (
          <section>
            <h1 className="page-title">Good to see you, Hikma 🌷</h1>
            {stats && (
              <div className="stats-grid">
                <div className="stat-card card-purple">
                  <span className="stat-number">{stats.totalTasks - stats.completedTasks}</span>
                  <span className="stat-label">Tasks Remaining</span>
                </div>
                <div className="stat-card card-red">
                  <span className="stat-number">{stats.highPriorityRemaining}</span>
                  <span className="stat-label">High Priority</span>
                </div>
                <div className="stat-card card-blue">
                  <span className="stat-number">{stats.doneTodos}/{stats.totalTodos}</span>
                  <span className="stat-label">Todos Done</span>
                </div>
                <div className="stat-card card-green">
                  <span className="stat-number">
                    {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
                  </span>
                  <span className="stat-label">Task Progress</span>
                </div>
              </div>
            )}

            <div className="dashboard-preview-grid">
              <div className="preview-card">
                <h3>🔥 Habit Streaks</h3>
                {habits.length === 0 && <p className="empty-hint">No habits yet</p>}
                {habits.map((h) => (
                  <div key={h.id} className="preview-row">
                    <span>{h.name}</span>
                    <span className="streak-pill">{h.streak}d</span>
                  </div>
                ))}
              </div>
              <div className="preview-card">
                <h3>📚 Study Progress</h3>
                {subjects.length === 0 && <p className="empty-hint">No subjects yet</p>}
                {subjects.map((s) => (
                  <div key={s.id} className="preview-row">
                    <span>{s.name}</span>
                    <span>{s.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "tasks" && (
          <section>
            <h1 className="page-title">Tasks</h1>
            <div className="card-panel">
              <div className="task-form">
                <input
                  type="text"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)}>
                  <option value="University">University</option>
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Community">Community</option>
                </select>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
                <button className="btn-primary" onClick={handleAddTask}>Add Task</button>
              </div>
            </div>

            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`priority-${task.priority.toLowerCase()}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTaskDone(task)}
                  />
                  <span
                    className="task-title"
                    style={{ textDecoration: task.completed ? "line-through" : "none" }}
                  >
                    {task.title}
                  </span>
                  <span className="task-meta">{task.category} · {task.priority}</span>
                  {task.due_date && <span className="task-due">Due: {task.due_date.slice(0, 10)}</span>}
                  <button className="btn-ghost" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "todos" && (
          <section>
            <h1 className="page-title">To-Do List</h1>
            <div className="card-panel">
              <div className="input-row">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="What needs doing?"
                />
                <button className="btn-primary" onClick={handleAdd}>{editIndex !== null ? "Update" : "Add"}</button>
              </div>
            </div>
            <ul className="todo-list">
              {todos.map((todo, index) => (
                <li key={todo.id}>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggleDone(index)}
                  />
                  <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
                    {todo.text}
                  </span>
                  <button className="btn-ghost" onClick={() => handleEdit(index)}>Edit</button>
                  <button className="btn-ghost" onClick={() => handleDelete(index)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "habits" && (
          <section>
            <h1 className="page-title">Habits</h1>
            <div className="card-panel">
              <div className="input-row">
                <input
                  type="text"
                  placeholder="New habit"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                />
                <button className="btn-primary" onClick={handleAddHabit}>Add Habit</button>
              </div>
            </div>
            <ul className="habit-list">
              {habits.map((habit) => (
                <li key={habit.id}>
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-streak">🔥 {habit.streak} day streak</span>
                  <button className="btn-primary btn-small" onClick={() => handleCheckIn(habit.id)}>Check In</button>
                  <button className="btn-ghost" onClick={() => handleDeleteHabit(habit.id)}>Delete</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "study" && (
          <section>
            <h1 className="page-title">Study</h1>

            <h2 className="section-title">Subjects</h2>
            <div className="card-panel">
              <div className="input-row">
                <input
                  type="text"
                  placeholder="New subject"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
                <button className="btn-primary" onClick={handleAddSubject}>Add Subject</button>
              </div>
            </div>
            <ul className="subject-list">
              {subjects.map((subject) => (
                <li key={subject.id}>
                  <span className="subject-name">{subject.name}</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${subject.progress}%` }}></div>
                  </div>
                  <span>{subject.progress}%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Update %"
                    onBlur={(e) => e.target.value && handleUpdateProgress(subject.id, parseInt(e.target.value))}
                  />
                </li>
              ))}
            </ul>

            <h2 className="section-title">Study Sessions</h2>
            <div className="card-panel">
              <div className="input-row">
                <select value={sessionSubjectId} onChange={(e) => setSessionSubjectId(e.target.value)}>
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Minutes"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                />
                <button className="btn-primary" onClick={handleAddSession}>Log Session</button>
              </div>
            </div>
            <ul className="session-list">
              {sessions.map((session) => (
                <li key={session.id}>
                  <strong>{session.subject_name}</strong> — {session.duration_minutes} min
                  {session.notes && <span> · {session.notes}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default App