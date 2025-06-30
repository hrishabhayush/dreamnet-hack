import { ActivityData, ProcessedActivity } from '../types';
export declare class ActivityProcessor {
    process(activityData: ActivityData[]): Promise<ProcessedActivity>;
    private generateSummary;
    private calculateProductivityScore;
    private categorizeActivities;
    private generateRecommendations;
    private calculateTotalTime;
    private identifyFocusPeriods;
    private isProductiveActivity;
    private getAppUsageStats;
}
//# sourceMappingURL=activityProcessor.d.ts.map