import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title = "Xác nhận", 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Xóa",
  cancelText = "Hủy",
  children,
  disableConfirm = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>{message}</p>
          {children}
        </div>
        <div className="confirm-dialog-footer">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="confirm-btn-delete" onClick={onConfirm} disabled={disableConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;