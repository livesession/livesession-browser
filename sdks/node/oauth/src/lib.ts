// https://github.com/panva/oauth4webapi/blob/7cc06a93a828317b6b52cade81722ae63dcf9a6c/src/index.ts
const CHUNK_SIZE = 0x8000

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function buf(input: string): Uint8Array
function buf(input: Uint8Array): string
function buf(input: string | Uint8Array) {
    if (typeof input === 'string') {
        return encoder.encode(input)
    }

    return decoder.decode(input)
}

function b64u<T>(input: string | Uint8Array | ArrayBuffer) {
    if (typeof input === 'string') {
        return decodeBase64Url(input)
    }

    return encodeBase64Url(input)
}

function decodeBase64Url(input: string) {
    try {
        const binary = atob(input.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''))
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
        }
        return bytes
    } catch {
        throw new TypeError('The input to be decoded is not correctly encoded.')
    }
}

function encodeBase64Url(input: Uint8Array | ArrayBuffer) {
    if (input instanceof ArrayBuffer) {
        input = new Uint8Array(input)
    }

    const arr = []
    for (let i = 0; i < input.byteLength; i += CHUNK_SIZE) {
        // @ts-expect-error
        arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)))
    }
    return btoa(arr.join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function randomBytes() {
    const v = crypto.getRandomValues(new Uint8Array(32))

    return b64u(v)
}

function validateString(input: unknown): input is string {
    return typeof input === 'string' && input.length !== 0
}

export function generateRandomCodeVerifier() {
    return randomBytes()
}

export async function calculatePKCECodeChallenge(codeVerifier: string | Uint8Array) {
    if (!validateString(codeVerifier)) {
        throw new TypeError('"codeVerifier" must be a non-empty string')
    }

    const hash = await crypto.subtle.digest({name: 'SHA-256'}, buf(codeVerifier))

    return b64u(hash)
}
