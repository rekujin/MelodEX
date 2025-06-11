import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context
import { ToastProvider } from "./context/ToastContext";
import { SearchProvider } from "./context/SearchContext";

// Route-guards
import AuthRedirect from "./components/route-guards/AuthRedirect";
import RequireAuth from "./components/route-guards/RequireAuth";
import PlaylistGuard from "./components/route-guards/PlaylistGuard";

// Navigation
import Navbar from "./components/layouts/Navbar";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/profile/Profile";
import PublicProfile from "./pages/profile/PublicProfile";
import CreatePlaylist from "./pages/playlists/CreatePlaylist";
import PlaylistLibrary from "./pages/playlists/PlaylistLibrary";
import PlaylistView from "./pages/playlists/PlaylistView";
import NotFoundPage from "./pages/NotFoundPage";
import SearchResults from "./pages/SearchResult"

// Styles
import "./index.css";
import "./App.css";

function App() {
  return (
    <ToastProvider>
      <SearchProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />
            <div className="page-container">
              <Routes>
                {/* Home */}
                <Route path="/" element={<Home />} />

                {/* Register */}
                <Route
                  path="/register"
                  element={
                    <AuthRedirect>
                      <Register />
                    </AuthRedirect>
                  }
                />

                {/* Login */}
                <Route
                  path="/login"
                  element={
                    <AuthRedirect>
                      <Login />
                    </AuthRedirect>
                  }
                />

                {/* Profile */}
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <Profile />
                    </RequireAuth>
                  }
                />

                {/* Public Profile */}
                <Route path="/user/:username" element={<PublicProfile />} />

                {/* Create Playlist */}
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

                {/* Edit Playlist */}
                <Route path="/playlists/edit" element={<CreatePlaylist />} />

                {/* Playlist Library */}
                <Route
                  path="/playlists"
                  element={
                    <RequireAuth>
                      <PlaylistLibrary />
                    </RequireAuth>
                  }
                />

                {/* Playlist Detail */}
                <Route path="/playlist/:id" element={<PlaylistView />} />

                {/* Search result */}
                <Route path="/search" element={<SearchResults />} />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </SearchProvider>
    </ToastProvider>
  );
}

export default App;
