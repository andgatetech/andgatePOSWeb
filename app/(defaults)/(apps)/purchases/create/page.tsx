import PurchaseOrderLeftSide from './PurchaseOrderLeftSide';
import PurchaseOrderRightSide from './PurchaseOrderRightSide';

const PurchaseCreatePage = () => {
    return (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Left Side - Product Selection */}
            <PurchaseOrderLeftSide />

            {/* Right Side - Draft Details & Items */}
            <PurchaseOrderRightSide />
        </div>
    );
};

export default PurchaseCreatePage;
