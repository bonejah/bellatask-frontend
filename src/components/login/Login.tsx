import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../../services/api"

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await loginUser(email, password)
      localStorage.setItem("token", response.token)
      localStorage.setItem("refreshToken", response.refreshToken)
      navigate("/boards")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="bg-white p-4 rounded shadow-lg w-25">
        <div className="d-flex flex-column align-items-center">
          <img src="/bellatask-logo.png" alt="Logo" className="w-25 mb-3" />
          <h2 className="h4 font-weight-bold">Log in to continue</h2>
        </div>

        <form onSubmit={handleLogin} className="mt-4">
          <div className="form-group">
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

          <div className="form-check mt-3">
            <input type="checkbox" id="remember" className="form-check-input" />
            <label htmlFor="remember" className="form-check-label text-muted">
              Remember me
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4">
            Continue
          </button>
        </form>

        <div className="text-center mt-4">
          <a href="/register" className="text-primary">
            Create an account
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
