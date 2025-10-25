

import { describe, it, expect, jest } from '@jest/globals';
import { calculateRiskScore } from '../services/riskService';
import type { Risk, AppSettings } from '../types';
import { mockAppSettings } from '../data/mockData';

describe('calculateRiskScore', () => {
    const settings: AppSettings = mockAppSettings;

    it('should calculate the score correctly for a Low/Low risk', () => {
        const risk: Risk = { id: 1, type: 'Low', impact: 'Low', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true };
        // (typeValue * typeWeight) + (impactValue * impactWeight)
        // (1 * 1.5) + (1 * 1.0) = 1.5 + 1.0 = 2.5, rounded to 3
        const score = calculateRiskScore(risk, settings);
        expect(score).toBe(3);
    });

    it('should calculate the score correctly for a High/Medium risk', () => {
        const risk: Risk = { id: 1, type: 'High', impact: 'Medium', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true };
        // (3 * 1.5) + (2 * 1.0) = 4.5 + 2.0 = 6.5, rounded to 7
        const score = calculateRiskScore(risk, settings);
        expect(score).toBe(7);
    });

    it('should calculate the score correctly for a Critical/Critical risk', () => {
        const risk: Risk = { id: 1, type: 'Critical', impact: 'Critical', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true };
        // (4 * 1.5) + (4 * 1.0) = 6.0 + 4.0 = 10.0, rounded to 10
        const score = calculateRiskScore(risk, settings);
        expect(score).toBe(10);
    });

    it('should return 0 if riskScoring settings are missing', () => {
        const risk: Risk = { id: 1, type: 'High', impact: 'High', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true };
        const incompleteSettings: any = { ...settings, riskScoring: undefined };
        
        // Suppress console.warn for this specific test
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        
        const score = calculateRiskScore(risk, incompleteSettings);
        expect(score).toBe(0);
        expect(consoleWarnSpy).toHaveBeenCalledWith("Risk scoring settings are not defined. Returning a score of 0.");

        consoleWarnSpy.mockRestore();
    });

    it('should handle undefined mappings gracefully', () => {
        const risk: Risk = { id: 1, type: 'High', impact: 'High', description: '', owner: '', mitigation: '', isVisibleOnDashboard: true };
        const malformedSettings = JSON.parse(JSON.stringify(settings));
        delete malformedSettings.riskScoring.mappings.type['High']; // Remove a mapping
        
        // (undefined * 1.5) + (3 * 1.0) => (0 * 1.5) + 3.0 = 3.0
        const score = calculateRiskScore(risk, malformedSettings);
        expect(score).toBe(3);
    });
});