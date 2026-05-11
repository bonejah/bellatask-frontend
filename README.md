# Bella Task - Frontend 🎨

A modern, high-performance, and responsive interface for the Bella Task management platform.

## ✨ Highlights
- **Modern Design**: Linear/Trello inspired interface with a focus on UX.
- **Native Dark Mode**: Robust theme system with persistence.
- **Drag & Drop**: Fluid movement for cards and lists using `@hello-pangea/dnd`.
- **Security**: Cookie-based authentication (no token exposure in JavaScript).
- **Glassmorphism**: Modern visual aesthetic with blur and transparency effects.

## 🛠️ Tech Stack
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/) (configured with `withCredentials`)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Context API](https://reactjs.org/docs/context.html) (Theme Management)

## ⚙️ Setup
1. Install dependencies: `npm install`.
2. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Add your `REACT_APP_GOOGLE_CLIENT_ID` to the `.env` file.

## 🏃 Execution
- **Development**: `npm start`
- **Build**: `npm run build`

## 📁 Folder Structure
- `src/components`: Reusable components and page views.
- `src/context`: Global state management (Theme).
- `src/services`: API communication layer.
- `src/index.css`: Centralized Design System based on CSS Variables.
