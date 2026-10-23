import ls from "../index";

// all tests are running in production mode

const methods: string[] = [
  "getSessionURL",
  "identify",
  "company",
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

describe("company", () => {
  // The snippet's __ls queues every call until the script loads: the SDK
  // hands `company` (and identify's `company`) over as `__ls("company", id, params)`.
  const queued = () => window.__ls.store.map((args: IArguments) => Array.from(args));

  it("passes the id and the params through as __ls('company', id, params)", () => {
    ls.init("TRACK_ID", null, { devMode: false, scriptURL: "" });
    ls.company("org_1", { name: "Acme", url: "https://acme.example", plan: "pro" });
    ls.company("org_2");
    expect(queued()).toEqual([
      ["init", "TRACK_ID", null],
      ["company", "org_1", { name: "Acme", url: "https://acme.example", plan: "pro" }],
      ["company", "org_2", undefined],
    ]);
  });

  it("identify takes the company as the same payload", () => {
    ls.init("TRACK_ID", null, { devMode: false, scriptURL: "" });
    const company = { company_id: "org_1", name: "Acme", logo_url: "https://acme.example/logo.png", params: { plan: "pro" } };
    ls.identify({ uid: "42", name: "Ann", company });
    expect(queued()).toEqual([
      ["init", "TRACK_ID", null],
      ["identify", { uid: "42", name: "Ann", company }],
    ]);
  });

  it("throws before init like every other method", () => {
    expect(() => ls.company("org_1")).toThrow();
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
