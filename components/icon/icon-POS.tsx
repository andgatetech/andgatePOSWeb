import { FC } from 'react';

interface IconPOSProps {
    className?: string;
}

const IconPOS: FC<IconPOSProps> = ({ className }) => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Screen/Display */}
            <rect x="4" y="3" width="16" height="10" rx="2" fill="url(#screenGradient)" stroke="#1E293B" strokeWidth="0.5" />

            {/* Screen Content */}
            <rect x="6" y="5" width="12" height="6" rx="1" fill="#0F172A" opacity="0.8" />
            <rect x="7" y="6" width="4" height="1" rx="0.5" fill="#10B981" />
            <rect x="7" y="8" width="6" height="0.5" rx="0.25" fill="#3B82F6" />
            <rect x="7" y="9" width="3" height="0.5" rx="0.25" fill="#6B7280" />
            <circle cx="15.5" cy="7.5" r="1" fill="#F59E0B" />
            <rect x="14" y="9" width="3" height="1" rx="0.5" fill="#EF4444" />

            {/* Base Stand */}
            <path d="M7 13 L17 13 L16 15 L8 15 Z" fill="url(#baseGradient)" stroke="#374151" strokeWidth="0.5" />

            {/* Keyboard/Input Area */}
            <rect x="5" y="15" width="14" height="4" rx="1" fill="url(#keyboardGradient)" stroke="#4B5563" strokeWidth="0.5" />

            {/* Keys */}
            <circle cx="7" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="8.5" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="10" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="11.5" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="13" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="14.5" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="16" cy="16.5" r="0.4" fill="#F3F4F6" />
            <circle cx="17" cy="16.5" r="0.4" fill="#F3F4F6" />

            <circle cx="7" cy="17.8" r="0.4" fill="#F3F4F6" />
            <circle cx="8.5" cy="17.8" r="0.4" fill="#F3F4F6" />
            <circle cx="10" cy="17.8" r="0.4" fill="#10B981" />
            <rect x="11" y="17.4" width="3" height="0.8" rx="0.4" fill="#3B82F6" />
            <circle cx="15" cy="17.8" r="0.4" fill="#EF4444" />
            <circle cx="16.5" cy="17.8" r="0.4" fill="#F3F4F6" />
            <circle cx="17" cy="17.8" r="0.4" fill="#F3F4F6" />

            {/* Card Reader Slot */}
            <rect x="19.5" y="8" width="1" height="4" rx="0.5" fill="#1F2937" stroke="#374151" strokeWidth="0.3" />

            {/* Receipt Printer */}
            <rect x="2" y="6" width="1.5" height="6" rx="0.5" fill="url(#printerGradient)" stroke="#6B7280" strokeWidth="0.3" />

            {/* Receipt Paper */}
            <path d="M2.2 6 L3.2 6 L3.2 5 C3.2 4.7 3 4.5 2.7 4.5 C2.4 4.5 2.2 4.7 2.2 5 Z" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.2" />

            {/* Power LED */}
            <circle cx="18" cy="4" r="0.3" fill="#10B981">
                <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Gradients */}
            <defs>
                <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9CA3AF" />
                    <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>

                <linearGradient id="keyboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="50%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                <linearGradient id="printerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D1D5DB" />
                    <stop offset="100%" stopColor="#9CA3AF" />
                </linearGradient>

                {/* Additional gradient for cash drawer */}
                <linearGradient id="drawerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
            </defs>

            {/* Cash Drawer */}
            <rect x="6" y="19.5" width="12" height="2" rx="0.5" fill="url(#drawerGradient)" stroke="#D97706" strokeWidth="0.5" />

            {/* Drawer Handle */}
            <rect x="11" y="20" width="2" height="0.5" rx="0.25" fill="#92400E" />

            {/* Money compartments */}
            <line x1="8" y1="19.8" x2="8" y2="21.2" stroke="#D97706" strokeWidth="0.3" />
            <line x1="10" y1="19.8" x2="10" y2="21.2" stroke="#D97706" strokeWidth="0.3" />
            <line x1="14" y1="19.8" x2="14" y2="21.2" stroke="#D97706" strokeWidth="0.3" />
            <line x1="16" y1="19.8" x2="16" y2="21.2" stroke="#D97706" strokeWidth="0.3" />
        </svg>
    );
};

export default IconPOS;
