import { ConsoleLogLevel } from "./api.types";
export interface apiConfig {
    init: (trackID: string, options?: object | null) => void;
    getSessionURL: (callback?: void) => void;
    identify: (data?: object) => void;
    invalidateSession: () => void;
    newPageView: (options?: object) => void;
    setOptions: (options?: object) => void;
    setCustomParams: (data?: object) => void;
    off: () => void;
    optOut: () => void;
    debug: () => void;
    track: (eventName: string, properties?: object) => void;
    log: (logLevel: ConsoleLogLevel, ...rest: any) => void;
}
declare const api: apiConfig;
export declare const SDK_VERSION = "1.1.0";
export default api;
