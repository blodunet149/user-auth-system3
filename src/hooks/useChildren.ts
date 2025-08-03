import { useState, useEffect } from 'react';
import backend from '~backend/client';
import type { Child } from '~backend/dapoer/api';

export const useChildren = () => {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const resp = await backend.dapoer.listChildren({});
      setChildren(resp.children);
    } catch (error) {
      console.error('Error fetching children:', error);
      // Fallback data for UI development without a running backend
      setChildren([
        { id: 1, name: 'Anak 1', class_name: 'Kelas 1A', user_id: 1, created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Anak 2', class_name: 'Kelas 2B', user_id: 1, created_at: new Date(), updated_at: new Date() }
      ]);
    }
  };

  return { children, fetchChildren };
};
