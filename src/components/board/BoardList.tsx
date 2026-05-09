import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaEdit, FaTrash, FaPlus, FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "../../context/ThemeContext"
import {
  getBoardsByUserId,
  getProfile,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../../services/api"
import { getUserIdFromToken } from "../../utils/auth"

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
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)

  useEffect(() => {
    userProfile()
    fetchBoards()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal()
    }
    if (showModal) document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showModal])

  const closeModal = () => {
    setShowModal(false)
    setEditingBoardId(null)
    setNewBoardName("")
    setDescription("")
  }

  const userProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const profile = await getProfile(token)
        setUser(profile)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const userId = getUserIdFromToken(token)
        if (userId) {
          const data = await getBoardsByUserId(token, userId)
          setBoards(data)
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    navigate("/")
  }

  const handleBoardClick = (board: any) => {
    navigate(`/board/${board._id}`, { state: { board } })
  }

  const handleSaveBoard = async () => {
    if (!newBoardName.trim()) return
    try {
      const token = localStorage.getItem("token")
      if (token) {
        if (editingBoardId) {
          const response = await updateBoard(token, editingBoardId, newBoardName, description || "")
          setBoards(boards.map((b) => (b._id === editingBoardId ? response.updatedBoard : b)))
        } else {
          const response = await createBoard(token, newBoardName, description || "")
          setBoards([...boards, response.newBoard])
        }
        closeModal()
      }
    } catch (error) {
      console.error("Error saving board:", error)
    }
  }

  const handleEditBoard = (e: React.MouseEvent, board: any) => {
    e.stopPropagation()
    setEditingBoardId(board._id)
    setNewBoardName(board.name)
    setDescription(board.description || "")
    setShowModal(true)
  }

  const handleDeleteBoard = async (e: React.MouseEvent, board: any) => {
    e.stopPropagation()
    if (!window.confirm(`Delete "${board.name}"?`)) return
    try {
      const token = localStorage.getItem("token")
      if (token) {
        await deleteBoard(token, board._id)
        setBoards(boards.filter((b) => b._id !== board._id))
      }
    } catch (error) {
      console.error("Error deleting board:", error)
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)" }}>
      {/* Navbar */}
      <nav className="app-navbar">
        <a className="navbar-brand" href="/boards">
          <img src="/bellatask-logo.png" alt="Bella Task" />
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

        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner" />
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board: any) => (
              <div className="board-card" key={board._id}>
                <div className="board-card-name">{board.name}</div>
                <div className="board-card-desc">
                  {board.description || "No description available."}
                </div>
                <div className="board-card-footer">
                  <button
                    className="btn-open-board"
                    onClick={() => handleBoardClick(board)}
                  >
                    Open →
                  </button>
                  <div className="board-card-actions">
                    <button
                      className="btn-icon btn-icon-edit"
                      title="Edit"
                      onClick={(e) => handleEditBoard(e, board)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon btn-icon-delete"
                      title="Delete"
                      onClick={(e) => handleDeleteBoard(e, board)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* New Board Card */}
            <div className="board-card-new" onClick={() => setShowModal(true)}>
              <div className="board-card-new-icon">
                <FaPlus />
              </div>
              <span className="board-card-new-label">New Board</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {editingBoardId ? "Edit Board" : "Create New Board"}
            </div>
            <input
              type="text"
              className="modal-input"
              placeholder="Board name"
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
