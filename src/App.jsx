import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")

  // --- Auth ---
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"))
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [authMode, setAuthMode] = useState("login")
  const [authError, setAuthError] = useState("")

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

  // --- Auth helpers ---
  const authFetch = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    })
  }

  const handleAuth = async () => {
    setAuthError("")
    const endpoint = authMode === "login" ? "/login" : "/signup"
    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error)
        return
      }
      localStorage.setItem("token", data.token)
      localStorage.setItem("userEmail", data.user.email)
      setToken(data.token)
       setUserEmail(data.user.email)
    } catch (err) {
      setAuthError("Something went wrong")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }

  useEffect(() => {
    if (!token) return

    authFetch("http://localhost:3000/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.log(err))

    authFetch("http://localhost:3000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.log(err))

    authFetch("http://localhost:3000/habits")
      .then((res) => res.json())
      .then((data) => setHabits(data))
      .catch((err) => console.log(err))

    authFetch("http://localhost:3000/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.log(err))

    authFetch("http://localhost:3000/sessions")
      .then((res) => res.json())
      .then((data) => setSessions(data))
      .catch((err) => console.log(err))
  }, [token])

  useEffect(() => {
    if (!token) return
    authFetch("http://localhost:3000/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log(err))
  }, [tasks, todos, token])

  // --- Todo functions ---
  const handleAdd = async () => {
    if (inputValue.trim() === "") return

    if (editIndex !== null) {
      const todoToUpdate = todos[editIndex]
      const res = await authFetch(`http://localhost:3000/todos/${todoToUpdate.id}`, {
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
      const res = await authFetch("http://localhost:3000/todos", {
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
    await authFetch(`http://localhost:3000/todos/${todoToDelete.id}`, { method: "DELETE" })
    setTodos(todos.filter((todo, i) => i !== index))
  }

  const handleEdit = (index) => {
    setInputValue(todos[index].text)
    setEditIndex(index)
  }

  const handleToggleDone = async (index) => {
    const todo = todos[index]
    const res = await authFetch(`http://localhost:3000/todos/${todo.id}`, {
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
    const res = await authFetch("http://localhost:3000/tasks", {
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
    await authFetch(`http://localhost:3000/tasks/${id}`, { method: "DELETE" })
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleToggleTaskDone = async (task) => {
    const res = await authFetch(`http://localhost:3000/tasks/${task.id}`, {
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
    const res = await authFetch("http://localhost:3000/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: habitName })
    })
    const newHabit = await res.json()
    setHabits([...habits, newHabit])
    setHabitName("")
  }

  const handleCheckIn = async (id) => {
    const res = await authFetch(`http://localhost:3000/habits/${id}/checkin`, {
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
    await authFetch(`http://localhost:3000/habits/${id}`, { method: "DELETE" })
    setHabits(habits.filter((h) => h.id !== id))
  }

  // --- Study functions ---
  const handleAddSubject = async () => {
    if (subjectName.trim() === "") return
    const res = await authFetch("http://localhost:3000/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: subjectName })
    })
    const newSubject = await res.json()
    setSubjects([...subjects, newSubject])
    setSubjectName("")
  }

  const handleUpdateProgress = async (id, progress) => {
    const res = await authFetch(`http://localhost:3000/subjects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress })
    })
    const updated = await res.json()
    setSubjects(subjects.map((s) => (s.id === id ? updated : s)))
  }

  const handleAddSession = async () => {
    if (!sessionSubjectId || !sessionDuration) return
    const res = await authFetch("http://localhost:3000/sessions", {
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
    { id: "dashboard", label: "Overview" },
    { id: "tasks", label: "Tasks" },
    { id: "todos", label: "To-Do" },
    { id: "habits", label: "Habits" },
    { id: "study", label: "Study" },
  ]

  const taskProgress = stats && stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  // --- Not logged in: show auth screen ---
  if (!token) {
    const today = new Date()
    const dateLabel = today.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })

    return (
      <div className="auth-screen">
        <div className="auth-panel">
          <div className="auth-panel-top">
            <span className="wordmark-en light">Tarteeb</span>
            <span className="wordmark-sub light">ordered days</span>
          </div>
          <div className="auth-panel-quote">
            <p>&ldquo;Tarteeb&rdquo; — order, arrangement. A place to keep tasks,<br />habits, and study in one ledger.</p>
          </div>
          <div className="auth-panel-date">{dateLabel}</div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <span className="eyebrow">{authMode === "login" ? "Welcome back" : "Get started"}</span>
            <h1 className="auth-title">{authMode === "login" ? "Log in" : "Create an account"}</h1>

            <label className="auth-label">
              Email
              <input
                type="email"
                placeholder="you@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </label>
            <label className="auth-label">
              Password
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </label>

            {authError && <p className="auth-error">{authError}</p>}

            <button className="btn-fill auth-submit" onClick={handleAuth}>
              {authMode === "login" ? "Log in" : "Sign up"}
            </button>
            <button
              className="btn-text auth-switch"
              onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError("") }}
            >
              {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="layout">
      <aside className="spine">
        <div className="wordmark">
          <span className="wordmark-en">Tarteeb</span>
          <span className="wordmark-sub">ordered days</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`tab-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Log out</button>
      </aside>

      <main className="ledger">
        {activeTab === "dashboard" && (
          <section>
            <header className="ledger-header">
              <span className="eyebrow">Overview</span>
              <h1>Where things stand</h1>
            </header>

            {stats && (
              <div className="counter-strip">
                <div className="counter">
                  <span className="counter-value">{stats.totalTasks - stats.completedTasks}</span>
                  <span className="counter-label">tasks remaining</span>
                </div>
                <div className="counter-divider" />
                <div className="counter">
                  <span className="counter-value accent-red">{stats.highPriorityRemaining}</span>
                  <span className="counter-label">high priority</span>
                </div>
                <div className="counter-divider" />
                <div className="counter">
                  <span className="counter-value">{stats.doneTodos}<span className="counter-of">/{stats.totalTodos}</span></span>
                  <span className="counter-label">todos done</span>
                </div>
                <div className="counter-divider" />
                <div className="counter">
                  <span className="counter-value accent-green">{taskProgress}%</span>
                  <span className="counter-label">task progress</span>
                </div>
              </div>
            )}

            <div className="ledger-columns">
              <div className="ledger-block">
                <h2>Habit streaks</h2>
                {habits.length === 0 && <p className="empty-note">Nothing tracked yet.</p>}
                {habits.map((h) => (
                  <div key={h.id} className="ledger-row">
                    <span>{h.name}</span>
                    <span className="mono-tag">{h.streak}d</span>
                  </div>
                ))}
              </div>
              <div className="ledger-block">
                <h2>Study progress</h2>
                {subjects.length === 0 && <p className="empty-note">No subjects yet.</p>}
                {subjects.map((s) => (
                  <div key={s.id} className="ledger-row">
                    <span>{s.name}</span>
                    <span className="mono-tag">{s.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "tasks" && (
          <section>
            <header className="ledger-header">
              <span className="eyebrow">Tasks</span>
              <h1>What needs doing</h1>
            </header>

            <div className="entry-panel">
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
              <button className="btn-fill" onClick={handleAddTask}>Add task</button>
            </div>

            <ul className="entry-list">
              {tasks.map((task) => (
                <li key={task.id} className={`tab-${task.priority.toLowerCase()}`}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTaskDone(task)}
                  />
                  <span
                    className="entry-title"
                    style={{ textDecoration: task.completed ? "line-through" : "none" }}
                  >
                    {task.title}
                  </span>
                  <span className="entry-meta">{task.category} — {task.priority}</span>
                  {task.due_date && <span className="entry-due">due {task.due_date.slice(5, 10)}</span>}
                  <button className="btn-text" onClick={() => handleDeleteTask(task.id)}>remove</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "todos" && (
          <section>
            <header className="ledger-header">
              <span className="eyebrow">Quick list</span>
              <h1>To-do</h1>
            </header>

            <div className="entry-panel">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add an item"
              />
              <button className="btn-fill" onClick={handleAdd}>{editIndex !== null ? "Update" : "Add"}</button>
            </div>
            <ul className="entry-list">
              {todos.map((todo, index) => (
                <li key={todo.id} className="tab-neutral">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggleDone(index)}
                  />
                  <span
                    className="entry-title"
                    style={{ textDecoration: todo.done ? "line-through" : "none" }}
                  >
                    {todo.text}
                  </span>
                  <button className="btn-text" onClick={() => handleEdit(index)}>edit</button>
                  <button className="btn-text" onClick={() => handleDelete(index)}>remove</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "habits" && (
          <section>
            <header className="ledger-header">
              <span className="eyebrow">Consistency</span>
              <h1>Habits</h1>
            </header>

            <div className="entry-panel">
              <input
                type="text"
                placeholder="New habit"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
              />
              <button className="btn-fill" onClick={handleAddHabit}>Add habit</button>
            </div>
            <ul className="entry-list">
              {habits.map((habit) => (
                <li key={habit.id} className="tab-amber">
                  <span className="entry-title">{habit.name}</span>
                  <span className="mono-tag streak-tag">{habit.streak} day streak</span>
                  <button className="btn-outline" onClick={() => handleCheckIn(habit.id)}>Check in</button>
                  <button className="btn-text" onClick={() => handleDeleteHabit(habit.id)}>remove</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {activeTab === "study" && (
          <section>
            <header className="ledger-header">
              <span className="eyebrow">Study</span>
              <h1>Subjects &amp; sessions</h1>
            </header>

            <h2 className="block-title">Subjects</h2>
            <div className="entry-panel">
              <input
                type="text"
                placeholder="New subject"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
              <button className="btn-fill" onClick={handleAddSubject}>Add subject</button>
            </div>
            <ul className="entry-list">
              {subjects.map((subject) => (
                <li key={subject.id} className="tab-blue">
                  <span className="entry-title subject-name">{subject.name}</span>
                  <div className="track">
                    <div className="track-fill" style={{ width: `${subject.progress}%` }}></div>
                  </div>
                  <span className="mono-tag">{subject.progress}%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="set %"
                    onBlur={(e) => e.target.value && handleUpdateProgress(subject.id, parseInt(e.target.value))}
                  />
                </li>
              ))}
            </ul>

            <h2 className="block-title">Sessions logged</h2>
            <div className="entry-panel">
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
              <button className="btn-fill" onClick={handleAddSession}>Log session</button>
            </div>
            <ul className="entry-list">
              {sessions.map((session) => (
                <li key={session.id} className="tab-blue">
                  <span className="entry-title">{session.subject_name}</span>
                  <span className="mono-tag">{session.duration_minutes} min</span>
                  {session.notes && <span className="entry-meta">{session.notes}</span>}
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