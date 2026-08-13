import { useState } from 'react'

function App() {
  const [todos, setTodos] = useState(["Learn React", "Build a to-do app", "Practice more"])
  const [inputValue, setInputValue] = useState("")

  const handleAdd = () => {
    if (inputValue.trim() === "") return
    setTodos([...todos, inputValue])
    setInputValue("")
  }

  const handleDelete = (indexToRemove) => {
    setTodos(todos.filter((todo, index) => index !== indexToRemove))
  }

  return (
    <div>
      <h1>My To-Do List</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo}
            <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App