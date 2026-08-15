import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- Todos (existing) ---
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [editIndex, setEditIndex] = useState(null)

  // --- Tasks (new) ---
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState("")
  const [taskPriority, setTaskPriority] = useState("Medium")
  const [taskCategory, setTaskCategory] = useState("Personal")
  const [taskDueDate, setTaskDueDate] = useState("")

  useEffect(() => {
    fetch("http://localhost:3000/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.log(err))

    fetch("http://localhost:3000/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.log(err))
  }, [])

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

  // ... your existing todo functions (handleAdd, handleDelete, handleEdit, handleToggleDone) stay unchanged ...

  return (
    <div className="app">
      <h1>My Task Manager</h1>

      {/* --- Task form --- */}
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

      {/* --- Task list --- */}
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={`priority-${task.priority.toLowerCase()}`}>
            <span className="task-title">{task.title}</span>
            <span className="task-meta">{task.category} · {task.priority}</span>
            {task.due_date && <span className="task-due">Due: {task.due_date.slice(0, 10)}</span>}
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {/* your existing todo UI stays below, unchanged */}
    </div>
  )
}

export default App