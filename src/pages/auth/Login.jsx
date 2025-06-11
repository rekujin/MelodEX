import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import supabase from "../../helper/supabaseClient";
import AuthForm from "../../components/auth/AuthForm";
import { VALIDATION, translateSupabaseError } from "../../utils/validation";

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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
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
        navigate("/playlists");
      }, 1000);
    } catch (error) {
      setMessage({
        text: translateSupabaseError(error),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthForm
      title="Вход"
      fields={FIELDS}
      onSubmit={handleSubmit}
      submitButtonText="Войти"
      isLoading={isLoading}
      message={message}
    />
  );
}

export default Login;
