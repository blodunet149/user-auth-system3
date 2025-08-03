import { useEffect, useState } from 'react';
import backend from '~backend/client';
import { toast } from '@/components/ui/use-toast';
import { canPayOrder } from '@/utils/orderUtils';
import type { Order } from '~backend/dapoer/api';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const resp = await backend.dapoer.listOrders({});
      setOrders(resp.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pesanan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = async (order: Order) => {
    try {
      if (!canPayOrder(order)) {
        toast({
          title: "Tidak Dapat Dibayar",
          description: "Pesanan ini sudah kadaluarsa atau sudah dibayar",
          variant: "destructive",
        });
        return;
      }
      // Placeholder for payment logic
      toast({
        title: "Info",
        description: "Fitur pembayaran akan diimplementasikan.",
      });
    } catch (error: any) {
      console.error('Retry payment error:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal memproses pembayaran",
        variant: "destructive",
      });
    }
  };

  return {
    orders,
    loading,
    retryPayment,
    fetchOrders
  };
};
