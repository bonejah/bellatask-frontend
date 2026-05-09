import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import "bootstrap/dist/css/bootstrap.min.css"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ThemeProvider } from "./context/ThemeContext"

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <GoogleOAuthProvider clientId={(process.env.REACT_APP_GOOGLE_CLIENT_ID || "811007834632-6ed6eci68n2qjvdk2a995ie9dtud6j0k.apps.googleusercontent.com").replace(/['"]/g, "")}>
        <App />
      </GoogleOAuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
