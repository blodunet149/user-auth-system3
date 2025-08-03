import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { User, Address } from "./types";

export interface ProfileResponse {
  user: User;
  addresses: Address[];
}

// Retrieves the current user's profile and addresses.
export const getProfile = api<void, ProfileResponse>(
  { auth: true, expose: true, method: "GET", path: "/auth/profile" },
  async () => {
    try {
      const auth = getAuthData()!;
      const userId = parseInt(auth.userID);

      // Get user details
      const user = await authDB.queryRow<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone: string | null;
        created_at: Date;
        updated_at: Date;
      }>`
        SELECT id, email, first_name, last_name, phone, created_at, updated_at
        FROM users 
        WHERE id = ${userId}
      `;

      if (!user) {
        throw APIError.notFound("User not found");
      }

      // Get user addresses
      const addresses = await authDB.queryAll<{
        id: number;
        user_id: number;
        type: 'billing' | 'shipping';
        street_address: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        is_default: boolean;
        created_at: Date;
      }>`
        SELECT id, user_id, type, street_address, city, state, postal_code, country, is_default, created_at
        FROM addresses 
        WHERE user_id = ${userId}
        ORDER BY is_default DESC, created_at DESC
      `;

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
        addresses: addresses.map(addr => ({
          id: addr.id,
          userId: addr.user_id,
          type: addr.type,
          streetAddress: addr.street_address,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country,
          isDefault: addr.is_default,
          createdAt: addr.created_at,
        })),
      };
    } catch (error) {
      console.error("Profile fetch error:", error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to fetch profile", error);
    }
  }
);
