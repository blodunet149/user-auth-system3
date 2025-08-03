import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { verifyPassword, generateToken } from "./utils";
import type { User } from "./types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Authenticates a user and returns a JWT token.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    try {
      // Validate input
      if (!req.email || !req.password) {
        throw APIError.invalidArgument("Email and password are required");
      }

      // Find user by email
      const user = await authDB.queryRow<{
        id: number;
        email: string;
        password_hash: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        created_at: Date;
        updated_at: Date;
      }>`
        SELECT id, email, password_hash, first_name, last_name, phone, created_at, updated_at
        FROM users 
        WHERE email = ${req.email}
      `;

      if (!user) {
        throw APIError.unauthenticated("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await verifyPassword(req.password, user.password_hash);
      if (!isValidPassword) {
        throw APIError.unauthenticated("Invalid email or password");
      }

      // Generate JWT token
      const token = generateToken({ userId: user.id, email: user.email });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone || undefined,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        token,
      };
    } catch (error) {
      // Log the error for debugging
      console.error("Login error:", error);
      
      // Re-throw APIErrors as-is
      if (error instanceof APIError) {
        throw error;
      }
      
      // Wrap other errors
      throw APIError.internal("Login failed", error);
    }
  }
);
