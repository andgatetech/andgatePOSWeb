'use client';

import OperationalReportPage from '../_shared/OperationalReportPage';
import { operationalReportConfigs } from '../_shared/operationalReportConfigs';

export default function EmployeeSalesReportPage() {
    return <OperationalReportPage {...operationalReportConfigs.employeeSales} />;
}
