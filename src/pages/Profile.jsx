import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Save,
  Camera,
  AlertCircle,
  Check,
} from "lucide-react";
import supabase from "../helper/supabaseClient";
import "./Profile.css";
import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user, authLoading]);

  const loadUserProfile = async () => {
    try {
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profile);
      setFormData({
        username: profile.username || "",
        email: user.email || "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
      setMessage({ type: "error", text: "Не удалось загрузить профиль" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setSaving(true);

      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Файл слишком большой. Максимальный размер 2MB");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      if (profile.avatar_url) {
        try {
          const oldFilePath = profile.avatar_url
            .split("avatars/")[1]
            ?.split("?")[0];

          if (oldFilePath) {
            await supabase.storage.from("avatars").remove([oldFilePath]);
          }
        } catch (error) {
          console.warn("Не удалось удалить старый аватар:", error);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        await supabase.storage.from("avatars").remove([filePath]);
        throw updateError;
      }

      setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      setMessage({ type: "success", text: "Аватар обновлен!" });
    } catch (error) {
      console.error("Ошибка при загрузке аватара:", error);
      setMessage({
        type: "error",
        text: error.message || "Не удалось загрузить аватар",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      if (
        formData.newPassword &&
        formData.newPassword !== formData.confirmPassword
      ) {
        setMessage({ type: "error", text: "Пароли не совпадают" });
        return;
      }

      if (formData.newPassword && formData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "Пароль должен содержать минимум 6 символов",
        });
        return;
      }

      if (formData.username !== profile.username) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ username: formData.username })
          .eq("id", user.id);

        if (profileError) throw profileError;
      }

      const updateData = {};
      if (formData.email !== user.email) {
        updateData.email = formData.email;
      }
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updateData);
        if (authError) throw authError;
      }

      setMessage({ type: "success", text: "Профиль успешно обновлен!" });

      setFormData((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));

      await loadUserProfile();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setMessage({
        type: "error",
        text: error.message || "Не удалось сохранить изменения",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="profile-page">
        <div className="loading-spinner">
          <User className="w-12 h-12 text-gray-400" />
          <p>Не удалось загрузить профиль</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1 className="profile-title">Профиль</h1>
          </div>

          <div className="profile-content">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <div className="avatar-container">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Аватар"
                      className="avatar-image"
                    />
                  ) : (
                    <User className="profile-avatar-icon" />
                  )}
                </div>

                <label className="avatar-upload-overlay">
                  <Camera className="upload-avatar-icon" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={saving}
                  />
                </label>
              </div>

              <h2 className="username-display">{profile.username}</h2>
            </div>

            {message.text && (
              <div
                className={`message ${
                  message.type === "success" ? "success" : "error"
                }`}
              >
                {message.type === "success" ? <Check /> : <AlertCircle />}
                <span>{message.text}</span>
              </div>
            )}

            <div className="form-group">
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  id="username"
                  required
                />
                <label htmlFor="username">Имя пользователя</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  id="email"
                  required
                />
                <label htmlFor="email">Email</label>
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  id="newPassword"
                />
                <label htmlFor="newPassword">Новый пароль</label>
              </div>
            </div>

            {formData.newPassword && (
              <div className="form-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    id="confirmPassword"
                    required
                  />
                  <label htmlFor="confirmPassword">Подтвердите пароль</label>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="save-button"
            >
              {saving ? <div className="loader"></div> : <Save />}
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
