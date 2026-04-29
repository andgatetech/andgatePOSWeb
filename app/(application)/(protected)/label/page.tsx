import { Barcode, Package } from 'lucide-react';
import { getTranslation } from '@/i18n';
import PosLeftSide from '../pos/PosLeftSide';
import LabelGenerator from './component/LabelGenerator';

const page = () => {
    const { t } = getTranslation();
    return (
        <PosLeftSide
            disableSerialSelection={true}
            mobileButtonConfig={{
                showIcon: <Barcode className="h-6 w-6" />,
                hideIcon: <Package className="h-6 w-6" />,
                label: t('label_title'),
            }}
            reduxSlice="label"
        >
            <LabelGenerator></LabelGenerator>
        </PosLeftSide>
    );
};

export default page;
