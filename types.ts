import type { LucideIcon } from 'lucide-react';

export interface Action {
    id: number;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    description: string;
}

export interface CustomFieldDefinition {
    id: string; // e.g., 'financialImpact'
    name: string; // e.g., 'Financial Impact ($)'
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[]; // For 'select' type
}

export interface Project {
    id: number;
    name: string;
    description: string;
    stage: 'Planning' | 'Development' | 'Testing' | 'Deployment' | 'Completed' | 'POC';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    technology: string;
    vendor: string;
    completionPercentage: number;
    startDate: string;
    deliveryDate: string;
    status: 'Green' | 'Amber' | 'Red';
    trend: 'Up' | 'Stable' | 'Down';
    risks: Risk[];
    tasks: Task[];
    actions: Action[];
    ownerId?: number;
    // Cost Management
    isCostIncluded?: boolean;
    budget?: number;
    actualCost?: number;
    forecastedCost?: number;
    costNotes?: string;
    // Financial Metrics
    isRoiIncluded?: boolean;
    roiPercentage?: number;
    roiAnalysisNotes?: string;
    roiVisibility?: {
        percentage: boolean;
        analysisNotes: boolean;
    };
    isNpvIncluded?: boolean;
    npvValue?: number;
    discountRate?: number;
    initialInvestment?: number;
    npvAnalysisNotes?: string;
    npvVisibility?: {
        value: boolean;
        discountRate: boolean;
        initialInvestment: boolean;
        analysisNotes: boolean;
    };
    isBusinessValueIncluded?: boolean;
    businessValueScore?: number;
    strategicAlignment?: 'Very High' | 'High' | 'Medium' | 'Low';
    marketOpportunity?: string;
    competitiveAdvantage?: string;
    businessValueNotes?: string;
    businessValueVisibility?: {
        score: boolean;
        strategicAlignment: boolean;
        marketOpportunity: boolean;
        competitiveAdvantage: boolean;
        businessValueNotes: boolean;
    };
}

export interface Risk {
    id: number;
    type: 'Low' | 'Medium' | 'High' | 'Critical';
    impact: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
    owner: string;
    mitigation: string;
    isVisibleOnDashboard: boolean;
    customFields?: { [key: string]: string | number | boolean };
}

export interface Task {
    id: number;
    description: string;
    isCompleted: boolean;
}

export interface TimelineEvent {
    id: number;
    name: string;
    type: 'Milestone' | 'Code Freeze' | 'Deployment Window' | 'Security Audit' | 'Go-Live' | 'Holiday Freeze' | 'Freeze' | 'Deployment';
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface Stakeholder {
    id: number;
    name: string;
    role: string;
    projectId: number;
    engagementLevel: 'Supportive' | 'Leading' | 'Neutral' | 'Resistant' | 'Unaware';
    influence: 'High' | 'Medium' | 'Low';
    interest: 'High' | 'Medium' | 'Low';
    communicationPlan: string;
    notes?: string;
}

export interface WeeklyTask {
    id: number;
    description: string;
    weekStartDate: string; // ISO string for the Monday of that week
    status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
    projectId?: number;
    priority: 'High' | 'Medium' | 'Low';
    ownerId: number;
}

export interface RiskScoringSettings {
    weights: {
        type: number;
        impact: number;
    };
    mappings: {
        type: { [key in 'Low' | 'Medium' | 'High' | 'Critical']: number };
        impact: { [key in 'Low' | 'Medium' | 'High' | 'Critical']: number };
    };
}

export interface SmtpSettings {
    enabled: boolean;
    server: string;
    port: number;
    user: string;
    pass: string;
    from: string;
}

export interface AiSettings {
    summarizationModel: string;
    enrichmentModel: string;
}

export interface LogSettings {
    logProjectUpdates: boolean;
    logProjectAdditions: boolean;
    logEmailSent: boolean;
    logSlidesExported: boolean;
}

export type LogAction = 'Project Updated' | 'Project Added' | 'Email Sent' | 'Slides Exported' | 'Settings Updated' | 'Data Imported' | 'Data Cleared' | 'User Logged In' | 'User Logged Out';

export interface LogEntry {
    id: number;
    timestamp: string; // ISO string
    action: LogAction;
    details: string; // e.g., "Project 'Phoenix' was updated." or "Report sent to john.doe@example.com"
    user: string; // e.g., "John Doe"
}

export interface AppSettings {
    appName: string;
    appLogo: string;
    headerTitle: string;
    headerSubtitle: string;
    appVersion: string;
    colorPrimary: string;
    colorAccent: string;
    colorSuccess: string;
    colorWarning: string;
    colorDanger: string;
    chartColor1: string;
    chartColor2: string;
    chartColor3: string;
    chartColor4: string;
    chartColor5: string;
    riskChartColorLow: string;
    riskChartColorMedium: string;
    riskChartColorHigh: string;
    riskChartColorCritical: string;
    riskScoring: RiskScoringSettings;
    smtpSettings: SmtpSettings;
    customFields?: {
        risks: CustomFieldDefinition[];
    };
    aiSettings: AiSettings;
    logSettings: LogSettings;
}

export interface SummaryCardData {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
}

export interface User {
    id: number;
    username: string;
    password?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Admin' | 'User' | 'Developer';
    status: 'Active' | 'Disabled';
    createdAt: string;
    lastLogin?: string;
}

// For Risk Management page, combines risk with project details
export interface EnrichedRisk extends Risk {
    projectId: number;
    projectName: string;
    projectStage: Project['stage'];
    projectStatus: Project['status'];
    score: number;
}