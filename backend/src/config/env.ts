import 'dotenv/config';

// Helper function to clean and validate URLs
function cleanUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const cleaned = url.trim().replace(/\s+/g, '');
  // Basic URL validation
  if (cleaned === '*') return cleaned;
  try {
    new URL(cleaned);
    return cleaned;
  } catch {
    console.warn(`Invalid URL format: ${cleaned}`);
    return undefined;
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  cookieName: process.env.COOKIE_NAME ?? 'access_token',
  cookieSecure: process.env.NODE_ENV === 'production' ? true : (process.env.COOKIE_SECURE ?? 'false') === 'true',
  cookieSameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') ?? (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
  corsOrigin: cleanUrl(process.env.CORS_ORIGIN) ?? (process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000'),
};


