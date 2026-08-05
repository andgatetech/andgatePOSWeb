import { commonMetadata, generateMetadata } from '@/lib/seo';
import WarrantiesTable from './component/WarrantiesTable';

export const metadata = generateMetadata({
    ...commonMetadata.products,
    title: 'Warranties & Serials | POS',
    description: 'Track and manage product serial numbers, warranty status, and validity',
});

const WarrantiesPage = () => {
    return (
        <div>
            <WarrantiesTable />
        </div>
    );
};

export default WarrantiesPage;
