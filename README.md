[![GitHub Actions](https://github.com/livesession/livesession-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/livesession/livesession-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@livesession/browser)](https://www.npmjs.com/package/@livesession/browser)

# Official LiveSession Browser SDK

This small package let you install LiveSession script and configure it properly.

If you need you can use methods that were also provided in this SDK.

## Usage

`npm i @livesession/browser` or `yarn add @livesession/browser`

Next, you should initialize the SDK on your website like in this example:

```javascript
import ls from "@livesession/browser";

// init a script, trackID is required
ls.init("YOUR TRACKID", options, sdkOptions);
```

After LiveSession is inited, you can start recording session using method `newPageView()`

**Initialization example with enabled recording**

```javascript
ls.init("123456789", { keystrokes: true, rootHostname: ".mypage.com" });
ls.newPageView();
// or with devMode on
ls.init(
  "1234.56789",
  { rootHostname: ".mypage.com" },
  {
    devMode: true, // process.env.NODE_ENV === "development"
  }
);
ls.newPageView();
```

**Custom events**

```javascript
ls.track("User Subscribed", {
  plan: "premium",
  seats: 1,
  total: 255.50,
  isPatron: true
});
```

## React usage

```javascript
ls.init("YOUR-TRACK-ID", options, sdkOptions);
ls.newPageView();
ReactDOM.render(<App />, document.getElementById("root"));
```

## Angular usage

Implementation is created thanks to [@SkowyrnyMG](https://github.com/SkowyrnyMG)

1. Import SDK into your main app component

2. Import `OnInit` from `@angular/core`

3. Implement `OnInit` and call LiveSession init method in `ngOnInit` function, and start recording

```javascript
// app.component.ts
import ls from '@livesession/browser'

export class AppComponent implemets OnInit {
    ngOnInit(){
        ls.init("YOUR_TRACK_ID");
        ls.newPageView();
    }
}
```

For more about initializing script check out our [guide](https://developers.livesession.io/javascript-api/configuration/)

## sdkOptions

As a third argument to init method you can pass sdkOptions object, here are all available variables:

| Variable | Parameter | Default | Info                                              |
| -------- | --------- | ------- | ------------------------------------------------- |
| devMode  | bool      | false   | Log methods into console instead of calling their |
| scriptURL  | string      | https://cdn.livesession.io/track.js   | Link to LiveSession tracking code, useful if you want to use a specific version of code|

**Example**

```javascript
ls.init("exampleID", null, { devMode: true });
```

## API

If you initialized script, you can simply customize it with following functions:

| Function          | Parameter                    | Default           | Allowed                                        |
| ----------------- | ---------------------------- | ----------------- | -----------------------------------------------|
| init              | trackID, options, sdkOptions | null, null, false | string(required), object, object               |
| getSessionURL     | callback(url, isNewSession)  | null              | void(string, bool)                             |
| identify          | data                         | null              | IdentifyData                                   |
| company           | id, params                   | null, null        | string(required), object                       |
| invalidateSession | -                            | null              | -                                              |
| newPageView       | options                      | null              | object                                         |
| setOptions        | options                      | null              | object                                         |
| setCustomParams   | data                         | null              | object                                         |
| off               | -                            | null              | -                                              |
| optOut            | -                            | false             | -                                              |
| debug             | -                            | false             | -                                              |
| track             | event, properties            | null, null        | string(required), object                       |
| log               | logLevel, data               | "log", null       | string("log", "info", "warn", "error"), object |

If out want to learn more about all methods, go to our [developers page](https://developers.livesession.io/javascript-api/methods/)

## Types

### IdentifyData

`identify(data)` takes your user's identity; `company` is the same payload as the `company` call.

```typescript
import ls, { CompanyData, IdentifyData } from "@livesession/browser";

const company: CompanyData = {
  company_id: "org_1", // your own company id, verbatim, max 128 bytes
  name: "Acme",
  url: "https://acme.example",
  logo_url: "https://acme.example/logo.png",
  params: { plan: "pro" }, // up to 50 custom properties
};

ls.identify({ uid: "42", name: "Ann", email: "ann@acme.example", company });
```

### company

`company(id, params)` sets the visitor's company: `id` is your own company id (verbatim, max 128 bytes), `params` its properties — `name`, `url` and `logo_url` are the company's own fields, the rest its custom properties (up to 50). The latest company wins, for the browser and for the identified user; call it after `identify` so the user's id rides along.

```typescript
ls.company("org_1", { name: "Acme", url: "https://acme.example", plan: "pro" });
```

### logLevel supported

| Level    | Description                                                                        |
| -------- |----------------------------------------------------------------------------------- |
| "log"    |  Object will be logged as log                                                      |
| "info"   |  Object will be logged as info                                                     |
| "warn"   |  Object will be logged as warn                                                     |
| "error"  |  Object will be logged as error                                                    |



## Contributing

We're always open to work with our community. Let us know if you have ideas for new features or suggestions. Pull requests for bug fixes are also welcome!

## Changelog

This package currently support `v1.4.0` of API, you can find more informations about API changelog [here](https://developers.livesession.io/getting-started/changelog/)

## License

[MIT](https://github.com/livesession/livesession-sdk/blob/master/LICENSE)
