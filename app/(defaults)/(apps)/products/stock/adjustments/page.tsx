import { Box, Package } from 'lucide-react';
import PosLeftSide from '../../../pos/PosLeftSide';
import StockAdjustment from './component/StockAdjustment';

const page = () => {
    return (
        <PosLeftSide
            disableSerialSelection={true}
            mobileButtonConfig={{
                showIcon: <Box className="h-6 w-6" />,
                hideIcon: <Package className="h-6 w-6" />,
                label: 'Stock',
            }}
            reduxSlice="stock"
        >
            <StockAdjustment></StockAdjustment>
        </PosLeftSide>
    );
};

export default page;
