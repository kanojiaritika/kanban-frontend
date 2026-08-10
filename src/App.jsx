import { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import { Route, Routes } from 'react-router-dom'
import Home from './components/homePage/Home'
import useTheme from './hooks/useTheme'
import Board from './components/boards/Board'

function App() {

  const {theme, toggleTheme} = useTheme();

  return (
    <>
      <Routes>
        <Route path='/kanban/login' element={<Login />} />
        <Route path='/kanban/register' element={<Register />} />
        <Route 
          path='/kanban/home' 
          element={
            <Home theme={theme} toggleTheme={toggleTheme} />
          } 
        />

        <Route 
          path='/kanban/board/:boardId'
          element={<Board theme={theme} toggleTheme={toggleTheme} />}
        />

      </Routes>
    </>

  )
}

export default App
