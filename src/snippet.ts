import { SDK_VERSION } from "./api";

const snippet = (
  wnd = window,
  doc = document,
  type = "script",
  cdn = ("https:" === window.location.protocol ? "https://" : "http://") + "cdn.livesession.io/track.js"
) => {
  return ((w, d, t, u) => {
    if (w.__ls) {
      throw new Error("LiveSession script already added");
    }
    const f: any = (w.__ls = function () {
      f.push ? f.push.apply(f, arguments) : f.store.push(arguments);
    });
    if (!w.__ls) w.__ls = f;
    f.store = [];
    f.v = SDK_VERSION;

    const ls = <HTMLScriptElement>d.createElement(t);
    ls.async = true;
    ls.src = u;
    ls.charset = "utf-8";
    ls.crossOrigin = "anonymous";
    const h = d.getElementsByTagName("head")[0];
    h.appendChild(ls);
  })(wnd, doc, type, cdn);
};

export default snippet;
