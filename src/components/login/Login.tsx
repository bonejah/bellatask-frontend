import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { googleLoginUser, getProfile } from "../../services/api"
import { GoogleLogin } from '@react-oauth/google'

const Login = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  React.useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await getProfile()
      navigate("/boards")
    } catch (err) {
      // Not logged in, stay on login page
    }
  }

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      if (credentialResponse.credential) {
        await googleLoginUser(credentialResponse.credential)
        navigate("/boards")
      }
    } catch (err) {
      setError("Google Login failed. Please try again.")
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/bellatask-logo.png" alt="Bella Task" className="login-logo" />
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your Bella Task workspace</p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-google-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setError("Google Login Failed")}
            useOneTap
            shape="rectangular"
            theme="filled_blue"
            size="large"
            text="continue_with"
            width="340"
          />
        </div>
      </div>
    </div>
  )
}

export default Login
