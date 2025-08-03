import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import { hashPassword, generateJWT } from "./utils";

export interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

// Registers a new user.
export const register = api<RegisterParams, RegisterResponse>({
  expose: true,
  method: "POST",
  path: "/auth/register",
}, async ({ fullName, email, password }) => {
  // Check if user already exists
  const existingUser = await db.queryRow`
    SELECT id FROM users WHERE email = ${email}
  `;
  if (existingUser) {
    throw APIError.alreadyExists("user with this email already exists");
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await db.queryRow<{ id: number; full_name: string; email: string; role: string }>`
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (${fullName}, ${email}, ${passwordHash}, 'parent')
    RETURNING id, full_name, email, role
  `;

  if (!user) {
    throw APIError.internal("could not create user");
  }

  // Generate JWT
  const token = generateJWT(user.id, user.email, user.role);

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    },
  };
});
