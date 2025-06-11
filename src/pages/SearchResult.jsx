import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useMobile } from "../hooks/useMobile"; 
import { useSearch } from "../context/SearchContext";
import supabase from "../helper/supabaseClient";

import { ChevronDown, Search } from "lucide-react";

import { PlaylistCard } from "../components/playlist/PlaylistCard";

import "../pages/playlists/PlaylistLibrary.css";
import "./SearchResult.css";

const PLATFORM_OPTIONS = [
  { value: "all", label: "Все платформы", icon: null },
  { value: "spotify", label: "Spotify", icon: "/icons/spotify.svg" },
  { value: "yandex", label: "Яндекс Музыка", icon: "/icons/yandex.svg" },
  { value: "soundcloud", label: "SoundCloud", icon: "/icons/soundcloud.svg" },
];

const SORT_OPTIONS = [
  { value: "date", label: "Дате создания" },
  { value: "popularity", label: "Популярности" },
];

function SearchResults() {
  const location = useLocation();
  const { clearSearch } = useSearch();
  const { results = [], query = "" } = location.state || {};

  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  const { searchQuery, setSearchQuery } = useSearch();
  const isMobile = useMobile(768);
  const navigate = useNavigate();

  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (selectedPlatform !== "all") {
      filtered = filtered.filter(
        (playlist) => playlist.platform === selectedPlatform
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === "popularity") {
        return (b.likes_count || 0) - (a.likes_count || 0);
      }
      return 0;
    });

    return filtered;
  }, [results, selectedPlatform, sortBy]);

  useEffect(() => {
    return () => {
      clearSearch();
    };
  }, [clearSearch]);

  const handlePlatformSelect = (value) => {
    setSelectedPlatform(value);
    setIsPlatformDropdownOpen(false);
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setIsSortDropdownOpen(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!localSearchQuery.trim()) return;

    setSearchQuery(localSearchQuery);
    const results = await searchPlaylists(localSearchQuery);
    navigate("/search", { state: { results, query: localSearchQuery } });
  };

    const searchPlaylists = async (query) => {
    const cleanedQuery = query.trim().toLowerCase();
    
    const { data, error } = await supabase
      .from("playlists")
      .select(`
        id,
        title,
        description,
        avatar_url,
        platform,
        created_at,
        likes_count,
        author:author_id (
          id,
          username
        )
      `)
      .textSearch('title', cleanedQuery)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error searching playlists:", error);
      return [];
    }

    return data || [];
  };

    return (
    <div className="search-results-page">
      <div className="search-header">
        {isMobile && (
          <form className="mobile-search-form" onSubmit={handleSearch}>
            <div className="search-container">
              <svg
                className="search-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m21 21-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              <input
                type="text"
                placeholder="Поиск плейлистов..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        )}
        <h2>Результаты поиска: "{query}"</h2>

        <div className="search-filters">
          <div className="filter-group">
            <label>Платформа:</label>
            <div className="custom-select">
              <button 
                className="platform-select-button"
                onClick={() => setIsPlatformDropdownOpen(!isPlatformDropdownOpen)}
              >
                {PLATFORM_OPTIONS.find(opt => opt.value === selectedPlatform)?.label}
                <ChevronDown size={16} />
              </button>
              
              {isPlatformDropdownOpen && (
                <div className="platform-dropdown">
                  {PLATFORM_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`platform-option ${selectedPlatform === option.value ? 'selected' : ''}`}
                      onClick={() => handlePlatformSelect(option.value)}
                    >
                      {option.icon && <img src={option.icon} alt="" className="platform-icon" />}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-group">
            <label>Сортировать по:</label>
            <div className="custom-select">
              <button 
                className="platform-select-button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              >
                {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label}
                <ChevronDown size={16} />
              </button>
              
              {isSortDropdownOpen && (
                <div className="platform-dropdown">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`platform-option ${sortBy === option.value ? 'selected' : ''}`}
                      onClick={() => handleSortSelect(option.value)}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="no-results">
          <Search className="no-results-icon" size={64} />
          <h3>Ничего не найдено</h3>
          <p>
            К сожалению, по вашему запросу "{query}" результатов не найдено. 
            Попробуйте изменить параметры поиска или использовать другие ключевые слова.
          </p>
        </div>
      ) : (
        <div className="playlists-grid">
          {filteredResults.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;