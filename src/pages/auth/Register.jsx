import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import supabase from "../../helper/supabaseClient";
import AuthForm from "../../components/auth/AuthForm";
import { VALIDATION, checkPasswordStrength, translateSupabaseError } from "../../utils/validation";

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
  username: {
    label: "Имя пользователя",
    type: "text",
    placeholder: "username",
    validate: (val) => {
      if (!val) return "Введите имя пользователя";
      if (val.length < VALIDATION.MIN_USERNAME_LENGTH)
        return `Имя пользователя должно содержать минимум ${VALIDATION.MIN_USERNAME_LENGTH} символа`;
      if (!VALIDATION.USERNAME_REGEX.test(val))
        return "Имя пользователя может содержать только латинские буквы, цифры и знаки подчёркивания";
      return null;
    },
  },
  password: {
    label: "Пароль",
    type: "password",
    placeholder: "Не менее 8 символов",
    validate: (val) => {
      if (!val) return "Введите пароль";
      if (VALIDATION.CYRILLIC_REGEX.test(val))
        return "Пароль не может содержать русские символы";
      if (!VALIDATION.PASSWORD_REGEX.test(val))
        return "Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы";
      return null;
    },
    extraContent: (value) => value && (
      <div className="password-strength">
        <div className={`strength-bar strength-${checkPasswordStrength(value)}`} />
        <span>
          Сложность пароля:{" "}
          {["Слабый", "Средний", "Хороший", "Сильный"][
            checkPasswordStrength(value) - 1
          ] || "Очень слабый"}
        </span>
      </div>
    ),
  },
};

function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { username: formData.username } },
      });

      if (error) throw error;

      setMessage({
        text: "Аккаунт создан! Проверьте почту для подтверждения.",
        type: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
      title="Регистрация"
      fields={FIELDS}
      onSubmit={handleSubmit}
      submitButtonText="Зарегистрироваться"
      isLoading={isLoading}
      message={message}
    />
  );
}

export default Register;
