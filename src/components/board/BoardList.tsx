import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "../../context/ThemeContext"
import {
  getBoardsMe,
  getProfile,
  createBoard,
  updateBoard,
  deleteBoard,
  logoutUser,
} from "../../services/api"

interface UserProfile {
  id: string
  name: string
  email: string
}

const BoardList = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [boards, setBoards] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [newBoardName, setNewBoardName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [backgroundPhoto, setBackgroundPhoto] = useState<string>("")
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    setLoading(true)
    try {
      const profile = await getProfile()
      setUser(profile)
      const data = await getBoardsMe()
      setBoards(data)
    } catch (error) {
      console.error(error)
      navigate("/") // Redirect to login on auth failure
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBoardId(null)
    setNewBoardName("")
    setDescription("")
    setBackgroundPhoto("")
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/")
    }
  }

  const handleBoardClick = (board: any) => {
    navigate(`/board/${board._id}`, { state: { board } })
  }

  const handleSaveBoard = async () => {
    if (!newBoardName.trim()) return
    try {
      if (editingBoardId) {
        const response = await updateBoard(editingBoardId, newBoardName, description || "", backgroundPhoto || undefined)
        setBoards(boards.map((b) => (b._id === editingBoardId ? response.updatedBoard : b)))
      } else {
        const response = await createBoard(newBoardName, description || "", backgroundPhoto || undefined)
        setBoards([...boards, response.newBoard])
      }
      closeModal()
    } catch (error) {
      console.error("Error saving board:", error)
    }
  }

  const handleStartEdit = (e: React.MouseEvent, board: any) => {
    e.stopPropagation()
    setEditingBoardId(board._id)
    setNewBoardName(board.name)
    setDescription(board.description || "")
    setBackgroundPhoto(board.backgroundPhoto || "")
    setShowModal(true)
  }

  const handleDeleteBoard = async (e: React.MouseEvent, board: any) => {
    e.stopPropagation()
    if (!window.confirm(`Delete "${board.name}"?`)) return
    try {
      await deleteBoard(board._id)
      setBoards(boards.filter((b) => b._id !== board._id))
    } catch (error) {
      console.error("Error deleting board:", error)
    }
  }

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"

  if (loading) return <div className="loading-screen">Loading workspace...</div>

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Navbar */}
      <nav className="app-navbar">
        <a className="navbar-brand" href="/boards">
          <img src="/logo-bella.png" alt="Bella Task" />
          Bella Task
        </a>
        <div className="navbar-actions">
          {user && <div className="user-avatar">{getInitials(user.name)}</div>}
          <button
            className="btn-theme-toggle"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Main */}
      <div className="boards-page">
        <div className="boards-header">
          <div>
            <h1 className="boards-title">
              {user ? `${user.name}'s Boards` : "My Boards"}
            </h1>
            <p className="boards-subtitle">
              {boards.length} board{boards.length !== 1 ? "s" : ""} in your workspace
            </p>
          </div>
        </div>

        <div className="boards-grid">
          {boards.map((board) => (
            <div
              key={board._id}
              className="board-card"
              onClick={() => handleBoardClick(board)}
              style={board.backgroundPhoto ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${board.backgroundPhoto})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              } : undefined}
            >
              <div className="board-card-content">
                <h3 className="board-card-name" style={board.backgroundPhoto ? {color: 'white'} : {}}>{board.name}</h3>
                <p className="board-card-desc" style={board.backgroundPhoto ? {color: '#e5e7eb'} : {}}>{board.description}</p>
              </div>
              <div className="board-card-footer">
                <button className="btn-open-board">
                  Open →
                </button>
                <div className="board-card-actions">
                  <button
                    className="btn-icon btn-icon-edit"
                    onClick={(e) => handleStartEdit(e, board)}
                  >
                    <FaEdit size={12} />
                  </button>
                  <button
                    className="btn-icon btn-icon-delete"
                    onClick={(e) => handleDeleteBoard(e, board)}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="board-card-new" onClick={() => setShowModal(true)}>
            <div className="board-card-new-icon">
              <FaPlus />
            </div>
            <span className="board-card-new-label">New Board</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">
              {editingBoardId ? "Edit Board" : "Create New Board"}
            </h2>
            <input
              type="text"
              className="modal-input"
              placeholder="Board Name"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              className="modal-input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="text"
              className="modal-input"
              placeholder="Background Photo URL (optional)"
              value={backgroundPhoto}
              onChange={(e) => setBackgroundPhoto(e.target.value)}
            />
            <div className="modal-footer-btns">
              <button className="btn-secondary-modal" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-primary-modal"
                onClick={handleSaveBoard}
                disabled={!newBoardName.trim()}
              >
                {editingBoardId ? "Save Changes" : "Create Board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardList
