import type { Risk, AppSettings } from '../types';

/**
 * Calculates a numerical score for a given risk based on configurable settings.
 * The score is a weighted sum of the risk's type and impact.
 * @param risk The risk object to score.
 * @param settings The application settings containing scoring weights and mappings.
 * @returns A rounded numerical score.
 */
export const calculateRiskScore = (risk: Risk, settings: AppSettings): number => {
    // Failsafe for incomplete or malformed settings
    if (!settings.riskScoring?.weights || !settings.riskScoring?.mappings) {
        console.warn("Risk scoring settings are not defined. Returning a score of 0.");
        return 0;
    }
    
    const { weights, mappings } = settings.riskScoring;
    
    const typeValue = mappings.type[risk.type] || 0;
    const impactValue = mappings.impact[risk.impact] || 0;

    const score = (typeValue * weights.type) + (impactValue * weights.impact);
    
    return Math.round(score);
};
