import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { ordersDB } from "./db";
import type { OrderWithItems } from "./types";

export interface GetOrderRequest {
  id: number;
}

// Retrieves a specific order with its items for the current user.
export const getOrder = api<GetOrderRequest, OrderWithItems>(
  { auth: true, expose: true, method: "GET", path: "/orders/:id" },
  async (req) => {
    try {
      const auth = getAuthData()!;
      const userId = parseInt(auth.userID);

      // Get order
      const order = await ordersDB.queryRow<{
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
      }>`
        SELECT id, user_id, order_number, status, total_amount, currency, 
               billing_address_id, shipping_address_id, notes, created_at, updated_at
        FROM orders 
        WHERE id = ${req.id} AND user_id = ${userId}
      `;

      if (!order) {
        throw APIError.notFound("Order not found");
      }

      // Get order items
      const items = await ordersDB.queryAll<{
        id: number;
        order_id: number;
        product_name: string;
        product_sku: string | null;
        quantity: number;
        unit_price: number;
        total_price: number;
        created_at: Date;
      }>`
        SELECT id, order_id, product_name, product_sku, quantity, unit_price, total_price, created_at
        FROM order_items 
        WHERE order_id = ${req.id}
        ORDER BY id
      `;

      return {
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
        items: items.map(item => ({
          id: item.id,
          orderId: item.order_id,
          productName: item.product_name,
          productSku: item.product_sku || undefined,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          createdAt: item.created_at,
        })),
      };
    } catch (error) {
      console.error("Get order error:", error);
      
      if (error instanceof APIError) {
        throw error;
      }
      
      throw APIError.internal("Failed to fetch order", error);
    }
  }
);
