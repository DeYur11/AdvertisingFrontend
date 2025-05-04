import { useEffect } from 'react';
import './Modal.css';

export default function Modal({
                                  isOpen,
                                  onClose,
                                  title,
                                  children,
                                  size = 'medium',
                                  showCloseButton = true,
                                  className = ''
                              }) {
    // Handle ESC key press
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);

            // Блокуємо прокрутку
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('keydown', handleEscapeKey);
                document.body.style.overflow = originalOverflow; // Повертаємо початкове значення
            };
        }
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-container modal-${size} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                onClick={(e) => e.stopPropagation()} // 🛡️ блокуємо клік, щоб не закривало вікно
            >
                <div className="modal-header">
                    <h2 id="modal-title" className="modal-title">{title}</h2>
                    {showCloseButton && (
                        <button
                            className="modal-close-button"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    )}
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
