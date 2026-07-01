/**
 * Example JWT secret shipped for local development. It is public knowledge, so a
 * production instance must never run with it. See ADR-023.
 */
export const INSECURE_JWT_SECRET = 'dev-secret-change-in-production';

/**
 * Resolves the JWT signing secret from the environment, failing fast in
 * production when it is missing or still set to the public example value.
 *
 * In development/test the example secret is tolerated with a warning so the
 * local flow is not blocked.
 */
export function resolveJwtSecret(env: NodeJS.ProcessEnv): string {
  const isProduction = env.NODE_ENV === 'production';
  const secret = env.JWT_SECRET;

  if (isProduction) {
    if (!secret || secret === INSECURE_JWT_SECRET) {
      throw new Error(
        'JWT_SECRET must be set to a strong, unique value in production. ' +
          'Refusing to start with a missing or example secret.',
      );
    }
    return secret;
  }

  if (!secret) {
    console.warn(
      '[security] JWT_SECRET is not set — using the insecure development ' +
        'fallback. Never do this in production.',
    );
    return INSECURE_JWT_SECRET;
  }

  return secret;
}
