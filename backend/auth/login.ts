import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import { verifyPassword, generateJWT } from "./utils";

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

// Logs in a user.
export const login = api<LoginParams, LoginResponse>({
  expose: true,
  method: "POST",
  path: "/auth/login",
}, async ({ email, password }) => {
  const user = await db.queryRow<{ id: number; full_name: string; email: string; role: string; password_hash: string }>`
    SELECT id, full_name, email, role, password_hash FROM users WHERE email = ${email}
  `;

  if (!user || !user.password_hash) {
    throw APIError.unauthenticated("invalid email or password");
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    throw APIError.unauthenticated("invalid email or password");
  }

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
