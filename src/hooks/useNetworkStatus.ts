import { useState, useEffect, useCallback, useRef } from 'react';
import { NetworkStatusInfo } from '../types/erp';
import { erpApi } from '../services/api';
import {
  getPendingAttendanceBatches,
  syncPendingAttendanceBatches,
  ATTENDANCE_CACHE_EVENT,
} from '../services/offlineAttendance';

export interface UseNetworkStatusReturn extends NetworkStatusInfo {
  isChecking: boolean;
  isSyncing: boolean;
  showRestoredNotice: boolean;
  dismissRestoredNotice: () => void;
  checkConnection: (silent?: boolean) => Promise<boolean>;
  syncPendingAttendance: () => Promise<{ synced: number; failed: number }>;
}

export function useNetworkStatus(pingIntervalMs = 25000): UseNetworkStatusReturn {
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isApiReachable, setIsApiReachable] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);
  const [pendingAttendanceCount, setPendingAttendanceCount] = useState<number>(() =>
    getPendingAttendanceBatches().length
  );

  const previousReachableRef = useRef<boolean>(true);
  const autoSyncLockRef = useRef<boolean>(false);

  // Synchronize count with offline storage event
  const refreshPendingCount = useCallback(() => {
    const list = getPendingAttendanceBatches();
    setPendingAttendanceCount(list.length);
  }, []);

  // Check connection to ndedu.in FastRoute ERP
  const checkConnection = useCallback(
    async (silent = false): Promise<boolean> => {
      if (!silent) setIsChecking(true);

      // 1. First verify browser online status
      const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsBrowserOnline(browserOnline);

      if (!browserOnline) {
        setIsApiReachable(false);
        setError('Device is offline (No internet connection)');
        setLatencyMs(null);
        setLastChecked(Date.now());
        if (!silent) setIsChecking(false);
        previousReachableRef.current = false;
        return false;
      }

      // 2. Perform diagnostic ping to ndedu.in FastRoute API
      try {
        const result = await erpApi.testConnection();
        setLatencyMs(result.latencyMs);
        setLastChecked(Date.now());

        const reachable = !!result.success;
        setIsApiReachable(reachable);

        if (reachable) {
          setError(null);

          // If connection was previously lost, show restored banner and auto-sync pending attendance
          if (!previousReachableRef.current) {
            setShowRestoredNotice(true);

            // Auto-trigger sync if pending attendance exists
            const pending = getPendingAttendanceBatches();
            if (pending.length > 0 && !autoSyncLockRef.current) {
              autoSyncLockRef.current = true;
              setIsSyncing(true);
              syncPendingAttendanceBatches()
                .then((syncRes) => {
                  refreshPendingCount();
                  console.log(`Auto-synced ${syncRes.synced} offline attendance batches to ndedu.in`);
                })
                .finally(() => {
                  setIsSyncing(false);
                  autoSyncLockRef.current = false;
                });
            }
          }
          previousReachableRef.current = true;
        } else {
          setError(result.error || 'ndedu.in API response timed out or unreachable');
          previousReachableRef.current = false;
        }

        if (!silent) setIsChecking(false);
        return reachable;
      } catch (err: any) {
        setIsApiReachable(false);
        setError(err.message || 'Unable to connect to ndedu.in ERP');
        setLatencyMs(null);
        setLastChecked(Date.now());
        previousReachableRef.current = false;
        if (!silent) setIsChecking(false);
        return false;
      }
    },
    [refreshPendingCount]
  );

  // Manual trigger for attendance sync
  const syncPendingAttendance = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncPendingAttendanceBatches();
      refreshPendingCount();
      return { synced: res.synced, failed: res.failed };
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPendingCount]);

  const dismissRestoredNotice = useCallback(() => {
    setShowRestoredNotice(false);
  }, []);

  // Listen to browser online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsBrowserOnline(true);
      checkConnection(false);
    };

    const handleOffline = () => {
      setIsBrowserOnline(false);
      setIsApiReachable(false);
      setError('Network offline');
      previousReachableRef.current = false;
    };

    const handleQueueChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      setPendingAttendanceCount(customEvent.detail?.count ?? getPendingAttendanceBatches().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(ATTENDANCE_CACHE_EVENT, handleQueueChanged);

    // Initial check
    checkConnection(true);

    // Periodic ping loop
    const timer = setInterval(() => {
      checkConnection(true);
    }, pingIntervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(ATTENDANCE_CACHE_EVENT, handleQueueChanged);
      clearInterval(timer);
    };
  }, [checkConnection, pingIntervalMs]);

  // Auto-dismiss restored notice after 5 seconds
  useEffect(() => {
    if (showRestoredNotice) {
      const timeout = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [showRestoredNotice]);

  return {
    isBrowserOnline,
    isApiReachable,
    latencyMs,
    lastChecked,
    error,
    pendingAttendanceCount,
    isChecking,
    isSyncing,
    showRestoredNotice,
    dismissRestoredNotice,
    checkConnection,
    syncPendingAttendance,
  };
}
