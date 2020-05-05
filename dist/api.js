"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
};
exports.SDK_VERSION = "1.1.0";
exports.default = api;
