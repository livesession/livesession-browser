export declare enum ConsoleLogLevel {
    log = "log",
    info = "info",
    warn = "warn",
    error = "error"
}
/** Custom properties: up to 50, each a string, a number or a boolean. */
export type Params = Record<string, string | number | boolean>;
/**
 * A company, as `company(id, params)` and `identify({ company })` take it.
 * `company_id` is your own company id, verbatim, max 128 bytes (an empty or
 * longer id is refused by the script, never cut). `name`, `url` and
 * `logo_url` are the company's own fields; `params` its custom properties.
 * Companies are scoped to your account; the latest company set wins, for the
 * browser and for the identified user.
 */
export interface CompanyData {
    company_id: string;
    name?: string;
    url?: string;
    logo_url?: string;
    params?: Params;
}
/**
 * The visitor's identity, as `identify(data)` takes it. `uid` is your own
 * immutable user id (a string, or a number for numeric ids), max 128 bytes.
 */
export interface IdentifyData {
    uid?: string | number;
    name?: string;
    email?: string;
    params?: Params;
    company?: CompanyData;
}
