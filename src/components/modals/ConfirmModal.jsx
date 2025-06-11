import { X } from "lucide-react";

// Styles
import "./ConfirmModal.css";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <div className="modal-header">
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
          <h3>{title}</h3>
        </div>

        <div className="confirm-modal-body">
          <label>{message}</label>
        </div>

        <div className="confirm-modal-actions">
          <button onClick={onClose} className="confirm-modal-cancel">
            Отмена
          </button>
          <button onClick={onConfirm} className="confirm-modal-confirm">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};
