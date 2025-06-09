import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRedirect from "./components/route-guards/AuthRedirect";
import RequireAuth from "./components/route-guards/RequireAuth";
import PlaylistGuard from "./components/route-guards/PlaylistGuard";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import CreatePlaylist from "./pages/CreatePlaylist";
import Playlists from "./pages/PlaylistLibrary";
import PlaylistView from "./pages/PlaylistView";

import "./index.css";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <div className="page-container">
          <Routes>
            {/* home */}
            <Route path="/" element={<Home />} />

            {/* register */}
            <Route
              path="/register"
              element={
                <AuthRedirect>
                  <Register />
                </AuthRedirect>
              }
            />

            {/* login */}
            <Route
              path="/login"
              element={
                <AuthRedirect>
                  <Login />
                </AuthRedirect>
              }
            />

            {/* profile */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            {/* public profile */}
            <Route 
              path="/user/:username" 
              element={<PublicProfile />} 
            />

            {/* createPlaylist */}
            <Route
              path="/create-playlist"
              element={
                <RequireAuth>
                  <PlaylistGuard>
                    <CreatePlaylist />
                  </PlaylistGuard>
                </RequireAuth>
              }
            />

            {/* playlists (created/favourite) */}
            <Route
              path="/playlists"
              element={
                <RequireAuth>
                  <Playlists />
                </RequireAuth>
              }
            />

            <Route 
              path="/playlist/:id" 
              element={<PlaylistView />} 
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
