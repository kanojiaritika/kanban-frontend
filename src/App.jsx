import { useState } from 'react'
import './App.css'
import Login from './components/Login'
import Register from './components/Register'
import { Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path='/kanban/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/home' element={<h1>Home Page</h1>} />
      </Routes>
    </>

  )
}

export default App
