import type { Project, Risk, Task, AppSettings, Action, TimelineEvent, User, Stakeholder, WeeklyTask } from '../types';

export const mockRisks: Risk[] = [
    { id: 1, type: 'High', impact: 'High', description: 'Budget overrun due to vendor price increase.', owner: 'Finance Team', mitigation: 'Negotiate with alternative vendors.', isVisibleOnDashboard: true },
    { id: 2, type: 'Medium', impact: 'High', description: 'Key developer might leave the project.', owner: 'HR', mitigation: 'Document knowledge and cross-train team members.', isVisibleOnDashboard: true },
    { id: 3, type: 'Low', impact: 'Medium', description: 'Minor delays in third-party API delivery.', owner: 'Tech Lead', mitigation: 'Develop fallback plan using mock data.', isVisibleOnDashboard: false },
    { id: 4, type: 'Critical', impact: 'Critical', description: 'Core system dependency is being deprecated.', owner: 'CTO Office', mitigation: 'Fast-track migration to new system.', isVisibleOnDashboard: true },
];

export const mockTasks: Task[] = [
    { id: 1, description: 'Finalize UI/UX designs', isCompleted: true },
    { id: 2, description: 'Develop authentication module', isCompleted: true },
    { id: 3, description: 'Set up database schema', isCompleted: false },
    { id: 4, description: 'Getting Approval for the Mockups', isCompleted: true },
];

export const mockActions: Action[] = [
    { id: 1, priority: 'High', description: 'Obtain approval for the Project Charter' },
    { id: 2, priority: 'Medium', description: 'Share the BRD from SQM' },
    { id: 3, priority: 'High', description: 'Faiaz to do the integration' },
    { id: 4, priority: 'Low', description: 'Share the BRD to ServiceNow Team to start the POC' },
    { id: 5, priority: 'High', description: 'Security team to approve Manus' },
    { id: 6, priority: 'High', description: 'Mohammad Afife to start the POC activities' },
];

export const mockTimelineEvents: TimelineEvent[] = [
    { id: 1, name: 'Q1 2025 Planning', type: 'Milestone', startDate: '2025-01-01', endDate: '2025-01-05', description: 'Finalize strategic objectives and resource allocation for the first quarter.' },
    { id: 2, name: 'End-of-Year Code Freeze', type: 'Freeze', startDate: '2024-12-15', endDate: '2025-01-03', description: 'No new code deployments to production environments to ensure stability during the holiday period.' },
    { id: 3, name: 'Mobile App Deployment', type: 'Deployment', startDate: '2025-12-20', description: 'Rollout of version 3.0 of the customer-facing mobile application.' },
    { id: 4, name: 'Cloud Migration Go-Live', type: 'Deployment', startDate: '2025-03-25', endDate: '2025-03-31', description: 'Final phase of migrating on-premise servers to the new cloud infrastructure.' },
    { id: 5, name: 'Security Audit Window', type: 'Freeze', startDate: '2025-06-01', endDate: '2025-06-15', description: 'Annual third-party security audit and penetration testing.' },
];


