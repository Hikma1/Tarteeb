import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [editIndex, setEditIndex] = useState(null)

  useEffect(() => {
    fetch("http://localhost:3000/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.log(err))
  }, [])

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

  return (
    <div className="app">
      <h1>My To-Do List</h1>
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
    </div>
  )
}

export default App