'use client';
import { useEffect, useState } from 'react';
import PurchaseOrderLeftSide from './PurchaseOrderLeftSide';
import PurchaseOrderRightSide from './PurchaseOrderRightSide';

const PurchaseCreatePage = () => {
    const [isMobileView, setIsMobileView] = useState(false);
    const [showMobileCart, setShowMobileCart] = useState(false);

    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 1024);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        return () => window.removeEventListener('resize', checkMobileView);
    }, []);

    return (
        <div className="relative flex overflow-hidden">
            {/* Left Side - Product Selection */}
            <PurchaseOrderLeftSide isMobileView={isMobileView} showMobileCart={showMobileCart} setShowMobileCart={setShowMobileCart} />

            {/* Right Side - Draft Details & Items */}
            <PurchaseOrderRightSide isMobileView={isMobileView} showMobileCart={showMobileCart} />
        </div>
    );
};

export default PurchaseCreatePage;
