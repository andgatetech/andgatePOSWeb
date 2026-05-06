import { commonMetadata, generateMetadata } from '@/lib/seo';
import PosLeftSide from './PosLeftSide';
import PosRightSide from './PosRightSide';

export const metadata = generateMetadata({
    ...commonMetadata.pos,
    image: '/images/pos-terminal-og.jpg',
});

const PosPage = () => {
    return (
        <PosLeftSide>
            <PosRightSide />
        </PosLeftSide>
    );
};

export default PosPage;
