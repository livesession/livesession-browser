package oauth

import "crypto/sha256"

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
)

const chunkSize = 0x8000

func buf(input string) []byte {
	return []byte(input)
}

func b64u(input []byte) string {
	return encodeBase64Url(input)
}

func decodeBase64Url(input string) ([]byte, error) {
	decoded, err := base64.URLEncoding.WithPadding(base64.NoPadding).DecodeString(input)
	if err != nil {
		return nil, errors.New("the input to be decoded is not correctly encoded")
	}
	return decoded, nil
}

func encodeBase64Url(input []byte) string {
	return base64.URLEncoding.WithPadding(base64.NoPadding).EncodeToString(input)
}

func randomBytes() (string, error) {
	v := make([]byte, 32)
	_, err := rand.Read(v)
	if err != nil {
		return "", err
	}
	return b64u(v), nil
}

func validateString(input string) bool {
	return len(input) != 0
}

func generateRandomCodeVerifier() (string, error) {
	return randomBytes()
}

func calculatePKCECodeChallenge(codeVerifier string) (string, error) {
	if !validateString(codeVerifier) {
		return "", errors.New(`"codeVerifier" must be a non-empty string`)
	}

	hash := sha256.Sum256(buf(codeVerifier))
	return b64u(hash[:]), nil
}
