import { ActivityData } from '../types';
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare function validateActivityData(data: any[]): ActivityData[];
export declare function validateEnvironment(): void;
//# sourceMappingURL=validation.d.ts.map