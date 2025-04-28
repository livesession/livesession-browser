"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const snippet_1 = require("./snippet");
const api_1 = require("./api");
const sdkOptionsDefaults = {
    devMode: false,
    scriptURL: snippet_1.defaultScriptURL,
};
let opts = Object.assign({}, sdkOptionsDefaults);
const isLoaded = () => window.__ls;
const getApiMethod = (name) => {
    if (!isLoaded()) {
        throw new Error("LiveSession is not loaded. Call init() before calling other API functions");
    }
    const objectAPI = api_1.default;
    if (!objectAPI.hasOwnProperty(name)) {
        throw new Error(`method "${name}" doesn't exist`);
    }
    if (opts.devMode) {
        const msg = `Skipping method: ${name}, devMode enabled`;
        console.warn(msg);
        return () => msg;
    }
    return objectAPI[name];
};
const safeCall = (name) => {
    return (args) => {
        const apiMethod = getApiMethod(name);
        if (apiMethod) {
            return apiMethod(args);
        }
    };
};
const safeCallManyArgs = (name) => {
    return (...args) => {
        const apiMethod = getApiMethod(name);
        if (apiMethod) {
            return apiMethod(...args);
        }
    };
};
const _init = (trackID, options, sdkOptions = sdkOptionsDefaults) => {
    opts = Object.assign(Object.assign({}, sdkOptionsDefaults), sdkOptions);
    if (isLoaded()) {
        console.warn("LiveSession already inited (skipping init() call)");
        return;
    }
    if (!trackID) {
        throw new Error(`trackID is required`);
    }
    (0, snippet_1.default)(window, document, "script", sdkOptions.scriptURL);
    return api_1.default.init(trackID, options);
};
exports.default = {
    init: _init,
    getSessionURL: safeCall("getSessionURL"),
    identify: safeCall("identify"),
    invalidateSession: safeCall("invalidateSession"),
    newPageView: safeCall("newPageView"),
    setOptions: safeCall("setOptions"),
    setCustomParams: safeCall("setCustomParams"),
    off: safeCall("off"),
    optOut: safeCall("optOut"),
    debug: safeCall("debug"),
    track: function (eventName, properties) {
        safeCallManyArgs("track")(eventName, properties);
    },
    log: function (logLevel, ...args) {
        safeCallManyArgs("log")(logLevel, ...args);
    },
};
