// src/components/common/Modal.jsx
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

const Modal = ({
  open,
  onClose,
  children,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = '',
}) => {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full bg-white rounded-xl shadow-modal animate-slide-up',
            sizes[size],
            className
          )}
          role="dialog"
          aria-modal="true"
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg text-dark-400 hover:text-dark-600 hover:bg-light-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {title && (
            <div className="px-6 pt-6 pb-2">
              <h2 className="text-xl font-semibold text-dark-900">{title}</h2>
            </div>
          )}
          <div className="px-6 pb-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalHeader = ({ children, className = '' }) => (
  <div className={cn('px-6 pt-6 pb-4', className)}>
    <h2 className="text-xl font-semibold text-dark-900">{children}</h2>
  </div>
);

const ModalBody = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

const ModalFooter = ({ children, className = '' }) => (
  <div className={cn('px-6 py-4 bg-light-50 rounded-b-xl flex items-center justify-end gap-3', className)}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
