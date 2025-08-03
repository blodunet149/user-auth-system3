import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { hashPassword, generateToken } from "./utils";
import type { User } from "./types";

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.email)) {
      throw APIError.invalidArgument("Invalid email format");
    }

    // Validate password strength
    if (req.password.length < 8) {
      throw APIError.invalidArgument("Password must be at least 8 characters long");
    }

    // Check if user already exists
    const existingUser = await authDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;
    
    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(req.password);

    // Create user
    const user = await authDB.queryRow<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO users (email, password_hash, first_name, last_name, phone)
      VALUES (${req.email}, ${passwordHash}, ${req.firstName}, ${req.lastName}, ${req.phone || null})
      RETURNING id, email, first_name, last_name, phone, created_at, updated_at
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
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
  }
);
