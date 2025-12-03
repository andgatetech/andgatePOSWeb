import { Box, Package } from 'lucide-react';
import PosLeftSide from '../../pos/PosLeftSide';
import PurchaseOrderRightSide from './PurchaseOrderRightSide';


const page = () => {
    return (
        <PosLeftSide
            disableSerialSelection={true}
            mobileButtonConfig={{
                showIcon: <Box className="h-6 w-6" />,
                hideIcon: <Package className="h-6 w-6" />,
                label: 'Purchase',
            }}
            reduxSlice="purchase"
        >
            <PurchaseOrderRightSide></PurchaseOrderRightSide>
        </PosLeftSide>
    );
};

export default page;
