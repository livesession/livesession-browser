package oauth

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
)

const (
	codeChallengeMethod = "S256"
)

type OAuth interface {
	BuildAuthorizeURL(opts *BeginOptions) (string, error)
	Authorize(w http.ResponseWriter, req *http.Request) error
	Callback(req *http.Request) (*Authorize, error)
	Info(token string) (*TokenInfo, error)
	SetURL(url string)
}

type Options struct {
	PKCE bool
}

type BeginOptions struct {
	State string
}

type client struct {
	ClientID     string
	ClientSecret string
	CallbackURL  string
}

type oAuth struct {
	client  client
	Options Options

	baseURL string
}

func NewOAuth(clientID, clientSecret, callbackURL string) OAuth {
	return &oAuth{
		client: client{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			CallbackURL:  callbackURL,
		},
		baseURL: "https://apis.livesession.io/accounts",
	}
}

func (oauth *oAuth) SetURL(url string) {
	oauth.baseURL = url
}

func (oauth *oAuth) BuildAuthorizeURL(opts *BeginOptions) (string, error) {
	livesessionAuthorizeURL, err := url.Parse(oauth.authorizeURL())
	if err != nil {
		return "", err
	}

	params := url.Values{}
	params.Add("client_id", oauth.client.ClientID)
	params.Add("redirect_uri", oauth.client.CallbackURL)
	params.Add("response_type", "code")

	if oauth.Options.PKCE {
		codeVerifier, err := generateRandomCodeVerifier()
		if err != nil {
			return "", err
		}

		codeChallenge, err := calculatePKCECodeChallenge(codeVerifier)
		if err != nil {
			return "", err
		}
		params.Add("code_challenge_method", codeChallengeMethod)
		params.Add("code_challenge", codeChallenge)
	}

	if opts.State != "" {
		params.Add("state", opts.State)
	}

	livesessionAuthorizeURL.RawQuery = params.Encode()
	return livesessionAuthorizeURL.String(), nil
}

func (oauth *oAuth) Authorize(w http.ResponseWriter, req *http.Request) error {
	reqParams := oauth.extractSearchParams(req)
	url, err := oauth.BuildAuthorizeURL(&BeginOptions{
		State: reqParams.Get("state"),
	})
	if err != nil {
		return err
	}

	http.Redirect(w, req, url, http.StatusFound)
	return nil
}

func (oauth *oAuth) Callback(req *http.Request) (*Authorize, error) {
	body := map[string]string{
		"client_id":     oauth.client.ClientID,
		"client_secret": oauth.client.ClientSecret,
		"redirect_uri":  oauth.client.CallbackURL,
		"grant_type":    "authorization_code",
	}

	reqParams := oauth.extractSearchParams(req)
	code := reqParams.Get("code")
	if code != "" {
		body["code"] = code
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(oauth.tokenURL(), "application/json", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, errors.New("error in response")
	}

	var data struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		Scope        string `json:"scope"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &Authorize{
		AccessToken:  data.AccessToken,
		RefreshToken: data.RefreshToken,
		ExpiresIn:    data.ExpiresIn,
		Scopes:       strings.Split(data.Scope, ","),
	}, nil
}

func (oauth *oAuth) Info(token string) (*TokenInfo, error) {
	req, err := http.NewRequest("GET", oauth.tokenInfoURL(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, errors.New("error in response")
	}

	var data struct {
		UserData struct {
			UserID    string `json:"user_id"`
			AccountID string `json:"account_id"`
			Login     string `json:"login"`
		} `json:"user_data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &TokenInfo{
		UserID:    data.UserData.UserID,
		AccountID: data.UserData.AccountID,
		Email:     data.UserData.Login,
	}, nil
}

func (oauth *oAuth) Revoke(token string) error {
	req, err := http.NewRequest("POST", oauth.tokenRevokeURL()+"?token="+token, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return errors.New("error in response")
	}

	var data struct {
		Error string `json:"error"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return err
	}

	if data.Error != "" {
		return errors.New(data.Error)
	}

	return nil
}

func (oauth *oAuth) Refresh(refreshToken string) (*Authorize, error) {
	body := map[string]string{
		"client_id":     oauth.client.ClientID,
		"client_secret": oauth.client.ClientSecret,
		"refresh_token": refreshToken,
		"grant_type":    "refresh_token",
	}

	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	resp, err := http.Post(oauth.tokenURL(), "application/json", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, errors.New("error in response")
	}

	var data struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
		Scope        string `json:"scope"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, err
	}

	return &Authorize{
		AccessToken:  data.AccessToken,
		RefreshToken: data.RefreshToken,
		ExpiresIn:    data.ExpiresIn,
		Scopes:       strings.Split(data.Scope, ","),
	}, nil
}

func (oauth *oAuth) extractSearchParams(req *http.Request) url.Values {
	return req.URL.Query()
}

func (oauth *oAuth) authorizeURL() string {
	return oauth.baseURL + "/v1/oauth2/authorize"
}

func (oauth *oAuth) tokenURL() string {
	return oauth.baseURL + "/v1/oauth2/access_token"
}

func (oauth *oAuth) tokenInfoURL() string {
	return oauth.baseURL + "/v1/oauth2/info"
}

func (oauth *oAuth) tokenRevokeURL() string {
	return oauth.baseURL + "/v1/oauth2/revoke"
}
