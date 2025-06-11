import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import supabase from "../../helper/supabaseClient";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

const translateSupabaseError = (error) => {
  if (!error?.message) return "Произошла ошибка при входе";

  const msg = error.message.toLowerCase();

  if (msg.includes("invalid login credentials"))
    return "Неверный email или пароль";
  if (msg.includes("email not confirmed"))
    return "Подтвердите email перед входом";
  if (msg.includes("invalid email")) return "Некорректный email";
  if (msg.includes("email rate limit"))
    return "Слишком много попыток. Попробуйте позже.";

  return error.message;
};

const VALIDATION = {
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  CYRILLIC_REGEX: /[а-яА-ЯёЁ]/,
};

const FIELDS = {
  email: {
    label: "Email",
    type: "email",
    placeholder: "example@mail.com",
    validate: (val) => {
      if (!val) return "Введите email";
      if (VALIDATION.CYRILLIC_REGEX.test(val))
        return "Email не может содержать русские символы";
      if (!VALIDATION.EMAIL_REGEX.test(val)) return "Некорректный формат email";
      return null;
    },
  },
  password: {
    label: "Пароль",
    type: "password",
    placeholder: "Введите ваш пароль",
    validate: (val) => {
      if (!val) return "Введите пароль";
      return null;
    },
  },
};

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    if (field !== "username" && VALIDATION.CYRILLIC_REGEX.test(value)) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    let hasErrors = false;

    for (const field of Object.keys(FIELDS)) {
      const error = FIELDS[field].validate(formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFieldErrors(errors);
      const firstErrorField = Object.keys(errors).find(
        (field) => errors[field]
      );
      setMessage({ text: errors[firstErrorField], type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      setMessage({
        text: "Вход выполнен успешно!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      setMessage({
        text: translateSupabaseError(error) || "Произошла ошибка при входе",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? (
            <Check />
          ) : (
            <AlertCircle />
          )}
          <span>{message.text}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        {Object.entries(FIELDS).map(([field, config]) => (
          <div className="form-group" key={field}>
            <div className="input-wrapper">
              <input
                id={field}
                type={
                  field === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : config.type
                }
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={config.placeholder}
                className={fieldErrors[field] ? "input-error" : ""}
                data-ispassword={field === "password"}
              />
              <label htmlFor={field}>{config.label}</label>
              {field === "email" && <Mail className="input-icon" />}
              {field === "password" && (
                <>
                  <Lock className="input-icon" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password"
                  >
                    {showPassword ? <EyeOff className="login-eye-off-icon"/> : <Eye className="login-eye-icon"/>}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

export default Login;
