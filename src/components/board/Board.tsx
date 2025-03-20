import React, { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import {
  getListsByBoardId,
  getCardsByListId,
  createList,
  updateList,
  deleteList,
  createCard,
  updateCardList,
} from "../../services/api"
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd"

const Board = () => {
  const { boardId } = useParams<{ boardId: string }>()
  const [lists, setLists] = useState<any[]>([])
  const [cardsByList, setCardsByList] = useState<{ [key: string]: any[] }>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [newListName, setNewListName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingListId, setEditingListId] = useState<string | null>(null)

  const [showInputField, setShowInputField] = useState<{
    [key: string]: boolean
  }>({})

  const [newCardName, setNewCardName] = useState<{ [key: string]: string }>({})

  const location = useLocation()
  const board = location.state?.board

  useEffect(() => {
    fetchLists()
  }, [boardId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditingListId(null)
        setNewListName("")
        setDescription("")
        setShowModal(false)

        // Cancel card input
        setShowInputField({})
        setNewCardName({})
      }
    }

    if (showModal || showInputField) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showModal])

  const fetchLists = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token && boardId) {
        const lists = await getListsByBoardId(boardId, token)
        setLists(lists)

        const cardsPromises = lists.map((list: any) =>
          getCardsByListId(list._id, token)
        )

        const cardsResults = await Promise.allSettled(cardsPromises)
        const newCardsByList: { [key: string]: any[] } = {}

        lists.forEach((list: any, index: any) => {
          if (cardsResults[index].status === "fulfilled") {
            newCardsByList[list._id] = (
              cardsResults[index] as PromiseFulfilledResult<any[]>
            ).value
          }
        })

        setCardsByList(newCardsByList)
      }
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveList = async () => {
    if (!newListName.trim() || !description.trim()) return

    try {
      const token = localStorage.getItem("token")
      if (token) {
        const name = newListName
        if (editingListId) {
          const response = await updateList(
            token,
            editingListId,
            name,
            description
          )
          setLists(
            lists.map((l) =>
              l._id === editingListId ? response.updatedList : l
            )
          )
        } else {
          const response = await createList(token, name, description, board._id)
          setLists([...lists, response.newList])
        }

        setShowModal(false)
        setEditingListId(null)
        setNewListName("")
        setDescription("")
      }
    } catch (error) {
      console.error("Error saving list:", error)
    }
  }

  const handleEditList = (event: React.MouseEvent, list: any) => {
    event.stopPropagation()
    setEditingListId(list._id)
    setNewListName(list.name)
    setDescription(list.description ? list.description : "")
    setShowModal(true)
  }

  const handleDeleteList = async (event: React.MouseEvent, list: any) => {
    event.stopPropagation()
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the list: ${list.name}?`
    )
    if (confirmDelete) {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          await deleteList(token, list._id)
          setLists(lists.filter((l) => l._id !== list._id))
        }
      } catch (error) {
        console.error("Error deleting list:", error)
      }
    }
  }

  const handleAddCardClick = (listId: string) => {
    setShowInputField((prev) => ({
      ...prev,
      [listId]: true,
    }))
  }

  const handleCardInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    listId: string
  ) => {
    const { value } = e.target
    setNewCardName((prev) => ({
      ...prev,
      [listId]: value,
    }))
  }

  const handleCardKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
    listId: string,
    boardId: string
  ) => {
    if (e.key === "Enter") {
      const name = newCardName[listId]
      if (name === undefined || !name.trim()) return

      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await createCard(token, listId, boardId, name)
          console.log(response)
          setCardsByList((prevCards) => ({
            ...prevCards,
            [listId]: [...(prevCards[listId] || []), response.newCard],
          }))
        }

        setNewCardName((prev) => ({
          ...prev,
          [listId]: "",
        }))
        setShowInputField((prev) => ({
          ...prev,
          [listId]: false,
        }))
      } catch (error) {
        console.error("Error saving card:", error)
      }
    }
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, type } = result

    // If there is no destination, return
    if (!destination) return

    // If the item was dropped in the same place, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Moving lists
    if (type === "list") {
      const reorderedLists = Array.from(lists)
      const [removed] = reorderedLists.splice(source.index, 1)
      reorderedLists.splice(destination.index, 0, removed)
      setLists(reorderedLists)
      return
    }

    // Moving cards
    const sourceList = cardsByList[source.droppableId] || []
    const destList = cardsByList[destination.droppableId] || []
    const sourceCards = Array.from(sourceList)
    const destCards = Array.from(destList)
    const [removed] = sourceCards.splice(source.index, 1)
    destCards.splice(destination.index, 0, removed)

    // Update local state immediately for a smoother experience
    setCardsByList({
      ...cardsByList,
      [source.droppableId]: sourceCards,
      [destination.droppableId]: destCards,
    })

    // Update the card in the backend
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const card = removed
        await updateCardList(token, card._id, destination.droppableId)
      }
    } catch (error) {
      console.error("Error updating card position:", error)
      // In case of error, reload the backend data
      fetchLists()
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">
        {board
          ? `${board.name} - ${board.description}`
          : "Board - No description available."}
      </h2>

      <div className="d-flex justify-content-start mb-3">
        <button
          className="btn btn-success btn-sm"
          style={{ width: "150px", height: "45px" }}
          onClick={() => setShowModal(true)}
        >
          <FaPlus style={{ marginRight: "8px" }} />
          Create New List
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided: DroppableProvided) => (
              <div
                className="lists-container d-flex flex-nowrap gap-3 mb-4"
                style={{
                  overflowX: "auto",
                  maxWidth: "100%",
                }}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {lists.length > 0 ? (
                  lists.map((list: any, index: number) => (
                    <Draggable
                      key={list._id}
                      draggableId={list._id}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="card shadow-sm"
                          style={{
                            width: "250px",
                            flexShrink: 0,
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div className="card-body">
                            <div {...provided.dragHandleProps}>
                              <h5 className="card-title">{list.name}</h5>
                              <p className="card-text">
                                {list.description ? list.description : ""}
                              </p>
                            </div>
                            <Droppable droppableId={list._id} type="card">
                              {(provided: DroppableProvided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  {cardsByList[list._id] &&
                                  cardsByList[list._id].length > 0 ? (
                                    cardsByList[list._id].map(
                                      (card: any, index: number) => (
                                        <Draggable
                                          key={card._id}
                                          draggableId={card._id}
                                          index={index}
                                        >
                                          {(provided: DraggableProvided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className="card mb-2"
                                              style={{
                                                minWidth: "50px",
                                                maxWidth: "100%",
                                                ...provided.draggableProps
                                                  .style,
                                              }}
                                            >
                                              <div className="card-body">
                                                <p
                                                  className="card-text"
                                                  style={{
                                                    wordBreak: "break-word",
                                                    overflowWrap: "break-word",
                                                    maxWidth: "100%",
                                                  }}
                                                >
                                                  {card.title || card.name}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    )
                                  ) : (
                                    <p>No cards available.</p>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>

                            {/* INPUT TO ADD A NEW CARD */}
                            {showInputField[list._id] ? (
                              <div className="mt-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter card title"
                                  value={newCardName[list._id] || ""}
                                  onChange={(e) =>
                                    handleCardInputChange(e, list._id)
                                  }
                                  onKeyDown={(e) =>
                                    handleCardKeyDown(e, list._id, board._id)
                                  }
                                />
                              </div>
                            ) : (
                              <button
                                className="btn btn-primary w-100 mt-2"
                                onClick={() => handleAddCardClick(list._id)}
                              >
                                <FaPlus style={{ marginRight: "8px" }} />
                                Add Card
                              </button>
                            )}

                            <div className="d-flex justify-content-end mt-2">
                              <button
                                className="btn btn-warning"
                                style={{
                                  padding: "0.5rem",
                                  marginRight: "10px",
                                }}
                                onClick={(e) => handleEditList(e, list)}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ padding: "0.5rem" }}
                                onClick={(e) => handleDeleteList(e, list)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <p className="text-center">
                    No lists available. Create a new list to get started!
                  </p>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="position-fixed top-50 start-50 translate-middle card shadow-sm"
          style={{
            width: "250px",
            flexShrink: 0,
            minHeight: "200px",
            zIndex: 1050,
          }}
        >
          <div className="card-body">
            <form
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter list name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter list description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="mt-3">
                <button
                  className="btn btn-success w-100"
                  onClick={handleSaveList}
                  disabled={!newListName.trim() || !description.trim()}
                >
                  {editingListId ? " Update" : "Create"}
                </button>
                <button
                  className="btn btn-secondary w-100 mt-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Board
