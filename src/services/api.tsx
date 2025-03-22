import axios from "axios"

const api = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
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

export const getProfile = async (token: string) => {
  const response = await api.get("/users/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Board
export const getBoardsByUserId = async (token: string, userId: string) => {
  const response = await api.get(`/boards/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const createBoard = async (
  token: string,
  name: string,
  description: string
) => {
  const response = await api.post(
    "/boards",
    { name, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const updateBoard = async (
  token: string,
  boardId: string,
  name: string,
  description: string
) => {
  const response = await api.put(
    `/boards/${boardId}`,
    { name, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const deleteBoard = async (token: string, boardId: string) => {
  const response = await api.delete(`/boards/${boardId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// List
export const getListsByBoardId = async (boardId: string, token: string) => {
  const response = await api.get(`/list/${boardId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getCardsByListId = async (listId: string, token: string) => {
  const response = await api.get(`/cards/${listId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const createList = async (
  token: string,
  name: string,
  description: string,
  boardId: string
) => {
  const response = await api.post(
    `/list/${boardId}`,
    { name, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const updateList = async (
  token: string,
  listId: string,
  name: string,
  description: string
) => {
  const response = await api.put(
    `/list/${listId}`,
    { name, description },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const deleteList = async (token: string, listId: string) => {
  const response = await api.delete(`/list/${listId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

// Card
export const createCard = async (
  token: string,
  listId: string,
  boardId: string,
  name: string
) => {
  const response = await api.post(
    `/cards/${listId}`,
    { boardId, name },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const updateCardList = async (
  token: string,
  cardId: string,
  newListId: string
) => {
  const response = await api.put(
    `/list/card/${cardId}`,
    { newListId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const updateCard = async (
  token: string,
  cardId: string,
  name: string,
  description: string,
  assignee: string,
  dueDate: string
) => {
  const response = await api.put(
    `/cards/${cardId}`,
    { name, description, assignee, dueDate },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}
