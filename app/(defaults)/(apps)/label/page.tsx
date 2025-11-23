import PosLeftSide from "../pos/PosLeftSide";
import LabelGenerator from "./component/LabelGenerator";


const page = () => {
    return (
        <PosLeftSide disableSerialSelection={true}>
            <LabelGenerator></LabelGenerator>
        </PosLeftSide>
    );
};

export default page;
