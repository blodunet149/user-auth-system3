import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { User } from "./types";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Updates the current user's profile information.
export const updateProfile = api<UpdateProfileRequest, User>(
  { auth: true, expose: true, method: "PUT", path: "/auth/profile" },
  async (req) => {
    try {
      const auth = getAuthData()!;
      const userId = parseInt(auth.userID);

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (req.firstName !== undefined) {
        updates.push(`first_name = $${paramIndex++}`);
        values.push(req.firstName);
      }
      if (req.lastName !== undefined) {
        updates.push(`last_name = $${paramIndex++}`);
        values.push(req.lastName);
      }
      if (req.phone !== undefined) {
        updates.push(`phone = $${paramIndex++}`);
        values.push(req.phone || null);
      }

      if (updates.length === 0) {
        throw APIError.invalidArgument("No fields to update");
      }

      updates.push(`updated_at = NOW()`);
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING id, email, first_name, last_name, phone, created_at, updated_at
      `;

      const user = await authDB.rawQueryRow<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        created_at: Date;
        updated_at: Date;
      }>(query, ...values);

      if (!user) {
        throw APIError.notFound("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      };
    } catch (error) {
      console.error("Profile update error:", error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to update profile", error);
    }
  }
);
