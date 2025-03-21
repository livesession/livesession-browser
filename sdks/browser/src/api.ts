import { ConsoleLogLevel } from "./api.types";

const apiCall = (name: string, ...args: any) => {
  return window.__ls(name, ...args);
};

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

const api: apiConfig = {
  init: (trackID: string, options?: object | null) => apiCall("init", trackID, options),
  getSessionURL: (callback?: void) => apiCall("getSessionURL", callback),
  identify: (data?: object) => apiCall("identify", data),
  invalidateSession: () => apiCall("invalidateSession"),
  newPageView: (options?: object) => apiCall("newPageView", options),
  setOptions: (options?: object) => apiCall("setOptions", options),
  setCustomParams: (data?: object) => apiCall("setCustomParams", data),
  off: () => apiCall("off"),
  optOut: () => apiCall("optOut", true),
  debug: () => apiCall("debug", true),
  track: (eventName: string, properties?: object) => apiCall("track", eventName, properties),
  log: (logLevel: ConsoleLogLevel, ...rest: any) => apiCall("log", logLevel, rest),
};

export const SDK_VERSION = "1.1.0";
export default api;
