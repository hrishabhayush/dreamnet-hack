"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityProcessor = void 0;
const logger_1 = require("../utils/logger");
class ActivityProcessor {
    async process(activityData) {
        try {
            logger_1.logger.info(`Processing ${activityData.length} activity records`);
            const summary = this.generateSummary(activityData);
            const productivityScore = this.calculateProductivityScore(activityData);
            const category = this.categorizeActivities(activityData);
            const recommendations = this.generateRecommendations(activityData);
            const timeSpent = this.calculateTotalTime(activityData);
            const focusPeriods = this.identifyFocusPeriods(activityData);
            return {
                summary,
                productivity_score: productivityScore,
                category,
                recommendations,
                time_spent: timeSpent,
                focus_periods: focusPeriods,
            };
        }
        catch (error) {
            logger_1.logger.error('Error processing activity data:', error);
            throw error;
        }
    }
    generateSummary(activityData) {
        const appCounts = this.getAppUsageStats(activityData);
        const topApps = Object.entries(appCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([app]) => app);
        return `Worked with ${activityData.length} activities, primarily using ${topApps.join(', ')}`;
    }
    calculateProductivityScore(activityData) {
        const productiveApps = ['vscode', 'terminal', 'firefox', 'chrome', 'notion', 'obsidian'];
        const distractiveApps = ['youtube', 'twitter', 'instagram', 'tiktok', 'reddit'];
        let productiveTime = 0;
        let distractiveTime = 0;
        const totalTime = this.calculateTotalTime(activityData);
        activityData.forEach(activity => {
            const appName = activity.app.toLowerCase();
            if (productiveApps.some(app => appName.includes(app))) {
                productiveTime += activity.duration;
            }
            else if (distractiveApps.some(app => appName.includes(app))) {
                distractiveTime += activity.duration;
            }
        });
        if (totalTime === 0)
            return 0;
        return Math.round((productiveTime / totalTime) * 100);
    }
    categorizeActivities(activityData) {
        const categories = {
            development: ['vscode', 'terminal', 'git', 'github'],
            communication: ['slack', 'discord', 'zoom', 'teams'],
            research: ['browser', 'firefox', 'chrome', 'safari'],
            documentation: ['notion', 'obsidian', 'docs', 'confluence'],
        };
        const categoryCounts = {};
        activityData.forEach(activity => {
            const appName = activity.app.toLowerCase();
            for (const [category, apps] of Object.entries(categories)) {
                if (apps.some(app => appName.includes(app))) {
                    categoryCounts[category] = (categoryCounts[category] || 0) + activity.duration;
                    break;
                }
            }
        });
        const topCategory = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)[0];
        return topCategory ? topCategory[0] : 'mixed';
    }
    generateRecommendations(activityData) {
        const recommendations = [];
        const totalTime = this.calculateTotalTime(activityData);
        const productivityScore = this.calculateProductivityScore(activityData);
        if (productivityScore < 60) {
            recommendations.push('Consider reducing time on distractive applications');
        }
        if (totalTime < 240) { // Less than 4 hours
            recommendations.push('Consider longer focused work sessions');
        }
        const focusPeriods = this.identifyFocusPeriods(activityData);
        if (focusPeriods.length < 2) {
            recommendations.push('Try to have more distinct focus periods throughout the day');
        }
        return recommendations;
    }
    calculateTotalTime(activityData) {
        return activityData.reduce((total, activity) => total + activity.duration, 0);
    }
    identifyFocusPeriods(activityData) {
        // Group activities by time windows and identify focused work periods
        const sortedData = [...activityData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const focusPeriods = [];
        let currentPeriod = null;
        for (const activity of sortedData) {
            const isProductive = this.isProductiveActivity(activity);
            if (isProductive) {
                if (!currentPeriod) {
                    currentPeriod = { start: activity.timestamp, activities: [activity] };
                }
                else {
                    currentPeriod.activities.push(activity);
                }
            }
            else if (currentPeriod && currentPeriod.activities.length >= 3) {
                // End current focus period if we have enough activities
                const duration = currentPeriod.activities.reduce((sum, a) => sum + a.duration, 0);
                focusPeriods.push({
                    start: currentPeriod.start,
                    end: currentPeriod.activities[currentPeriod.activities.length - 1].timestamp,
                    duration,
                    quality: duration > 60 ? 'high' : duration > 30 ? 'medium' : 'low'
                });
                currentPeriod = null;
            }
        }
        return focusPeriods;
    }
    isProductiveActivity(activity) {
        const productiveApps = ['vscode', 'terminal', 'notion', 'obsidian', 'figma'];
        return productiveApps.some(app => activity.app.toLowerCase().includes(app));
    }
    getAppUsageStats(activityData) {
        const stats = {};
        activityData.forEach(activity => {
            stats[activity.app] = (stats[activity.app] || 0) + activity.duration;
        });
        return stats;
    }
}
exports.ActivityProcessor = ActivityProcessor;
//# sourceMappingURL=activityProcessor.js.map