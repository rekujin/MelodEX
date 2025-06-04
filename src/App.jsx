import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import AuthRedirect from './components/AuthRedirect'
import RequireAuth from './components/RequireAuth'

import Navbar from './components/Navbar'
import CreateModal from './components/CreateModal'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CreatePlaylist from './pages/CreatePlaylist'

import { useState } from 'react'

import './index.css'
import './App.css'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <div className="page-container">
          <Routes>
            {/* home */}
            <Route 
              path='/'
              element={<Home />}
            />

            {/* register */}
            <Route 
              path='/register'
              element={
                <AuthRedirect>
                  <Register />
                </AuthRedirect>
              }
            />

            {/* login */}
            <Route 
              path='/login'
              element={
                <AuthRedirect>
                  <Login />
                </AuthRedirect>
              }
            />

            {/* profile */}
            <Route
              path='/profile'
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            {/* createPlaylist */}
            <Route
              path='/create-playlist'
              element={
                <RequireAuth>
                  <CreatePlaylist />
                </RequireAuth>
              }
            />
          </Routes>
        </div>
      </div>
      <CreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onImportSuccess={(playlistData) => {
          setIsModalOpen(false);
          // Используем useNavigate для перехода с передачей данных
          window.location.href = '/create-playlist?imported=1'; // fallback если не используем navigate
          // Лучше использовать navigate, см. ниже
        }}
      />
    </BrowserRouter>
  )
}

export default App