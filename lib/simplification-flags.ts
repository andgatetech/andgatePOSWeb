export const SIMPLIFICATION_FLAGS = {
    simplifiedNavigation: process.env.NEXT_PUBLIC_SIMPLIFIED_NAV !== 'false',
    roleDashboard: process.env.NEXT_PUBLIC_ROLE_DASHBOARD !== 'false',
    reportsHub: process.env.NEXT_PUBLIC_REPORTS_HUB !== 'false',
    workflowTracking: process.env.NEXT_PUBLIC_WORKFLOW_TRACKING !== 'false',
};
