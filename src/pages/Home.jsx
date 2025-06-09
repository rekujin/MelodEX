import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music, Heart } from 'lucide-react'
import supabase from "../helper/supabaseClient"
import './Home.css'

function Home() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const { data, error } = await supabase
          .from('playlists')
          .select(`
            id,
            title,
            description,
            avatar_url,
            likes_count,
            track_count,
            total_duration,
            created_at,
            profiles(username)
          `)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setPlaylists(data || []);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  };

  return (
    <div className="home-container">
      <div className="recent-playlists">
        <h2>Недавно созданные плейлисты</h2>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id}
                className="playlist-card"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div className="playlist-cover">
                  {playlist.avatar_url ? (
                    <img src={playlist.avatar_url} alt={playlist.title} />
                  ) : (
                    <div className="playlist-placeholder">
                      <Music className="playlist-icon" />
                    </div>
                  )}
                </div>
                
                <div className="playlist-info">
                  <h4 className="playlist-title">{playlist.title}</h4>
                  <div className="playlist-author">
                    by {playlist.profiles?.username}
                  </div>
                  
                  <div className="playlist-meta">
                    <div className="playlist-stats">
                      <Heart className="playlist-stat-icon" />
                      <span>{playlist.likes_count || 0}</span>
                    </div>
                    
                    <div className="playlist-stats">
                      {playlist.track_count || 0} треков
                      {playlist.total_duration && (
                        <> • {formatDuration(playlist.total_duration)}</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home