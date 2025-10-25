import type { AppSettings, Project, TimelineEvent, Risk, Action, Task, Stakeholder, WeeklyTask } from '../types';
import { mockAppSettings } from '../data/mockData';

export interface AppData {
    projects: Project[];
    settings: AppSettings;
    timelineEvents: TimelineEvent[];
    stakeholders: Stakeholder[];
    weeklyTasks: WeeklyTask[];
}

/**
 * Creates a downloadable JSON file from application data.
 * This function handles file creation and browser download triggers.
 * It does not handle fetching the data itself.
 * @param data The complete application data to export.
 */
export const exportData = (data: AppData): void => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ppm-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export data:", error);
        window.alert("Error exporting data. See console for details.");
    }
};

/**
 * Parses and transforms application data from a JSON string.
 * This function is a pure transformer; it does not perform any side effects
 * like saving data or confirming with the user.
 * @param jsonString The JSON string to parse.
 * @returns The parsed and mapped application data.
 * @throws An error if parsing fails or the data structure is invalid.
 */
export const importData = (jsonString: string): AppData => {
    try {
        const parsedData = JSON.parse(jsonString);

        const sourceData = parsedData.projects ? parsedData : parsedData.data;

        if (!sourceData || !Array.isArray(sourceData.projects)) {
             throw new Error('Invalid data file. "projects" array not found.');
        }

        const externalProjects = sourceData.projects;

        const capitalize = (s: string | null | undefined): string => {
            if (!s) return 'Stable';
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
        };

        const mapStage = (stage: string): Project['stage'] => {
            const lowerCaseStage = (stage || 'planning').toLowerCase();
            const stageMap: { [key: string]: Project['stage'] } = {
                'planning': 'Planning', 'poc': 'POC', 'execution': 'Development', 'development': 'Development',
                'testing': 'Testing', 'deployment': 'Deployment', 'completed': 'Completed'
            };
            return stageMap[lowerCaseStage] || 'Planning';
        };
        
        const mapPriority = (p: string) => (capitalize(p) as Project['priority']);
        const mapActionPriority = (p: string) => (capitalize(p) as Action['priority']);

        const projects: Project[] = externalProjects.map((p: any, index: number): Project => {
            const risks: Risk[] = (p.risks || []).map((r: any, rIndex: number): Risk => ({
                id: r.id || Date.now() + rIndex,
                type: mapPriority(r.type || 'medium') as 'Low' | 'Medium' | 'High' | 'Critical',
                impact: mapPriority(r.impact || 'medium') as 'Low' | 'Medium' | 'High' | 'Critical',
                description: r.description || 'No description',
                owner: r.owner || 'N/A',
                mitigation: r.mitigation || 'N/A',
                isVisibleOnDashboard: r.isVisibleOnDashboard !== undefined ? r.isVisibleOnDashboard : true,
            }));
            
            const tasks: Task[] = (p.tasks || []).map((t: any, tIndex: number): Task => ({
                id: t.id || Date.now() + tIndex,
                description: t.description || t.text || 'No description',
                isCompleted: t.isCompleted !== undefined ? t.isCompleted : (t.completed || false),
            }));

            const actions: Action[] = (p.actions || []).map((a: any, aIndex: number): Action => ({
                id: a.id || Date.now() + aIndex,
                priority: mapActionPriority(a.priority || a.type || 'high'),
                description: a.description || 'No description',
            }));

            return {
                id: p.id ? Number(String(p.id).replace(/\D/g, '') || Date.now()) + index : Date.now() + index,
                name: p.name || `Unnamed Project ${index + 1}`,
                description: p.description || '',
                stage: mapStage(p.stage || 'planning'),
                priority: mapPriority(p.priority || 'medium'),
                technology: p.technology || 'N/A',
                vendor: p.vendor || 'N/A',
                completionPercentage: p.completionPercentage || 0,
                startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                deliveryDate: p.deliveryDate ? new Date(p.deliveryDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: capitalize(p.status || 'green') as 'Green' | 'Amber' | 'Red',
                trend: capitalize(p.trend || 'stable') as 'Up' | 'Stable' | 'Down',
                risks,
                tasks,
                actions,
                ...p // Carry over any other fields like financials
            };
        });

        const importedSettings = sourceData.settings;
        const settings: AppSettings = {
            ...mockAppSettings,
            ...(importedSettings || {}),
        };

        const timelineEvents: TimelineEvent[] = sourceData.timelineEvents || [];
        const stakeholders: Stakeholder[] = sourceData.stakeholders || [];
        const weeklyTasks: WeeklyTask[] = sourceData.weeklyTasks || [];

        return { projects, settings, timelineEvents, stakeholders, weeklyTasks };

    } catch (err) {
        throw new Error(`Failed to parse or map JSON file: ${err instanceof Error ? err.message : String(err)}`);
    }
};