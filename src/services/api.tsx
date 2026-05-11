import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
})

// User
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post("/users/register", { name, email, password })
  return response.data
}

export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/users/login", { email, password })
  return response.data
}

export const googleLoginUser = async (token: string) => {
  const response = await api.post("/users/google-login", { token })
  return response.data
}

export const logoutUser = async () => {
  const response = await api.post("/users/logout")
  return response.data
}

export const getProfile = async () => {
  const response = await api.get("/users/profile")
  return response.data
}

// Board
export const getBoardsMe = async () => {
  const response = await api.get("/boards/me")
  return response.data
}

export const getBoardsByUserId = async (userId: string) => {
  const response = await api.get(`/boards/user/${userId}`)
  return response.data
}

export const getBoardById = async (boardId: string) => {
  const response = await api.get(`/boards/${boardId}`)
  return response.data
}

export const createBoard = async (
  name: string,
  description: string
) => {
  const response = await api.post("/boards", { name, description })
  return response.data
}

export const updateBoard = async (
  boardId: string,
  name: string,
  description: string
) => {
  const response = await api.put(`/boards/${boardId}`, { name, description })
  return response.data
}

export const deleteBoard = async (boardId: string) => {
  const response = await api.delete(`/boards/${boardId}`)
  return response.data
}

// List
export const getListsByBoardId = async (boardId: string) => {
  const response = await api.get(`/list/${boardId}`)
  return response.data
}

export const getCardsByListId = async (listId: string) => {
  const response = await api.get(`/cards/${listId}`)
  return response.data
}

export const createList = async (
  name: string,
  description: string,
  boardId: string
) => {
  const response = await api.post(`/list/${boardId}`, { name, description })
  return response.data
}

export const updateList = async (
  listId: string,
  name: string,
  description: string
) => {
  const response = await api.put(`/list/${listId}`, { name, description })
  return response.data
}

export const deleteList = async (listId: string) => {
  const response = await api.delete(`/list/${listId}`)
  return response.data
}

// Card
export const createCard = async (
  listId: string,
  boardId: string,
  name: string
) => {
  const response = await api.post(`/cards/${listId}`, { boardId, name })
  return response.data
}

export const updateCardList = async (
  cardId: string,
  newListId: string
) => {
  const response = await api.put(`/list/card/${cardId}`, { newListId })
  return response.data
}

export const updateCard = async (
  cardId: string,
  name: string,
  description: string,
  assignee: string,
  dueDate: string
) => {
  const response = await api.put(`/cards/${cardId}`, { name, description, assignee, dueDate })
  return response.data
}

export const updateCardTitle = async (
  cardId: string,
  name: string
) => {
  const response = await api.put(`/cards/${cardId}`, { name })
  return response.data
}

export const deleteCard = async (cardId: string) => {
  const response = await api.delete(`/cards/${cardId}`)
  return response.data
}
