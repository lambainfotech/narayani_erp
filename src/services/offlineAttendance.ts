import { AttendanceBatch, PendingAttendanceBatch } from '../types/erp';
import { erpApi } from './api';

const QUEUE_STORAGE_KEY = 'erp_pending_attendance_queue';
export const ATTENDANCE_CACHE_EVENT = 'erp:attendance-cache-changed';

/**
 * Get list of pending attendance batches stored locally.
 */
export function getPendingAttendanceBatches(): PendingAttendanceBatch[] {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('Failed to read offline attendance queue:', e);
    return [];
  }
}

/**
 * Save pending attendance batches back to localStorage.
 */
function persistQueue(queue: PendingAttendanceBatch[]) {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyQueueChanged(queue.length);
  } catch (e) {
    console.error('Failed to write offline attendance queue:', e);
  }
}

/**
 * Dispatch event to notify listeners that queue count changed.
 */
function notifyQueueChanged(count: number) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(ATTENDANCE_CACHE_EVENT, {
        detail: { count },
      })
    );
  }
}

/**
 * Queue an attendance batch into local storage for later retry.
 */
export function queueAttendanceBatch(
  batch: AttendanceBatch,
  errorReason?: string
): PendingAttendanceBatch {
  const current = getPendingAttendanceBatches();
  
  // Format class label for easy display
  const classLabel = `${batch.course} ${batch.year} - Sec ${batch.section} (${batch.subject})`;

  // Check if identical batch ID already queued, update it
  const existingIdx = current.findIndex((b) => b.id === batch.id);

  const pendingItem: PendingAttendanceBatch = {
    ...batch,
    queuedAt: Date.now(),
    retryAttempts: existingIdx >= 0 ? current[existingIdx].retryAttempts + 1 : 0,
    lastError: errorReason || 'ndedu.in API unreachable (cached locally)',
    classLabel,
  };

  let updated: PendingAttendanceBatch[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = pendingItem;
  } else {
    updated = [pendingItem, ...current];
  }

  persistQueue(updated);
  return pendingItem;
}

/**
 * Remove a specific batch by ID after successful sync or discard.
 */
export function removePendingAttendanceBatch(id: string): void {
  const current = getPendingAttendanceBatches();
  const filtered = current.filter((b) => b.id !== id);
  persistQueue(filtered);
}

/**
 * Clear the entire pending queue.
 */
export function clearPendingAttendanceQueue(): void {
  persistQueue([]);
}

/**
 * Attempt to sync all pending attendance records to ndedu.in FastRoute ERP.
 */
export async function syncPendingAttendanceBatches(): Promise<{
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}> {
  const current = getPendingAttendanceBatches();
  if (current.length === 0) {
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];
  const remaining: PendingAttendanceBatch[] = [];

  for (const batch of current) {
    try {
      // Attempt remote FastRoute save via erpApi
      const res = await erpApi.saveAttendance(batch);
      if (res.success) {
        synced++;
      } else {
        failed++;
        const msg = res.message || 'Server rejected batch';
        errors.push(`${batch.classLabel || batch.id}: ${msg}`);
        remaining.push({
          ...batch,
          retryAttempts: (batch.retryAttempts || 0) + 1,
          lastError: msg,
        });
      }
    } catch (err: any) {
      failed++;
      const msg = err.message || 'Network request failed';
      errors.push(`${batch.classLabel || batch.id}: ${msg}`);
      remaining.push({
        ...batch,
        retryAttempts: (batch.retryAttempts || 0) + 1,
        lastError: msg,
      });
    }
  }

  persistQueue(remaining);

  return {
    total: current.length,
    synced,
    failed,
    errors,
  };
}
