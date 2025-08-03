import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { secret } from "encore.dev/config";

const jwtSecret = secret("JWTSecret");

// Hashes a password using bcrypt.
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verifies a password against a hash.
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Generates a JWT for a user.
export function generateJWT(userId: number, email: string, role: string): string {
  const payload = { userId, email, role };
  return jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
}

// Verifies a JWT and returns its payload.
export function verifyJWT(token: string): JWTPayload {
  return jwt.verify(token, jwtSecret()) as JWTPayload;
}
