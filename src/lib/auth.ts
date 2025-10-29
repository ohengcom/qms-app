import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT payload interface
export interface SessionPayload {
  userId: 'owner';
  iat?: number;
  exp?: number;
  remember: boolean;
}

// Session duration constants
export const SESSION_DURATION = {
  default: 7 * 24 * 60 * 60, // 7 days in seconds
  remember: 30 * 24 * 60 * 60, // 30 days in seconds
};

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 * @param payload - Token payload
 * @param expiresIn - Expiration time in seconds
 * @returns JWT token string
 */
export function generateJWT(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
  expiresIn: number
): string {
  const secret = process.env.QMS_JWT_SECRET;
  if (!secret) {
    throw new Error('QMS_JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn,
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload
 */
export function verifyJWT(token: string): SessionPayload {
  const secret = process.env.QMS_JWT_SECRET;
  if (!secret) {
    throw new Error('QMS_JWT_SECRET is not defined');
  }

  return jwt.verify(token, secret) as SessionPayload;
}

// Rate limiting store (in-memory for simplicity)
interface LoginAttempt {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

/**
 * Check if an IP is rate limited
 * @param ip - IP address
 * @returns True if rate limited
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    return false;
  }

  return attempts.count >= 5;
}

/**
 * Record a failed login attempt
 * @param ip - IP address
 */
export function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, {
      count: 1,
      resetAt: now + 15 * 60 * 1000, // 15 minutes
    });
  } else {
    attempts.count++;
  }
}

/**
 * Clear failed attempts for an IP (after successful login)
 * @param ip - IP address
 */
export function clearFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Get the client IP address from request headers
 * @param headers - Request headers
 * @returns IP address
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() || headers.get('x-real-ip') || 'unknown'
  );
}
