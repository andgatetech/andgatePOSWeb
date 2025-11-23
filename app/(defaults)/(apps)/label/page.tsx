import { Barcode, Package } from 'lucide-react';
import PosLeftSide from '../pos/PosLeftSide';
import LabelGenerator from './component/LabelGenerator';

const page = () => {
    return (
        <PosLeftSide
            disableSerialSelection={true}
            mobileButtonConfig={{
                showIcon: <Barcode className="h-6 w-6" />,
                hideIcon: <Package className="h-6 w-6" />,
                label: 'Labels',
            }}
            reduxSlice="label"
        >
            <LabelGenerator></LabelGenerator>
        </PosLeftSide>
    );
};

export default page;
