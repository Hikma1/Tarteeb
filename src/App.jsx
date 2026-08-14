import { useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([
    { text: "Learn React", done: false },
    { text: "Build a to-do app", done: false },
    { text: "Practice more", done: false }
  ])
  const [inputValue, setInputValue] = useState("")
  const [editIndex, setEditIndex] = useState(null)

  const handleAdd = () => {
    if (inputValue.trim() === "") return

    if (editIndex !== null) {
      const updatedTodos = [...todos]
      updatedTodos[editIndex] = { ...updatedTodos[editIndex], text: inputValue }
      setTodos(updatedTodos)
      setEditIndex(null)
    } else {
      setTodos([...todos, { text: inputValue, done: false }])
    }
    setInputValue("")
  }

  const handleDelete = (indexToRemove) => {
    setTodos(todos.filter((todo, index) => index !== indexToRemove))
  }

  const handleEdit = (index) => {
    setInputValue(todos[index].text)
    setEditIndex(index)
  }

  const handleToggleDone = (index) => {
    const updatedTodos = [...todos]
    updatedTodos[index] = { ...updatedTodos[index], done: !updatedTodos[index].done }
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
          <li key={index}>
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