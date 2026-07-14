import React, { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaMoon, FaSun } from "react-icons/fa"
import { useTheme } from "../../context/ThemeContext"
import {
  getListsByBoardId,
  getCardsByListId,
  createList,
  updateList,
  deleteList,
  createCard,
  updateCardList,
  deleteCard,
  updateCardTitle,
  updateCard,
  getBoardById,
} from "../../services/api"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd"

const Board = () => {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [board, setBoard] = useState<any>(location.state?.board || null)
  const { theme, toggleTheme } = useTheme()

  const [lists, setLists] = useState<any[]>([])
  const [cardsByList, setCardsByList] = useState<{ [key: string]: any[] }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [newListName, setNewListName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [showInputField, setShowInputField] = useState<{ [key: string]: boolean }>({})
  const [newCardName, setNewCardName] = useState<{ [key: string]: string }>({})
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [tempEditCardName, setTempEditCardName] = useState<string>("")

  // Card details modal state
  const [showCardModal, setShowCardModal] = useState<boolean>(false)
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [cardModalName, setCardModalName] = useState<string>("")
  const [cardModalDesc, setCardModalDesc] = useState<string>("")
  const [cardMoveToList, setCardMoveToList] = useState<string>("")

  useEffect(() => {
    if (boardId) {
      fetchLists()
      if (!board) {
        fetchBoardDetails()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  const fetchBoardDetails = async () => {
    try {
      if (boardId) {
        const boardData = await getBoardById(boardId)
        setBoard(boardData)
      }
    } catch (error) {
      console.error("Failed to fetch board details", error)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal()
        closeCardModal()
      }
    }
    if (showModal || showCardModal) document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showModal, showCardModal])

  const closeModal = () => {
    setShowModal(false)
    setEditingListId(null)
    setNewListName("")
    setDescription("")
    setShowInputField({})
    setNewCardName({})
  }

  const closeCardModal = () => {
    setShowCardModal(false)
    setSelectedCard(null)
    setCardModalName("")
    setCardModalDesc("")
  }

  const fetchLists = async () => {
    try {
      if (boardId) {
        const data = await getListsByBoardId(boardId)
        setLists(data)

        const cardsResults = await Promise.allSettled(
          data.map((list: any) => getCardsByListId(list._id))
        )

        const newCardsByList: { [key: string]: any[] } = {}
        data.forEach((list: any, index: number) => {
          if (cardsResults[index].status === "fulfilled") {
            newCardsByList[list._id] = (cardsResults[index] as PromiseFulfilledResult<any[]>).value
          }
        })
        setCardsByList(newCardsByList)
      }
    } catch (err: any) {
      console.error(err.message)
      if (err.response?.status === 401) navigate("/")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveList = async () => {
    if (!newListName.trim() || !boardId) return
    try {
      if (editingListId) {
        const response = await updateList(editingListId, newListName, description || "")
        setLists(lists.map((l) => (l._id === editingListId ? response.updatedList : l)))
      } else {
        const response = await createList(newListName, description || "", boardId)
        setLists([...lists, response.newList])
      }
      closeModal()
    } catch (error) {
      console.error("Error saving list:", error)
    }
  }

  const handleEditList = (e: React.MouseEvent, list: any) => {
    e.stopPropagation()
    setEditingListId(list._id)
    setNewListName(list.name)
    setDescription(list.description || "")
    setShowModal(true)
  }

  const handleDeleteList = async (e: React.MouseEvent, list: any) => {
    e.stopPropagation()
    if (!window.confirm(`Delete list "${list.name}"?`)) return
    try {
      await deleteList(list._id)
      setLists(lists.filter((l) => l._id !== list._id))
    } catch (error) {
      console.error("Error deleting list:", error)
    }
  }

  const handleCardKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    listId: string,
    bId: string
  ) => {
    if (e.key === "Enter") {
      const name = newCardName[listId]
      if (!name?.trim()) return
      try {
        const response = await createCard(listId, bId, name)
        setCardsByList((prev) => ({
          ...prev,
          [listId]: [...(prev[listId] || []), response.newCard],
        }))
        setNewCardName((prev) => ({ ...prev, [listId]: "" }))
        setShowInputField((prev) => ({ ...prev, [listId]: false }))
      } catch (error) {
        console.error("Error saving card:", error)
      }
    }
    if (e.key === "Escape") {
      setShowInputField((prev) => ({ ...prev, [listId]: false }))
    }
  }

  const handleDeleteCard = async (e: React.MouseEvent, cardId: string, listId: string) => {
    e.stopPropagation()
    if (!window.confirm("Are you sure you want to delete this card?")) return
    try {
      await deleteCard(cardId)
      setCardsByList((prev) => ({
        ...prev,
        [listId]: prev[listId].filter((c) => c._id !== cardId),
      }))
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const handleStartEditCard = (e: React.MouseEvent, card: any) => {
    e.stopPropagation()
    handleOpenCardModal(card)
  }

  const handleUpdateCardName = async (e: React.KeyboardEvent<HTMLInputElement>, cardId: string, listId: string) => {
    if (e.key === "Enter") {
      if (!tempEditCardName.trim()) return
      try {
        await updateCardTitle(cardId, tempEditCardName)
        setCardsByList((prev) => ({
          ...prev,
          [listId]: prev[listId].map((c) => (c._id === cardId ? { ...c, name: tempEditCardName, title: tempEditCardName } : c)),
        }))
        setEditingCardId(null)
      } catch (error) {
        console.error("Error updating card:", error)
      }
    }
    if (e.key === "Escape") {
      setEditingCardId(null)
    }
  }

  const handleOpenCardModal = (card: any) => {
    setSelectedCard(card)
    setCardModalName(card.name || card.title)
    setCardModalDesc(card.description || "")
    setCardMoveToList("")
    setShowCardModal(true)
  }

  const handleSaveCardDetails = async () => {
    if (!selectedCard || !cardModalName.trim()) return
    try {
      await updateCard(
        selectedCard._id,
        cardModalName,
        cardModalDesc,
        selectedCard.assignee || "",
        selectedCard.dueDate || ""
      )
      
      const listId = selectedCard.list
      setCardsByList((prev) => ({
        ...prev,
        [listId]: prev[listId].map((c) =>
          c._id === selectedCard._id
            ? { ...c, name: cardModalName, title: cardModalName, description: cardModalDesc }
            : c
        ),
      }))
      closeCardModal()
    } catch (error) {
      console.error("Error saving card details:", error)
    }
  }

  const handleMoveCard = async (targetListId: string) => {
    if (!selectedCard || !targetListId || targetListId === selectedCard.list) return
    try {
      await updateCardList(selectedCard._id, targetListId)
      const sourceListId = selectedCard.list
      const movedCard = { ...selectedCard, list: targetListId }
      setCardsByList((prev) => {
        const sourceCards = (prev[sourceListId] || []).filter((c) => c._id !== selectedCard._id)
        const destCards = [...(prev[targetListId] || []), movedCard]
        return { ...prev, [sourceListId]: sourceCards, [targetListId]: destCards }
      })
      closeCardModal()
    } catch (error) {
      console.error("Error moving card:", error)
    }
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, type } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === "list") {
      const reordered = Array.from(lists)
      const [removed] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, removed)
      setLists(reordered)
      return
    }

    const sourceCards = Array.from(cardsByList[source.droppableId] || [])
    const destCards = Array.from(cardsByList[destination.droppableId] || [])
    const [removed] = sourceCards.splice(source.index, 1)
    destCards.splice(destination.index, 0, removed)

    setCardsByList({
      ...cardsByList,
      [source.droppableId]: sourceCards,
      [destination.droppableId]: destCards,
    })

    try {
      await updateCardList(removed._id, destination.droppableId)
    } catch (error) {
      console.error("Error updating card position:", error)
      fetchLists()
    }
  }

  return (
    <div className="board-view" style={{
      backgroundImage: board?.backgroundPhoto ? `url(${board.backgroundPhoto})` : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Top bar */}
      <div className="board-topbar">
        <button className="board-back-btn" onClick={() => navigate("/boards")}>
          <FaArrowLeft size={12} />
          Boards
        </button>
        <div className="board-topbar-divider" />
        <span className="board-topbar-name">{board?.name || "Board"}</span>
        <div style={{ flex: 1 }} />
        <button className="btn-add-list" onClick={() => setShowModal(true)}>
          <FaPlus size={11} />
          Add List
        </button>
        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <FaSun size={13} /> : <FaMoon size={13} />}
        </button>
      </div>

      {/* Kanban Canvas */}
      {loading ? (
        <div className="loading-wrapper">
          <div className="spinner" />
        </div>
      ) : (
        <div className="kanban-canvas">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-lists" direction="horizontal" type="list">
              {(provided: DroppableProvided) => (
                <div
                  className="kanban-lists"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {lists.length > 0 ? (
                    lists.map((list: any, index: number) => (
                      <Draggable key={list._id} draggableId={list._id} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="kanban-list"
                            style={provided.draggableProps.style}
                          >
                            {/* List Header */}
                            <div
                              className="kanban-list-header"
                              {...provided.dragHandleProps}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="kanban-list-title">{list.name}</span>
                                <span className="kanban-list-count">
                                  {(cardsByList[list._id] || []).length}
                                </span>
                              </div>
                              <div className="kanban-list-actions">
                                <button
                                  className="btn-icon btn-icon-edit"
                                  onClick={(e) => handleEditList(e, list)}
                                  title="Edit list"
                                >
                                  <FaEdit size={11} />
                                </button>
                                <button
                                  className="btn-icon btn-icon-delete"
                                  onClick={(e) => handleDeleteList(e, list)}
                                  title="Delete list"
                                >
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Cards */}
                            <Droppable droppableId={list._id} type="card">
                              {(provided: DroppableProvided) => (
                                <div
                                  className="kanban-list-body"
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {(cardsByList[list._id] || []).map((card: any, idx: number) => (
                                    <Draggable key={card._id} draggableId={card._id} index={idx}>
                                      {(provided: DraggableProvided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="kanban-card"
                                          style={provided.draggableProps.style}
                                          onClick={() => handleOpenCardModal(card)}
                                        >
                                          {editingCardId === card._id ? (
                                            <input
                                              className="kanban-card-edit-input"
                                              value={tempEditCardName}
                                              onChange={(e) => setTempEditCardName(e.target.value)}
                                              onKeyDown={(e) => handleUpdateCardName(e, card._id, list._id)}
                                              onBlur={() => setEditingCardId(null)}
                                              autoFocus
                                            />
                                          ) : (
                                            <>
                                              <div className="kanban-card-title">{card.title || card.name}</div>
                                              {card.description && (
                                                <div className="kanban-card-desc-preview">{card.description}</div>
                                              )}
                                              <div className="kanban-card-actions">
                                                <button
                                                  className="kanban-card-btn kanban-card-btn-edit"
                                                  onClick={(e) => handleStartEditCard(e, card)}
                                                  title="Edit card"
                                                >
                                                  <FaEdit size={10} />
                                                </button>
                                                <button
                                                  className="kanban-card-btn kanban-card-btn-delete"
                                                  onClick={(e) => handleDeleteCard(e, card._id, list._id)}
                                                  title="Delete card"
                                                >
                                                  <FaTrash size={10} />
                                                </button>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            {/* Add Card */}
                            <div className="kanban-add-card">
                              {showInputField[list._id] ? (
                                <input
                                  type="text"
                                  className="card-input"
                                  placeholder="Card title… (Enter to save, Esc to cancel)"
                                  value={newCardName[list._id] || ""}
                                  autoFocus
                                  onChange={(e) =>
                                    setNewCardName((prev) => ({
                                      ...prev,
                                      [list._id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) =>
                                    handleCardKeyDown(e, list._id, boardId!)
                                  }
                                />
                              ) : (
                                <button
                                  className="btn-add-card"
                                  onClick={() =>
                                    setShowInputField((prev) => ({
                                      ...prev,
                                      [list._id]: true,
                                    }))
                                  }
                                >
                                  <FaPlus size={10} />
                                  Add a card
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div style={{ color: "var(--text-muted)", padding: "40px", fontSize: "0.9rem" }}>
                      No lists yet. Click <strong style={{ color: "var(--primary-light)" }}>Add List</strong> to get started!
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {editingListId ? "Edit List" : "Create New List"}
            </div>
            <input
              type="text"
              className="modal-input"
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              autoFocus
            />
            <input
              type="text"
              className="modal-input"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="modal-footer-btns">
              <button className="btn-secondary-modal" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-primary-modal"
                onClick={handleSaveList}
                disabled={!newListName.trim()}
              >
                {editingListId ? "Save Changes" : "Create List"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Details Modal */}
      {showCardModal && selectedCard && (
        <div className="modal-overlay" onClick={closeCardModal}>
          <div className="modal-box card-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Card Details</div>

            <label className="modal-label">Title</label>
            <input
              type="text"
              className="modal-input"
              placeholder="Card title"
              value={cardModalName}
              onChange={(e) => setCardModalName(e.target.value)}
              autoFocus
            />

            <label className="modal-label">Description</label>
            <textarea
              className="modal-textarea"
              placeholder="Add a detailed description here..."
              value={cardModalDesc}
              onChange={(e) => setCardModalDesc(e.target.value)}
            />

            <label className="modal-label">Move to List</label>
            <div className="modal-move-row">
              <select
                className="modal-select"
                value={cardMoveToList}
                onChange={(e) => setCardMoveToList(e.target.value)}
              >
                <option value="">— Select a list —</option>
                {lists
                  .filter((l) => l._id !== selectedCard.list)
                  .map((l) => (
                    <option key={l._id} value={l._id}>{l.name}</option>
                  ))}
              </select>
              <button
                className="btn-move-card"
                onClick={() => handleMoveCard(cardMoveToList)}
                disabled={!cardMoveToList}
              >
                Move
              </button>
            </div>

            <div className="modal-footer-btns">
              <button className="btn-secondary-modal" onClick={closeCardModal}>
                Cancel
              </button>
              <button
                className="btn-primary-modal"
                onClick={handleSaveCardDetails}
                disabled={!cardModalName.trim()}
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Board