export const mockProjects: Project[] = [
    {
        id: 1,
        name: 'Employee Portal (Landing page)',
        description: 'Revamping the Current SharePoint',
        stage: 'Planning',
        priority: 'Critical',
        technology: 'Software Development',
        vendor: 'SharePoint',
        completionPercentage: 25,
        startDate: '2025-09-21',
        deliveryDate: '2025-11-20',
        status: 'Amber',
        trend: 'Down',
        risks: [{ id: 2, type: 'High', impact: 'High', description: 'Risk 2', owner: 'Abdel', mitigation: 'Mitigation for risk 2', isVisibleOnDashboard: true, customFields: { financialImpact: 25000, complianceCategory: 'GDPR' } }],
        tasks: [mockTasks[3]],
        actions: [mockActions[0]],
        ownerId: 2,
        isCostIncluded: true,
        budget: 50000,
        actualCost: 15000,
        forecastedCost: 55000,
        costNotes: 'Initial vendor costs are higher than expected. Monitoring closely.',
        isRoiIncluded: true,
        roiPercentage: 15,
        roiAnalysisNotes: 'ROI is projected based on increased employee productivity and reduced administrative overhead. The initial estimate is conservative and could increase post-launch.',
        roiVisibility: {
            percentage: true,
            analysisNotes: true,
        },
        isNpvIncluded: true,
        npvValue: 12000,
        discountRate: 8,
        initialInvestment: 40000,
        npvAnalysisNotes: 'NPV calculated over a 3-year period. Assumes a consistent 8% discount rate. Positive NPV indicates project viability.',
        npvVisibility: {
            value: true,
            discountRate: true,
            initialInvestment: true,
            analysisNotes: true,
        },
        isBusinessValueIncluded: true,
        businessValueScore: 85,
        strategicAlignment: 'Very High',
        marketOpportunity: 'N/A - Internal project',
        competitiveAdvantage: 'Improves internal operational efficiency, allowing reallocation of resources to customer-facing initiatives.',
        businessValueNotes: 'High strategic alignment with the company\'s goal to modernize internal tools and improve employee experience.',
        businessValueVisibility: {
            score: true,
            strategicAlignment: true,
            marketOpportunity: false,
            competitiveAdvantage: true,
            businessValueNotes: true,
        }
    },
    {
        id: 2,
        name: 'Non-staff employees',
        description: 'Onboarding system for contract and temporary employees.',
        stage: 'POC',
        priority: 'High',
        technology: 'Web Dev',
        vendor: 'ServiceNow',
        completionPercentage: 60,
        startDate: '2025-09-21',
        deliveryDate: '2025-11-20',
        status: 'Amber',
        trend: 'Stable',
        risks: [],
        tasks: [],
        actions: [mockActions[2]],
        ownerId: 2,
    },
    {
        id: 3,
        name: 'Approval Inbox',
        description: 'Centralized inbox for managerial approvals.',
        stage: 'POC',
        priority: 'Low',
        technology: 'Software',
        vendor: 'ServiceNow',
        completionPercentage: 10,
        startDate: '2025-10-01',
        deliveryDate: '2025-12-24',
        status: 'Green',
        trend: 'Up',
        risks: [],
        tasks: [],
        actions: [mockActions[1], mockActions[3]],
        ownerId: 4,
    },
    {
        id: 4,
        name: 'Company Housing',
        description: 'Management system for corporate housing and accommodation.',
        stage: 'POC',
        priority: 'Medium',
        technology: 'Software',
        vendor: 'Agentic BPO - Manus',
        completionPercentage: 10,
        startDate: '2025-10-05',
        deliveryDate: '2025-10-16',
        status: 'Green',
        trend: 'Up',
        risks: [],
        tasks: [],
        actions: [mockActions[4], mockActions[5]],
        ownerId: 4,
    },
    {
        id: 5,
        name: 'Project Phoenix',
        description: 'A complete overhaul of the legacy CRM system to improve performance and user experience.',
        stage: 'Development',
        priority: 'High',
        technology: '.NET 8',
        vendor: 'In-house',
        completionPercentage: 60,
        startDate: '2024-01-15',
        deliveryDate: '2025-06-30',
        status: 'Amber',
        trend: 'Up',
        risks: [
            { 
                ...mockRisks[0], 
                customFields: { 
                    'financialImpact': 150000, 
                    'complianceCategory': 'SOX' 
                } 
            }, 
            {
                ...mockRisks[1],
                customFields: {
                    'financialImpact': 75000
                }
            }
        ],
        tasks: mockTasks,
        actions: [mockActions[0]],
        ownerId: 1,
        isCostIncluded: true,
        budget: 750000,
        actualCost: 800000,
        forecastedCost: 825000,
        costNotes: 'Over budget due to unexpected licensing fees for .NET 8 components.'
    },
    {
        id: 6,
        name: 'Project Titan',
        description: 'Migration of on-premise infrastructure to a cloud-based solution for scalability and cost-efficiency.',
        stage: 'Testing',
        priority: 'High',
        technology: 'AWS',
        vendor: 'Cloudflare',
        completionPercentage: 85,
        startDate: '2024-09-01',
        deliveryDate: '2025-03-31',
        status: 'Green',
        trend: 'Stable',
        risks: [mockRisks[2]],
        tasks: [mockTasks[0]],
        actions: [],
        ownerId: 1,
    },
    {
        id: 7,
        name: 'Project Apollo',
        description: 'Developing a new mobile application for customer engagement and loyalty.',
        stage: 'Planning',
        priority: 'Medium',
        technology: 'React Native',
        vendor: 'Firebase',
        completionPercentage: 15,
        startDate: '2025-02-01',
        deliveryDate: '2025-12-31',
        status: 'Green',
        trend: 'Up',
        risks: [],
        tasks: [],
        actions: [mockActions[1]],
        ownerId: 2,
    },
    {
        id: 8,
        name: 'Project Voyager',
        description: 'Data analytics platform for marketing insights.',
        stage: 'Completed',
        priority: 'Low',
        technology: 'Python',
        vendor: 'Tableau',
        completionPercentage: 100,
        startDate: '2024-05-01',
        deliveryDate: '2025-05-30',
        status: 'Green',
        trend: 'Stable',
        risks: [],
        tasks: [],
        actions: [],
        ownerId: 4,
    }
];

