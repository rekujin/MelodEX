import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthRedirect from './components/AuthRedirect'
import RequireAuth from './components/RequireAuth'

import Navbar from './components/Navbar'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

import './index.css'
import './App.css'

function App() {
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
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App