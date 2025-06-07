import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import supabase from "../helper/supabaseClient";
import './PublicProfile.css';

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('username', username)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Профиль не найден');

        setProfile(data);
      } catch (err) {
        console.error('Ошибка при загрузке профиля:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="error-container">
        <p>Профиль не найден</p>
      </div>
    );
  }

  return (
    <div className="public-profile-page">
      <div className="public-profile-container">
        <div className="public-profile-card">
          <div className="public-profile-header">
            <h1 className="public-profile-title">Профиль пользователя</h1>
          </div>

          <div className="public-profile-content">
            <div className="public-profile-avatar">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  className="avatar-image"
                />
              ) : (
                <User className="public-profile-avatar-icon" />
              )}
            </div>
            
            <h2 className="public-profile-username">{profile.username}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;