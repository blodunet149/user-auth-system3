import * as bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { secret } from "encore.dev/config";

const jwtSecret = secret("JWTSecret");

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { userId: number; email: string }): string {
  return sign(payload, jwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: number; email: string } {
  return verify(token, jwtSecret()) as { userId: number; email: string };
}
