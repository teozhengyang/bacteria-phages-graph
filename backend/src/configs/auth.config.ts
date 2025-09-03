interface AuthConfig {
    refresh_secret: string;
    refresh_secret_expires_in: string;
    secret: string;
    secret_expires_in: string;
}

// config for jwt
const authConfig: AuthConfig = {
    // Secret key used for signing JWT refresh tokens
    refresh_secret: process.env.AUTH_REFRESH_SECRET ?? "changeInProd", 

    // Expiration time for the JWT refresh token (e.g., "24h" for 24 hours)
    refresh_secret_expires_in: process.env.AUTH_REFRESH_SECRET_EXPIRES_IN ?? "24h", 

    // Secret key used for signing JWT access tokens
    secret: process.env.AUTH_SECRET ?? "changeInProd", 

    // Expiration time for the JWT access token (e.g., "15m" for 15 minutes)
    secret_expires_in: process.env.AUTH_SECRET_EXPIRES_IN ?? "15m"
}

export default authConfig;

