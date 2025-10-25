import { GoogleGenAI } from "@google/genai";
import type { Project } from '../types';

// Per guideline, assume API_KEY is available in process.env and initialize the client.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const summarizeProjects = async (projects: Project[], model: string): Promise<string> => {
    const projectData = projects.map(p => (
        `Project: ${p.name}\nDescription: ${p.description}\nStatus: ${p.status}\nCompletion: ${p.completionPercentage}%\nRisks: ${p.risks.length > 0 ? p.risks.map(r => r.description).join(', ') : 'None'}`
    )).join('\n\n');

    const prompt = `
        You are an executive project management assistant.
        Analyze the following project portfolio data and provide a high-level summary.
        Focus on overall portfolio health, identify key successes, and highlight the most critical risks.
        Format the output as clean HTML that can be rendered in a div. Use headings (h3), paragraphs (p), and lists (ul, li).
        
        Portfolio Data:
        ${projectData}
    `;

    try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing projects:", error);
        return "Failed to generate summary. Please check the console for details.";
    }
};

export const summarizeProject = async (project: Project, model: string): Promise<string> => {
    const projectData = `
        Project Name: ${project.name}
        Description: ${project.description}
        Status: ${project.status} (${project.trend} trend)
        Completion: ${project.completionPercentage}%
        Stage: ${project.stage}
        Priority: ${project.priority}
        Technology: ${project.technology}
        Start Date: ${project.startDate}
        Delivery Date: ${project.deliveryDate}
        Risks:
        ${project.risks.length > 0 ? project.risks.map(r => `- ${r.description} (Type: ${r.type})`).join('\n') : '- None'}
        Tasks:
        ${project.tasks.length > 0 ? project.tasks.map(t => `- ${t.description} (Completed: ${t.isCompleted})`).join('\n') : '- None'}
    `;

    const prompt = `
        You are a senior project manager.
        Analyze the following detailed project data and provide a comprehensive summary.
        Cover the project's current standing, potential blockers, and suggest next steps.
        Format the output as clean HTML that can be rendered in a div. Use headings (h3), paragraphs (p), and lists (ul, li).

        Project Data:
        ${projectData}
    `;

    try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing project:", error);
        return "Failed to generate project summary. Please check the console for details.";
    }
};


export const enrichText = async (text: string, context: string, style: 'professional' | 'technical' | 'business' | 'elaborate', model: string): Promise<string> => {
    let instruction = '';
    switch (style) {
        case 'professional':
            instruction = `Rewrite the following text to make it more professional.`;
            break;
        case 'technical':
            instruction = `Rewrite the following text to include more technical language and detail.`;
            break;
        case 'business':
            instruction = `Rewrite the following text to use more formal business terminology.`;
            break;
        case 'elaborate':
            instruction = `Elaborate on the following text, expanding on the core ideas, adding more detail, and providing a more comprehensive explanation.`;
            break;
    }

    const prompt = `
        You are an expert copywriter specializing in corporate and technical communication.
        ${instruction}
        Do not change the core meaning, but enhance it as instructed. Return only the improved text.

        Context of the text: "${context}"
        
        Original Text:
        "${text}"

        Improved Text:
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enriching text:", error);
        return text; // Return original text on error
    }
};