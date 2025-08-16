'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncUserToDatabase = async () => {
      if (isLoaded && user && !synced) {
        try {
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            console.log('✅ User synced to database');
            setSynced(true);
          } else {
            console.error('Failed to sync user');
          }
        } catch (error) {
          console.error('❌ Error syncing user:', error);
        }
      }
    };

    syncUserToDatabase();
  }, [user, isLoaded, synced]);

  return { synced };
}
