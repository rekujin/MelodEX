import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Check } from "lucide-react";

const AuthForm = ({ 
  title, 
  fields, 
  onSubmit, 
  submitButtonText,
  isLoading,
  message 
}) => {
  const [formData, setFormData] = useState(
    Object.fromEntries(Object.keys(fields).map(key => [key, ""]))
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    let hasErrors = false;

    for (const field of Object.keys(fields)) {
      const error = fields[field].validate?.(formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFieldErrors(errors);
      return;
    }

    await onSubmit(formData);
  };

  const renderInputIcon = (field) => {
    switch (field) {
      case "email":
        return <Mail className="input-icon" />;
      case "password":
        return <Lock className="input-icon" />;
      case "username":
        return <User className="input-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <h2>{title}</h2>
      {message?.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? <Check /> : <AlertCircle />}
          <span>{message.text}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        {Object.entries(fields).map(([field, config]) => (
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
              {renderInputIcon(field)}
              {field === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="login-eye-off-icon" />
                  ) : (
                    <Eye className="login-eye-icon" />
                  )}
                </button>
              )}
            </div>
            {fieldErrors[field] && (
              <div className="field-error">{fieldErrors[field]}</div>
            )}
            {config.extraContent?.(formData[field])}
          </div>
        ))}
        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? "Загрузка..." : submitButtonText}
        </button>
      </form>
    </div>
  );
};

export default AuthForm; 