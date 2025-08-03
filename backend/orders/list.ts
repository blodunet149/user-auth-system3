import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Query } from "encore.dev/api";
import { ordersDB } from "./db";
import type { Order } from "./types";

export interface ListOrdersRequest {
  limit?: Query<number>;
  offset?: Query<number>;
  status?: Query<string>;
}

export interface ListOrdersResponse {
  orders: Order[];
  total: number;
}

// Retrieves the current user's order history.
export const listOrders = api<ListOrdersRequest, ListOrdersResponse>(
  { auth: true, expose: true, method: "GET", path: "/orders" },
  async (req) => {
    try {
      const auth = getAuthData()!;
      const userId = parseInt(auth.userID);
      const limit = req.limit || 20;
      const offset = req.offset || 0;

      let whereClause = "WHERE user_id = $1";
      const params: any[] = [userId];
      let paramIndex = 2;

      if (req.status) {
        whereClause += ` AND status = $${paramIndex++}`;
        params.push(req.status);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM orders ${whereClause}`;
      const countResult = await ordersDB.rawQueryRow<{ count: number }>(countQuery, ...params);
      const total = countResult?.count || 0;

      // Get orders
      const ordersQuery = `
        SELECT id, user_id, order_number, status, total_amount, currency, 
               billing_address_id, shipping_address_id, notes, created_at, updated_at
        FROM orders 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `;
      params.push(limit, offset);

      const orders = await ordersDB.rawQueryAll<{
        id: number;
        user_id: number;
        order_number: string;
        status: string;
        total_amount: number;
        currency: string;
        billing_address_id: number | null;
        shipping_address_id: number | null;
        notes: string | null;
        created_at: Date;
        updated_at: Date;
      }>(ordersQuery, ...params);

      return {
        orders: orders.map(order => ({
          id: order.id,
          userId: order.user_id,
          orderNumber: order.order_number,
          status: order.status as any,
          totalAmount: order.total_amount,
          currency: order.currency,
          billingAddressId: order.billing_address_id || undefined,
          shippingAddressId: order.shipping_address_id || undefined,
          notes: order.notes || undefined,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        })),
        total,
      };
    } catch (error) {
      console.error("List orders error:", error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to fetch orders", error);
    }
  }
);
