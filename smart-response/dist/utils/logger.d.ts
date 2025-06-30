declare class Logger {
    private logLevel;
    constructor();
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    private shouldLog;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map