'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

const ModalWrapper = ({ isOpen, onClose, title, subtitle, icon: Icon, size = 'md', children }) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    // Size configurations
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" onClick={handleBackdropClick}>
            <div className={`mx-4 w-full ${sizeClasses[size]} transform rounded-2xl bg-white shadow-2xl transition-all`} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className="rounded-lg bg-white/20 p-2">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            {subtitle && <p className="text-sm text-blue-100">{subtitle}</p>}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default ModalWrapper;
