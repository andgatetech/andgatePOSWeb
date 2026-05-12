import { commonMetadata, generateMetadata } from '@/lib/seo';
import OfflineSyncManager from '@/components/pos/OfflineSyncManager';
import PosLeftSide from './PosLeftSide';
import PosRightSide from './PosRightSide';

export const metadata = generateMetadata({
    ...commonMetadata.pos,
    image: '/images/pos-terminal-og.jpg',
});

const PosPage = () => {
    return (
        <>
            <OfflineSyncManager />
            <PosLeftSide>
                <PosRightSide />
            </PosLeftSide>
        </>
    );
};

export default PosPage;
