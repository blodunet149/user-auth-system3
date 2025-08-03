import { useState, useEffect } from 'react';
import backend from '~backend/client';
import type { DailyMenu } from '~backend/dapoer/api';
import { format } from 'date-fns';

export const useDailyMenus = () => {
  const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDailyMenus = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const resp = await backend.dapoer.listDailyMenus({ date: dateStr });
      setDailyMenus(resp.menus);
    } catch (error) {
      console.error('Error fetching daily menus:', error);
      setDailyMenus([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    dailyMenus,
    loading,
    fetchDailyMenus
  };
};
