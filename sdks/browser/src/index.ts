import snippet, { defaultScriptURL } from "./snippet";
import api from "./api";
import { apiConfig } from "./api";

declare global {
  interface Window {
    __ls: any;
  }
}

interface safeCallArgs {
  getSessionURL: void;
  identify: object;
  invalidateSession: null;
  newPageView: object;
  setOptions: object;
  setCustomParams: object;
  off: null;
  optOut: null;
  debug: null;
  log: null;
}

interface safeCallArgsManyArgs {
  track: string;
  log: string;
}

type Names = Omit<Omit<apiConfig, "init">, "track">;

const sdkOptionsDefaults = {
  devMode: false,
  scriptURL: defaultScriptURL,
};

let opts = {
  ...sdkOptionsDefaults,
};

const isLoaded = () => window.__ls;

const getApiMethod = (name: string) => {
  if (!isLoaded()) {
    throw new Error("LiveSession is not loaded. Call init() before calling other API functions");
  }

  const objectAPI = <Object>api;

  if (!objectAPI.hasOwnProperty(name)) {
    throw new Error(`method "${name}" doesn't exist`);
  }

  if (opts.devMode) {
    const msg = `Skipping method: ${name}, devMode enabled`;
    console.warn(msg);
    return () => msg;
  }

  return (objectAPI as any)[name];
};

const safeCall = <T extends keyof Names>(name: T) => {
  return (args?: safeCallArgs[T]) => {
    const apiMethod = getApiMethod(name);

    if (apiMethod) {
      return apiMethod(args);
    }
  };
};

const safeCallManyArgs = <T extends keyof safeCallArgsManyArgs>(name: T) => {
  return (...args: any[]) => {
    const apiMethod = getApiMethod(name);

    if (apiMethod) {
      return apiMethod(...args);
    }
  };
};

const _init = (trackID: string, options?: object | null, sdkOptions = sdkOptionsDefaults) => {
  opts = {
    ...sdkOptionsDefaults,
    ...sdkOptions,
  };
  if (isLoaded()) {
    console.warn("LiveSession already inited (skipping init() call)");
    return;
  }
  if (!trackID) {
    throw new Error(`trackID is required`);
  }
  snippet(window, document, "script", sdkOptions.scriptURL);

  return api.init(trackID, options);
};

export default {
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
  track: function (eventName: string, properties?: object) {
    safeCallManyArgs("track")(eventName, properties);
  },
  log: function (logLevel: string, ...args: any) {
    safeCallManyArgs("log")(logLevel, ...args);
  },
};
