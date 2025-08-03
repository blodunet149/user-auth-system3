export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  billingAddressId?: number;
  shippingAddressId?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
