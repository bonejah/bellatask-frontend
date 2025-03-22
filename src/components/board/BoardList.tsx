import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaEdit as FaEditIcon,
  FaPlus as FaPlusIcon,
  FaTrash as FaTrashIcon,
} from "react-icons/fa"

import {
  getBoardsByUserId,
  getProfile,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../../services/api"
import jwtDecode from "jwt-decode"

interface DecodedToken {
  id: string
}

interface UserProfile {
  id: string
  name: string
  email: string
}

const BoardList = () => {
  const navigate = useNavigate()
  const [boards, setBoards] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [newBoardName, setNewBoardName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    userProfile()
    fetchBoards()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditingBoardId(null)
        setNewBoardName("")
        setDescription("")
        setShowModal(false)
      }
    }

    if (showModal) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showModal])

  const userProfile = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const userId = jwtDecode<DecodedToken>(token).id
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
        const userId = jwtDecode<DecodedToken>(token).id
        const boards = await getBoardsByUserId(token, userId)
        setBoards(boards)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleBoardClick = (board: any) => {
    navigate(`/board/${board._id}`, { state: { board } })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    navigate("/")
  }

  const handleSaveBoard = async () => {
    if (!newBoardName.trim() || !description.trim()) return

    try {
      const token = localStorage.getItem("token")
      if (token) {
        const name = newBoardName
        if (editingBoardId) {
          const response = await updateBoard(
            token,
            editingBoardId,
            name,
            description
          )
          setBoards(
            boards.map((b) =>
              b._id === editingBoardId ? response.updatedBoard : b
            )
          )
        } else {
          const response = await createBoard(token, name, description)
          setBoards([...boards, response.newBoard])
        }

        setEditingBoardId(null)
        setNewBoardName("")
        setDescription("")
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error saving board:", error)
    }
  }

  const handleEditBoard = (event: React.MouseEvent, board: any) => {
    event.stopPropagation()
    setEditingBoardId(board._id)
    setNewBoardName(board.name)
    setDescription(board.description)
    setShowModal(true)
  }

  const handleDeleteBoard = async (event: React.MouseEvent, board: any) => {
    event.stopPropagation()
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the board: ${board.name}?`
    )
    if (confirmDelete) {
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
  }

  return (
    <div className="container mt-5">
      <div className="text-end mb-3">
        <a href="/" className="text-danger" onClick={handleLogout}>
          Logout
        </a>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {user && <h2 className="mb-4">{user.name} your boards are here:</h2>}
          {boards.length > 0 ? (
            boards.map((board: any) => (
              <div className="col-md-3 col-sm-6 col-12 mb-3" key={board._id}>
                <div
                  className="card shadow-sm h-100 cursor-pointer"
                  style={{ width: "100%" }}
                >
                  <div className="card-body">
                    <h5 className="card-title">{board.name}</h5>
                    <p className="card-text">
                      {board.description ||
                        "No description available for this board."}
                    </p>
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => handleBoardClick(board)}
                    >
                      Go to Board
                    </button>
                    <div className="d-flex justify-content-end mt-2">
                      <button
                        className="btn btn-warning"
                        style={{ padding: "0.5rem", marginRight: "10px" }}
                        onClick={(e) => handleEditBoard(e, board)}
                      >
                        <FaEditIcon size={16} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "0.5rem" }}
                        onClick={(e) => handleDeleteBoard(e, board)}
                      >
                        <FaTrashIcon size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No boards found. Create a new board to get started!</p>
          )}
        </div>
      )}

      <div className="text-center mt-4">
        <button className="btn btn-success" onClick={() => setShowModal(true)}>
          <FaPlusIcon style={{ marginRight: "8px" }} />
          Create New Board
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBoardId ? "Update Board" : "Create New Board"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Board name"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveBoard}
                  disabled={!newBoardName.trim() || !description.trim()}
                >
                  {editingBoardId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BoardList
