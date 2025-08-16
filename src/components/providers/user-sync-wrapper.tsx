'use client';

import { useUserSync } from '@/hooks/useUserSync';

export function UserSyncWrapper({ children }: { children: React.ReactNode }) {
  useUserSync(); // This will automatically sync user when they sign in
  
  return <>{children}</>;
}
