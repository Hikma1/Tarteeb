import { useState, useEffect } from 'react'
import './App.css'

function App() {
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

  return (
    <div className="app">
      <h1>My Task Manager</h1>

      {stats && (
        <div className="dashboard">
          <h2>Dashboard</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{stats.totalTasks - stats.completedTasks}</span>
              <span className="stat-label">Tasks Remaining</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.highPriorityRemaining}</span>
              <span className="stat-label">High Priority</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{stats.doneTodos}/{stats.totalTodos}</span>
              <span className="stat-label">Todos Done</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </span>
              <span className="stat-label">Task Progress</span>
            </div>
          </div>
        </div>
      )}

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
        <button onClick={handleAddTask}>Add Task</button>
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
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <hr />

      <h2>My To-Do List</h2>
      <div className="input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleAdd}>{editIndex !== null ? "Update" : "Add"}</button>
      </div>
      <ul>
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
            <button onClick={() => handleEdit(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>

      <hr />

      <h2>My Habits</h2>
      <div className="input-row">
        <input
          type="text"
          placeholder="New habit"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
        />
        <button onClick={handleAddHabit}>Add Habit</button>
      </div>
      <ul className="habit-list">
        {habits.map((habit) => (
          <li key={habit.id}>
            <span className="habit-name">{habit.name}</span>
            <span className="habit-streak">🔥 {habit.streak} day streak</span>
            <button onClick={() => handleCheckIn(habit.id)}>Check In</button>
            <button onClick={() => handleDeleteHabit(habit.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App