import { useState, useEffect } from 'react';
import backend from '~backend/client';
import type { SystemSetting } from '~backend/dapoer/api';

interface PaymentSettings {
  midtransEnabled: boolean;
  adminFeePercentage: number;
}

export const usePaymentSettings = () => {
  const [settings, setSettings] = useState<PaymentSettings>({
    midtransEnabled: false,
    adminFeePercentage: 0.7
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const resp = await backend.dapoer.getSystemSettings({ keys: ['midtrans_enabled', 'midtrans_admin_fee_percentage'] });
      
      const settingsMap = (resp.settings || []).reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);

      const newSettings = {
        midtransEnabled: settingsMap.midtrans_enabled === 'true',
        adminFeePercentage: parseFloat(settingsMap.midtrans_admin_fee_percentage || '0.7')
      };
      
      setSettings(newSettings);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      setSettings({
        midtransEnabled: false,
        adminFeePercentage: 0.7
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const calculateQRISAdminFee = (amount: number, paymentMethod: 'qris' | 'cash' = 'qris') => {
    if (paymentMethod === 'cash' || !settings.midtransEnabled) {
      return 0;
    }

    let fee = 0;
    if (amount < 628000) {
      fee = Math.round(amount * 0.007);
    } else {
      fee = 4400;
    }
    return fee;
  };

  return {
    settings,
    loading,
    calculateQRISAdminFee,
    refetch: fetchSettings
  };
};
