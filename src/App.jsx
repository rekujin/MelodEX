import { BrowserRouter, Routes, Route } from 'react-router-dom'

//Импорт компонентов
import Navbar from './components/Navbar'

//Импорт страниц
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

//Импорт стилей
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
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App