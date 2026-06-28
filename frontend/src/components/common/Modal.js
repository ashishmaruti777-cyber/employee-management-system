import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, size }) => {
  if (!isOpen) return null;
  const sizeClass = size === 'large' ? 'modal-large' : size === 'small' ? 'modal-small' : '';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Delete'} footer={
    <>
      <button className="btn btn-outline" onClick={onClose}>Cancel</button>
      <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
    </>
  }>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" style={{ width: 24, height: 24 }}>
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Are you sure?</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{message || 'This action cannot be undone.'}</p>
      </div>
    </div>
  </Modal>
);

export default Modal;
