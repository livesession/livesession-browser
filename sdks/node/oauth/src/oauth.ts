import {calculatePKCECodeChallenge, generateRandomCodeVerifier} from "./lib";
import {buildAuthorizeUrl} from "./authorizeUtils";

export interface Options {
    pkce?: boolean;
    callbackUrl: string;
}

export interface Client {
    clientId: string;
    clientSecret: string;
}

interface BeginOptions {
    state: string;
    autoapprove?: boolean;
    logout?: boolean;
}

const codeChallengeMethod = 'S256';

function extractSearchParams(url: string): URLSearchParams {
    return new URL(url).searchParams;
}

export class Authorize {
    public scopes: string[] = [];

    constructor(
        public accessToken: string,
        public refreshToken: string,
        public expiresIn: number,
        scope: string,
    ) {
        this.scopes = scope.split(",");
    }
}

export class TokenInfo {
    constructor(
        public userId: string,
        public accountId: string,
        public email: string,
    ) {
    }
}

export class OAuth {
    private static accountsAPIUrl = "https://apis.livesession.io/accounts";

    constructor(private client: Client, private options: Options) {
    }

    public static get authorizeURL() {
        return `${OAuth.accountsAPIUrl}/v1/oauth2/authorize`
    }

    private get tokenURL() {
        return `${OAuth.accountsAPIUrl}/v1/oauth2/access_token`
    };

    private get tokenInfoUrl() {
        return `${OAuth.accountsAPIUrl}/v1/oauth2/info`
    }

    private get tokenRevokeUrl() {
        return `${OAuth.accountsAPIUrl}/v1/oauth2/revoke`;
    }

    public static setURL(url: string) {
        OAuth.accountsAPIUrl = url;
    }

    public async buildAuthorizeUrl(opts?: BeginOptions) {
        // TODO: we removed 'logout' and 'autoapprove' from the options - check in Shopify

        return buildAuthorizeUrl(this.client.clientId, this.options.callbackUrl, {
            pkce: this.options.pkce,
            state: opts?.state,
        })
    }

    public async authorize(req: Request) {
        const reqParams = extractSearchParams(req.url);
        const url = await this.buildAuthorizeUrl({
            state: reqParams.get("state") || "",
        });

        return Response.redirect(url);
    }

    public async callback(req: Request) {
        const body = {
            client_id: this.client.clientId,
            client_secret: this.client.clientSecret,
            redirect_uri: this.options.callbackUrl,
            grant_type: "authorization_code",
            code: ""
        };

        const reqParams = extractSearchParams(req.url);
        const code = reqParams.get("code");
        if (code) {
            body.code = code;
        }

        const resp = await fetch(this.tokenURL, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (resp.status >= 400) {
            throw await resp.json();
        }

        const data = await resp.json();

        return new Authorize(
            data.access_token,
            data.refresh_token,
            data.expires_in,
            data.scope,
        );
    }

    public async info(token: string) {
        const resp = await fetch(this.tokenInfoUrl, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (resp.status >= 400) {
            throw await resp.json();
        }

        const data = await resp.json();
        return new TokenInfo(
            data.user_data?.user_id,
            data.user_data?.account_id,
            data.user_data?.login,
        );
    }

    public async revoke(token: string) {
        const resp = await fetch(`${this.tokenRevokeUrl}?token=${token}`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (resp.status >= 400) {
            throw await resp.json();
        }

        const data = await resp.json();
        if (data?.error) {
            throw data;
        }
    }

    public async refresh(refreshToken: string) {
        const resp = await fetch(this.tokenURL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "client_id": this.client.clientId,
                "client_secret": this.client.clientSecret,
                "refresh_token": refreshToken,
                "grant_type": "refresh_token"
            })
        });

        if (resp.status >= 400) {
            throw await resp.json();
        }

        const data = await resp.json();
        if (data?.error) {
            throw data;
        }

        return new Authorize(
            data.access_token,
            data.refresh_token,
            data.expires_in,
            data.scope,
        );
    }
}