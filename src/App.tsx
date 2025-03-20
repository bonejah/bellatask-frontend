// src/App.tsx
import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Login from "./components/login/Login"
import BoardList from "./components/board/BoardList"
import Board from "./components/board/Board"
import Register from "./components/login/Register"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/boards" element={<BoardList />} />
        <Route path="/board/:boardId" element={<Board />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
}

export default App
