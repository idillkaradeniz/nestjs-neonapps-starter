// Shape returned by register/login/refresh — the only thing a client
// needs after authenticating.
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
