import { Package, ShoppingCart } from 'lucide-react';
import React from 'react';

interface MobileCartButtonProps {
    showMobileCart: boolean;
    cartItemCount: number;
    onToggle: () => void;
}

const MobileCartButton: React.FC<MobileCartButtonProps> = ({ showMobileCart, cartItemCount, onToggle }) => {
    return (
        <button onClick={onToggle} className="hover:bg-primary-dark fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg lg:hidden">
            {showMobileCart ? <Package className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
            {cartItemCount > 0 && <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{cartItemCount}</span>}
        </button>
    );
};

export default MobileCartButton;