export const mockStakeholders: Stakeholder[] = [
    { id: 1, name: 'Abdel Rahman', role: 'Project Sponsor', projectId: 1, engagementLevel: 'Supportive', influence: 'High', interest: 'High', communicationPlan: 'Weekly status reports and bi-weekly meetings.' },
    { id: 2, name: 'David Lee', role: 'IT Director', projectId: 1, engagementLevel: 'Leading', influence: 'High', interest: 'Medium', communicationPlan: 'Direct calls for urgent issues, monthly steering committee.' },
    { id: 3, name: 'Maria Garcia', role: 'Lead Developer', projectId: 5, engagementLevel: 'Supportive', influence: 'Medium', interest: 'High', communicationPlan: 'Daily stand-ups and technical syncs.' },
    { id: 4, name: 'Chen Wei', role: 'Business Analyst', projectId: 5, engagementLevel: 'Neutral', influence: 'Medium', interest: 'Medium', communicationPlan: 'Engage via requirements workshops and JIRA comments.' },
    { id: 5, name: 'Jane Foster', role: 'Marketing Head', projectId: 7, engagementLevel: 'Supportive', influence: 'High', interest: 'High', communicationPlan: 'Provide demos and gather feedback on UI/UX.' },
];

const getMonday = (d: Date): Date => {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setHours(0,0,0,0);
  return new Date(d.setDate(diff));
};

const today = new Date();
const lastWeekDate = new Date();
lastWeekDate.setDate(today.getDate() - 7);
const lastMonday = getMonday(lastWeekDate);
const thisMonday = getMonday(today);

export const mockWeeklyTasks: WeeklyTask[] = [
    // Last week's tasks
    { id: 1, description: 'Finalize Q3 budget report', weekStartDate: lastMonday.toISOString().split('T')[0], status: 'Done', projectId: 1, priority: 'High', ownerId: 1 },
    { id: 2, description: 'Prepare for Phoenix project steering committee', weekStartDate: lastMonday.toISOString().split('T')[0], status: 'Done', projectId: 5, priority: 'High', ownerId: 1 },
    { id: 3, description: 'Review new vendor proposals for Project Titan', weekStartDate: lastMonday.toISOString().split('T')[0], status: 'In Progress', projectId: 6, priority: 'Medium', ownerId: 1 },
    { id: 4, description: 'Onboard new team member for Apollo', weekStartDate: lastMonday.toISOString().split('T')[0], status: 'Blocked', projectId: 7, priority: 'Low', ownerId: 2 },
    // This week's tasks
    { id: 5, description: 'Draft initial plan for Q4 marketing campaign', weekStartDate: thisMonday.toISOString().split('T')[0], status: 'To Do', priority: 'High', ownerId: 1 },
    { id: 6, description: 'Follow up on blocked onboarding task', weekStartDate: thisMonday.toISOString().split('T')[0], status: 'To Do', projectId: 7, priority: 'Medium', ownerId: 1 },
    { id: 7, description: 'Schedule technical deep-dive for CRM overhaul', weekStartDate: thisMonday.toISOString().split('T')[0], status: 'To Do', projectId: 5, priority: 'Medium', ownerId: 2 },
];


