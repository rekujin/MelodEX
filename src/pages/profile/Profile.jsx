import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Save,
  Camera,
  AlertCircle,
  Check,
  EyeOff,
  Eye,
} from "lucide-react";
import { useFormValidation } from "../../hooks/useFormValidation";
import { VALIDATORS } from "../../utils/validation";
import supabase from "../../helper/supabaseClient";
import { useAuth } from "../../hooks/useAuth";

import "./Profile.css";

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationRules = {
    username: VALIDATORS.username,
    email: VALIDATORS.email,
    newPassword: (value) => VALIDATORS.password(value, false),
    confirmPassword: (value) =>
      VALIDATORS.confirmPassword(value, formValidation.values.newPassword),
  };

  const formValidation = useFormValidation(
    {
      username: "",
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationRules
  );

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
      formValidation.handleChange("username", profile.username || "");
      formValidation.handleChange("email", user.email || "");
      formValidation.handleChange("newPassword", "");
      formValidation.handleChange("confirmPassword", "");
    } catch (error) {
      console.error("Ошибка при загрузке профиля:", error);
      setMessage({ type: "error", text: "Не удалось загрузить профиль" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    formValidation.handleChange(field, value);

    const fieldsOrder = ["username", "email", "newPassword", "confirmPassword"];
    const currentValues = {
      ...formValidation.values,
      [field]: value,
    };

    const firstError = fieldsOrder
      .map((fieldName) => {
        if (fieldName === "newPassword" && !currentValues.newPassword) return null;
        if (fieldName === "confirmPassword" && !currentValues.newPassword) return null;
        return validationRules[fieldName](currentValues[fieldName]);
      })
      .find((error) => error !== null);

    if (firstError) {
      setMessage({ type: "error", text: firstError });
    } else {
      setMessage({ type: "", text: "" });
    }
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
      if (!formValidation.validateForm()) {
        // Найдем первую ошибку для отображения
        const firstError = Object.values(formValidation.errors).find((error) => error);
        setMessage({
          type: "error",
          text: firstError || "Пожалуйста, исправьте ошибки в форме",
        });
        return;
      }

      setSaving(true);
      setMessage({ type: "", text: "" });

      const { username, email, newPassword } = formValidation.values;

      if (username !== profile.username) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ username })
          .eq("id", user.id);

        if (profileError)
          throw new Error("Ошибка при обновлении имени пользователя");
      }

      const updateData = {};
      if (email !== user.email) {
        updateData.email = email;
      }
      if (newPassword) {
        updateData.password = newPassword;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updateData);
        if (authError) {
          if (authError.message.includes("email")) {
            throw new Error(
              "Ошибка при изменении email. Возможно, такой email уже существует"
            );
          }
          if (authError.message.includes("password")) {
            throw new Error(
              "Ошибка при изменении пароля. Попробуйте другой пароль"
            );
          }
          throw new Error("Ошибка при обновлении профиля");
        }
      }

      if (updateData.email) {
        setMessage({
          type: "success",
          text: "На вашу почту отправлено письмо для подтверждения.",
        });
      } else {
        setMessage({ type: "success", text: "Профиль успешно обновлен!" });
      }

      formValidation.handleChange("newPassword", "");
      formValidation.handleChange("confirmPassword", "");

      await loadUserProfile();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setMessage({
        type: "error",
        text: error.message || "Произошла ошибка при обновлении профиля",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
      setMessage({ type: "error", text: "Ошибка при выходе из системы" });
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
                  value={formValidation.values.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className={formValidation.errors.username ? "error" : ""}
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
                  value={formValidation.values.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={formValidation.errors.email ? "error" : ""}
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
                  type={showPassword ? "text" : "password"}
                  value={formValidation.values.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  className={formValidation.errors.newPassword ? "error" : ""}
                  id="newPassword"
                />
                <label htmlFor="newPassword">Новый пароль</label>
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="login-eye-icon" />
                  ) : (
                    <EyeOff className="login-eye-off-icon" />
                  )}
                </button>
              </div>
            </div>

            {formValidation.values.newPassword && (
              <div className="form-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formValidation.values.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={formValidation.errors.confirmPassword ? "error" : ""}
                    id="confirmPassword"
                    required
                  />
                  <label htmlFor="confirmPassword">Подтвердите пароль</label>
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <Eye className="login-eye-icon" />
                    ) : (
                      <EyeOff className="login-eye-off-icon" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="save-button"
            >
              {saving ? <div className="loader"></div> : <Save />}
              {saving ? "Сохранение..." : "Сохранить"}
            </button>

            <button
              onClick={handleLogout}
              className="logout-button"
              disabled={saving}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
