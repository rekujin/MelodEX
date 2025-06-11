import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

import AuthRedirect from "./components/route-guards/AuthRedirect";
import RequireAuth from "./components/route-guards/RequireAuth";
import PlaylistGuard from "./components/route-guards/PlaylistGuard";
import Navbar from "./components/layouts/Navbar";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/profile/Profile";
import PublicProfile from "./pages/profile/PublicProfile";
import CreatePlaylist from "./pages/playlists/CreatePlaylist";
import Playlists from "./pages/playlists/PlaylistLibrary";
import PlaylistView from "./pages/playlists/PlaylistView";
import NotFoundPage from "./pages/NotFoundPage";
import SearchResults from "./pages/SearchResult"

import "./index.css";
import "./App.css";

function App() {
  return (
    <ToastProvider>
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
              <Route path="/user/:username" element={<PublicProfile />} />

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

              {/* playlists view */}
              <Route path="/playlist/:id" element={<PlaylistView />} />

              {/* search */}
              <Route path="/search" element={<SearchResults />} />

              {/* 404 - должен быть последним */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