export const mockAppSettings: AppSettings = {
    appName: 'Enterprise PPM',
    appLogo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAASFBMVEX////0Qzb5v2T85Nj4sFP4tGn1dUH0RS/0UC/5wmf6ymz2fkb0Myv1bDf2h0v6z3b4rFD5uVn72KL2iVD60nv0Ni/1aC/83a5o8z8VAAACcklEQVR4nO3c63KqMBRAYYLIQkXF4q3//7sP8QChZ5MhUXf6PZ1znQxJpjkz2ZokSZIkSZIkSZIkSZIkSZKkX1Ike9d31J8E0T40F00Txbp5/xO3VM/zP3qOk43u22t/kLV63T6Xy2Y2m8lkMsZ/r9fL5XLb7fY4jlWrbYnjWErRNE0QBEEQxHGcpgkARVFCCCEEgiAIw3Acx3Ec53kURUnTnCbP82makrKspmlWVVVVVdXwPC/LslwuF4vFkCSJYRgej4dhindZlmVZFEXb7TYIgsPhsNvtTqcToihFUZQkSYIgCIIgCMMwjON4niVJEmWZpmkYhvM8z/Msy7Isy7IsS5IkSRIEQRCEYRgEQRDGcdM0URRFURSGYYQQAoBpmgRBKJfLhUIhSRIURc/zTNNkWWbLslwuD4fDRqORZVmGYXg+n0mS5Jy//fbt20gkQhAEpZQkSfM8D4KA6bohhBBCiGEYBEEIIdM0z3me53me53me53me53me5zmvGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIZhGIbpP2tIkiRJkiRJkiRJkiRJkiRJ+mB9Ab1aIvtS8qgIAAAAAElFTkSuQmCC',
    headerTitle: 'DXC Program Status Card',
    headerSubtitle: 'Enterprise Project Portfolio Management',
    appVersion: 'v2.2',
    colorPrimary: '#106FB3',
    colorAccent: '#3EA5F1',
    colorSuccess: '#7CC966',
    colorWarning: '#FDBF2A',
    colorDanger: '#DC2626',
    chartColor1: '#1480D0',
    chartColor2: '#65B9F7',
    chartColor3: '#074B79',
    chartColor4: '#2090E2',
    chartColor5: '#03274D',
    riskChartColorLow: '#3EA5F1',
    riskChartColorMedium: '#FDBF2A',
    riskChartColorHigh: '#F97316',
    riskChartColorCritical: '#DC2626',
    riskScoring: {
        weights: { type: 1.5, impact: 1.0 },
        mappings: {
            type: { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 },
            impact: { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 },
        }
    },
    smtpSettings: {
        enabled: false,
        server: 'smtp.example.com',
        port: 587,
        user: 'user@example.com',
        pass: '',
        from: 'noreply@ppm.com',
    },
    customFields: {
        risks: [
            { id: 'financialImpact', name: 'Financial Impact ($)', type: 'number' },
            { id: 'complianceCategory', name: 'Compliance Category', type: 'select', options: ['None', 'SOX', 'GDPR', 'HIPAA'] }
        ]
    },
    aiSettings: {
        summarizationModel: 'gemini-2.5-flash',
        enrichmentModel: 'gemini-2.5-flash'
    },
    logSettings: {
        logProjectUpdates: true,
        logProjectAdditions: true,
        logEmailSent: true,
        logSlidesExported: true,
    }
};

export const mockUsers: User[] = [
    { id: 1, username: 'j.doe', password: 'password', firstName: 'John', lastName: 'Doe', email: 'j.doe@example.com', role: 'Developer', status: 'Active', createdAt: '2023-01-15T10:00:00Z', lastLogin: '2024-07-20T15:30:00Z' },
    { id: 2, username: 's.smith', password: 'password', firstName: 'Sarah', lastName: 'Smith', email: 's.smith@example.com', role: 'User', status: 'Active', createdAt: '2023-02-20T11:00:00Z', lastLogin: '2024-07-19T09:15:00Z' },
    { id: 3, username: 'a.jones', password: 'password', firstName: 'Alex', lastName: 'Jones', email: 'a.jones@example.com', role: 'User', status: 'Disabled', createdAt: '2023-03-10T09:00:00Z', lastLogin: '2024-05-10T12:00:00Z' },
    { id: 4, username: 'm.williams', password: 'password', firstName: 'Mike', lastName: 'Williams', email: 'm.williams@example.com', role: 'User', status: 'Active', createdAt: '2023-04-05T14:00:00Z', lastLogin: '2024-07-20T11:45:00Z' },
];