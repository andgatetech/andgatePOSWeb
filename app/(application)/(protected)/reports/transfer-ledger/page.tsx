'use client';

import OperationalReportPage from '../_shared/OperationalReportPage';
import { operationalReportConfigs } from '../_shared/operationalReportConfigs';

export default function TransferLedgerReportPage() {
    return <OperationalReportPage {...operationalReportConfigs.transferLedger} />;
}
