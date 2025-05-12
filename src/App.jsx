import React from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* home */}
        <Route 
          path='/'
          element={<Home />}
        />

        {/* login */}
        <Route 
          path='/login'
          element={<Login />}
        />

        {/* register */}
        <Route 
          path='/register'
          element={<Register />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App