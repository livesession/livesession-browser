import {calculatePKCECodeChallenge, generateRandomCodeVerifier} from "./lib";
import {OAuth} from "./oauth";

const codeChallengeMethod = 'S256';

export async function buildAuthorizeUrl(
    clientId: string,
    callbackUrl: string,
    {
        pkce,
        state,
    }: {
        pkce?: boolean,
        state?: string,
    }
) {
    const livesessionAuthorizeURl = new URL(OAuth.authorizeURL);
    const params = new URLSearchParams();

    params.append("client_id", clientId);
    params.append('redirect_uri', callbackUrl);
    params.append('response_type', 'code');

    if (pkce) {
        const codeVerifier = generateRandomCodeVerifier();
        const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
        if (typeof codeChallenge === 'string') {
            params.append('code_challenge_method', codeChallengeMethod);
            params.append('code_challenge', codeChallenge);
        } else {
            console.error('codeChallenge must be a string');
        }
    }

    if (state) {
        params.append('state', state);
    }

    livesessionAuthorizeURl.search = params.toString();
    return livesessionAuthorizeURl.toString();
}