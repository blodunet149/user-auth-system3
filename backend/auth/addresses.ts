import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { authDB } from "./db";
import type { Address } from "./types";

export interface CreateAddressRequest {
  type: 'billing' | 'shipping';
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

// Creates a new address for the current user.
export const createAddress = api<CreateAddressRequest, Address>(
  { auth: true, expose: true, method: "POST", path: "/auth/addresses" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = parseInt(auth.userID);

    // If this is set as default, unset other defaults of the same type
    if (req.isDefault) {
      await authDB.exec`
        UPDATE addresses 
        SET is_default = FALSE 
        WHERE user_id = ${userId} AND type = ${req.type}
      `;
    }

    const address = await authDB.queryRow<{
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
      INSERT INTO addresses (user_id, type, street_address, city, state, postal_code, country, is_default)
      VALUES (${userId}, ${req.type}, ${req.streetAddress}, ${req.city}, ${req.state}, ${req.postalCode}, ${req.country || 'US'}, ${req.isDefault || false})
      RETURNING id, user_id, type, street_address, city, state, postal_code, country, is_default, created_at
    `;

    if (!address) {
      throw APIError.internal("Failed to create address");
    }

    return {
      id: address.id,
      userId: address.user_id,
      type: address.type,
      streetAddress: address.street_address,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      isDefault: address.is_default,
      createdAt: address.created_at,
    };
  }
);

// Updates an existing address for the current user.
export const updateAddress = api<{ id: number } & UpdateAddressRequest, Address>(
  { auth: true, expose: true, method: "PUT", path: "/auth/addresses/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = parseInt(auth.userID);
    const addressId = req.id;

    // Verify address belongs to user
    const existingAddress = await authDB.queryRow<{ type: string }>`
      SELECT type FROM addresses WHERE id = ${addressId} AND user_id = ${userId}
    `;

    if (!existingAddress) {
      throw APIError.notFound("Address not found");
    }

    // If this is set as default, unset other defaults of the same type
    if (req.isDefault) {
      await authDB.exec`
        UPDATE addresses 
        SET is_default = FALSE 
        WHERE user_id = ${userId} AND type = ${existingAddress.type} AND id != ${addressId}
      `;
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (req.streetAddress !== undefined) {
      updates.push(`street_address = $${paramIndex++}`);
      values.push(req.streetAddress);
    }
    if (req.city !== undefined) {
      updates.push(`city = $${paramIndex++}`);
      values.push(req.city);
    }
    if (req.state !== undefined) {
      updates.push(`state = $${paramIndex++}`);
      values.push(req.state);
    }
    if (req.postalCode !== undefined) {
      updates.push(`postal_code = $${paramIndex++}`);
      values.push(req.postalCode);
    }
    if (req.country !== undefined) {
      updates.push(`country = $${paramIndex++}`);
      values.push(req.country);
    }
    if (req.isDefault !== undefined) {
      updates.push(`is_default = $${paramIndex++}`);
      values.push(req.isDefault);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    values.push(addressId, userId);

    const query = `
      UPDATE addresses 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
      RETURNING id, user_id, type, street_address, city, state, postal_code, country, is_default, created_at
    `;

    const address = await authDB.rawQueryRow<{
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
    }>(query, ...values);

    if (!address) {
      throw APIError.notFound("Address not found");
    }

    return {
      id: address.id,
      userId: address.user_id,
      type: address.type,
      streetAddress: address.street_address,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      isDefault: address.is_default,
      createdAt: address.created_at,
    };
  }
);

// Deletes an address for the current user.
export const deleteAddress = api<{ id: number }, void>(
  { auth: true, expose: true, method: "DELETE", path: "/auth/addresses/:id" },
  async (req) => {
    const auth = getAuthData()!;
    const userId = parseInt(auth.userID);

    await authDB.exec`
      DELETE FROM addresses 
      WHERE id = ${req.id} AND user_id = ${userId}
    `;
  }
);
