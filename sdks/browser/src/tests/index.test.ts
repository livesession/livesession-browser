import ls from "../index";

// all tests are running in production mode

const methods: string[] = [
  "getSessionURL",
  "identify",
  "invalidateSession",
  "newPageView",
  "setOptions",
  "setCustomParams",
  "off",
  "optOut",
  "debug",
];

beforeEach(() => {
  if (window.__ls) {
    delete window.__ls;
  }
});

describe("calling functions", () => {
  test("Call any other function before init", () => {
    expect(() => {
      ls.setOptions({ rootHostname: "test" });
    }).toThrow();
  });
});

describe("Adding script", () => {
  const warning = "LiveSession already inited (skipping init() call)";

  const originalWarn = console.warn;
  afterEach(() => (console.warn = originalWarn));

  describe("Check adding script and console warn", () => {
    let consoleOutput: string[] = [];
    const mockedWarn = (output: string) => consoleOutput.push(output);
    beforeEach(() => (console.warn = mockedWarn));

    it("should call init method", () => {
      const initScript = jest.fn((trackID: string, options?: object) => ls.init(trackID));
      initScript("test");
      expect(initScript).toBeCalledTimes(1);
      expect(consoleOutput).toEqual([]);
    });
    it("Render script more than once", () => {
      ls.init("test1");
      ls.init("test2");
      expect(consoleOutput).toEqual([warning]);
    });
  });
});

describe("devMode", () => {
  it("should log called method in console", () => {
    ls.init("TRACK_ID", null, { devMode: true, scriptURL: "" });
    // @ts-ignore: Unreachable code error
    const returnValues = methods.map((method) => ls[method]());
    expect(returnValues.map((val) => val)).toEqual(
      methods.map((method) => `Skipping method: ${method}, devMode enabled`)
    );
  });
});
