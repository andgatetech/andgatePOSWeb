import { Box, Package } from 'lucide-react';
import { getTranslation } from '@/i18n';
import PosLeftSide from '../../../pos/PosLeftSide';
import StockAdjustment from './component/StockAdjustment';

const page = () => {
    const { t } = getTranslation();
    return (
        <PosLeftSide
            disableSerialSelection={true}
            mobileButtonConfig={{
                showIcon: <Box className="h-6 w-6" />,
                hideIcon: <Package className="h-6 w-6" />,
                label: t('lbl_stock'),
            }}
            reduxSlice="stock"
        >
            <StockAdjustment></StockAdjustment>
        </PosLeftSide>
    );
};

export default page;
