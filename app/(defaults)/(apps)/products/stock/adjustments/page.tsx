import PosLeftSide from '../../../pos/PosLeftSide';
import StockAdjustment from './component/StockAdjustment';

const page = () => {
    return (
        <PosLeftSide disableSerialSelection={true}>
            <StockAdjustment></StockAdjustment>
        </PosLeftSide>
    );
};

export default page;
