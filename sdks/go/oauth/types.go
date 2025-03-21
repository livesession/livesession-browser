package oauth

type TokenInfo struct {
	UserID    string
	AccountID string
	Email     string
}

type Authorize struct {
	AccessToken  string
	RefreshToken string
	ExpiresIn    int
	Scopes       []string
}
