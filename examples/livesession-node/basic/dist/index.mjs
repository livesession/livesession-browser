var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
import livesession from "livesession";
var require_index = __commonJS({
  "index.ts"(exports) {
    var ls = new livesession(
      livesession.optionApiKey(process.env.LIVESESSION_API_KEY)
    );
    (() => __async(exports, null, function* () {
      const websites = yield ls.websites.list();
      console.log(websites);
    }))();
  }
});
export default require_index();
//# sourceMappingURL=index.mjs.map