import { useLocation } from "react-router-dom";
import { PlaylistCard } from "../components/playlist/PlaylistCard";
import "../pages/playlists/PlaylistLibrary.css";

function SearchResults() {
  const location = useLocation();
  const { results = [], query = "" } = location.state || {};

  return (
    <div className="search-results-page">
      <h2>Результаты поиска для: "{query}"</h2>
      {results.length === 0 ? (
        <p>Ничего не найдено.</p>
      ) : (
        <div className="public-playlists-grid">
          {results.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
