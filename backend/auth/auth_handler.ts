import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { verifyToken } from "./utils";
import { authDB } from "./db";
import type { AuthData } from "./types";

interface AuthParams {
  authorization?: Header<"Authorization">;
}

const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    const token = data.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("Missing authorization token");
    }

    try {
      const decoded = verifyToken(token);
      
      // Verify user still exists
      const user = await authDB.queryRow<{
        id: number;
        email: string;
        first_name: string;
        last_name: string;
      }>`
        SELECT id, email, first_name, last_name
        FROM users 
        WHERE id = ${decoded.userId}
      `;

      if (!user) {
        throw APIError.unauthenticated("User not found");
      }

      return {
        userID: user.id.toString(),
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      };
    } catch (err) {
      throw APIError.unauthenticated("Invalid token", err);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
