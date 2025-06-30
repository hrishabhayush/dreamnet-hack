export interface ActivityData {
    id: string;
    timestamp: string;
    app: string;
    title: string;
    url?: string;
    duration: number;
    category?: string;
}
export interface ProcessedActivity {
    summary: string;
    productivity_score: number;
    category: string;
    recommendations: string[];
    time_spent: number;
    focus_periods: FocusPeriod[];
}
export interface FocusPeriod {
    start: string;
    end: string;
    duration: number;
    quality: 'high' | 'medium' | 'low';
}
export interface SmartResponse {
    insights: string;
    recommendations: string[];
    productivity_tips: string[];
    focus_score: number;
    summary: string;
}
export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: string;
}
export interface Config {
    port: number;
    openai: {
        apiKey: string;
        model: string;
        maxTokens: number;
    };
    logging: {
        level: string;
    };
}
//# sourceMappingURL=types.d.ts.map