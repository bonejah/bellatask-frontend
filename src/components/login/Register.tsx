import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../../services/api"

const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await registerUser(name, email, password)
      localStorage.setItem("token", response.token)
      navigate("/boards")
    } catch (err) {
      setError("Registration failed. Please try again.")
    }
  }

  const handleBack = () => {
    navigate("/")
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-4 rounded shadow-lg w-25">
        <div className="d-flex flex-column align-items-center">
          <img src="/bellatask-logo.png" alt="Logo" className="w-25 mb-3" />
          <h2 className="h4 font-weight-bold">Create an Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-group">
            <label htmlFor="name" className="text-muted">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="form-control"
              required
            />
          </div>

          <div className="form-group mt-3">
            <label htmlFor="email" className="text-muted">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="form-control"
              required
            />
          </div>

          <div className="form-group mt-3">
            <label htmlFor="password" className="text-muted">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="form-control"
              required
            />
          </div>

          {error && <p className="text-danger mt-2">{error}</p>}

          <button type="submit" className="btn btn-primary w-100 mt-4">
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={handleBack} className="btn btn-secondary w-100">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
