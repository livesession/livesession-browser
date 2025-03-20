"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDK_VERSION = void 0;
const apiCall = (name, ...args) => {
    return window.__ls(name, ...args);
};
const api = {
    init: (trackID, options) => apiCall("init", trackID, options),
    getSessionURL: (callback) => apiCall("getSessionURL", callback),
    identify: (data) => apiCall("identify", data),
    invalidateSession: () => apiCall("invalidateSession"),
    newPageView: (options) => apiCall("newPageView", options),
    setOptions: (options) => apiCall("setOptions", options),
    setCustomParams: (data) => apiCall("setCustomParams", data),
    off: () => apiCall("off"),
    optOut: () => apiCall("optOut", true),
    debug: () => apiCall("debug", true),
    track: (eventName, properties) => apiCall("track", eventName, properties),
    log: (logLevel, ...rest) => apiCall("log", logLevel, rest),
    setBundlerVersion: (version) => apiCall("setBundlerVersion", version),
};
exports.SDK_VERSION = "1.1.0";
exports.default = api;
