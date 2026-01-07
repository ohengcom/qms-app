'use client';

/**
 * Usage Hooks - REST API + React Query
 *
 * Refactored from tRPC to use fetch + React Query.
 * Maintains the same interface and functionality.
 *
 * Requirements: 1.2, 1.3 - REST API migration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys for cache management
const USAGE_KEY = ['usage'] as const;
const QUILTS_KEY = ['quilts'] as const;
const DASHBOARD_KEY = ['dashboard'] as const;

// ============================================================================
// Types
// ============================================================================

export interface UsageRecord {
  id: string;
  quiltId: string;
  startDate: Date;
  endDate: Date | null;
  usageType: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecordWithQuilt {
  id: string;
  quiltId: string;
  quiltName: string;
  itemNumber: string;
  color: string;
  season: string;
  currentStatus: string;
  startedAt: Date;
  endedAt: Date | null;
  usageType: string;
  notes: string | null;
  isActive: boolean;
  duration: number | null;
}

export interface UsageStats {
  totalUsages: number;
  totalDays: number;
  averageDays: number;
  lastUsedDate: Date | null;
}

export interface OverallUsageStats {
  total: number;
  active: number;
  completed: number;
}

export interface CreateUsageRecordInput {
  quiltId: string;
  startDate: Date;
  endDate?: Date | null;
  usageType?: 'REGULAR' | 'GUEST' | 'SPECIAL_OCCASION' | 'SEASONAL_ROTATION';
  notes?: string | null;
}

export interface UpdateUsageRecordInput {
  id: string;
  startDate?: Date;
  endDate?: Date | null;
  notes?: string | null;
}

export interface EndUsageRecordInput {
  quiltId: string;
  endDate: Date;
  notes?: string;
}

interface UsageFilters {
  quiltId?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Functions
// ============================================================================

// API response type for unified format
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    hasMore?: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Fetch all usage records with optional filtering
 */
async function fetchUsageRecords(
  filters?: UsageFilters
): Promise<{ records: UsageRecordWithQuilt[]; total: number }> {
  const params = new URLSearchParams();

  if (filters?.quiltId) params.set('quiltId', filters.quiltId);
  if (filters?.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters?.offset !== undefined) params.set('offset', String(filters.offset));

  const queryString = params.toString();
  const url = `/api/usage${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取使用记录列表失败' }));
    throw new Error(error.error?.message || error.error || '获取使用记录列表失败');
  }

  const result: ApiResponse<{ records: UsageRecordWithQuilt[] }> = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return {
      records: result.data.records || [],
      total: result.meta?.total || result.data.records?.length || 0,
    };
  }

  // Fallback for old format (backward compatibility)
  return result as unknown as { records: UsageRecordWithQuilt[]; total: number };
}

/**
 * Fetch a single usage record by ID
 */
async function fetchUsageRecordById(id: string): Promise<UsageRecord> {
  const response = await fetch(`/api/usage/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取使用记录失败' }));
    throw new Error(error.error?.message || error.error || '获取使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return result.data.record || result.data;
  }

  return result;
}

/**
 * Fetch usage records for a specific quilt
 */
async function fetchQuiltUsageRecords(
  quiltId: string
): Promise<{ records: UsageRecord[]; total: number; activeRecord: UsageRecord | null }> {
  const response = await fetch(`/api/usage/by-quilt/${quiltId}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取被子使用记录失败' }));
    throw new Error(error.error?.message || error.error || '获取被子使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return {
      records: result.data.records || [],
      total: result.meta?.total || result.data.records?.length || 0,
      activeRecord: result.data.activeRecord || null,
    };
  }

  return result;
}

/**
 * Fetch all active usage records
 */
async function fetchAllActiveUsageRecords(): Promise<{
  records: UsageRecord[];
  total: number;
}> {
  const response = await fetch('/api/usage/active');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取活跃使用记录失败' }));
    throw new Error(error.error?.message || error.error || '获取活跃使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return {
      records: result.data.records || [],
      total: result.meta?.total || result.data.records?.length || 0,
    };
  }

  return result;
}

/**
 * Fetch usage statistics for a quilt
 */
async function fetchUsageStats(quiltId: string): Promise<UsageStats> {
  const response = await fetch(`/api/usage/by-quilt/${quiltId}?includeStats=true`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取使用统计失败' }));
    throw new Error(error.error?.message || error.error || '获取使用统计失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return (
      result.data.stats || { totalUsages: 0, totalDays: 0, averageDays: 0, lastUsedDate: null }
    );
  }

  return result.stats || { totalUsages: 0, totalDays: 0, averageDays: 0, lastUsedDate: null };
}

/**
 * Fetch overall usage statistics
 */
async function fetchOverallUsageStats(): Promise<OverallUsageStats> {
  const response = await fetch('/api/usage/stats');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取使用统计失败' }));
    throw new Error(error.error?.message || error.error || '获取使用统计失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return result.data.stats || result.data;
  }

  return result;
}

/**
 * Create a new usage record
 */
async function createUsageRecord(data: CreateUsageRecordInput): Promise<UsageRecord> {
  const response = await fetch('/api/usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quiltId: data.quiltId,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : null,
      usageType: data.usageType || 'REGULAR',
      notes: data.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '创建使用记录失败' }));
    throw new Error(error.error?.message || error.error || '创建使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return result.data.record || result.data;
  }

  return result;
}

/**
 * Update a usage record
 */
async function updateUsageRecord(data: UpdateUsageRecordInput): Promise<UsageRecord> {
  const { id, ...updateData } = data;

  const body: Record<string, unknown> = {};
  if (updateData.startDate) body.startDate = updateData.startDate.toISOString();
  if (updateData.endDate !== undefined) {
    body.endDate = updateData.endDate ? updateData.endDate.toISOString() : null;
  }
  if (updateData.notes !== undefined) body.notes = updateData.notes;

  const response = await fetch(`/api/usage/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '更新使用记录失败' }));
    throw new Error(error.error?.message || error.error || '更新使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return result.data.record || result.data;
  }

  return result;
}

/**
 * End an active usage record
 */
async function endUsageRecord(data: EndUsageRecordInput): Promise<UsageRecord> {
  const response = await fetch('/api/usage/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quiltId: data.quiltId,
      endDate: data.endDate.toISOString(),
      notes: data.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '结束使用记录失败' }));
    throw new Error(error.error?.message || error.error || '结束使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success && result.data) {
    return result.data.record || result.data;
  }

  return result;
}

/**
 * Delete a usage record
 */
async function deleteUsageRecord(input: { id: string }): Promise<{ success: boolean }> {
  const response = await fetch(`/api/usage/${input.id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '删除使用记录失败' }));
    throw new Error(error.error?.message || error.error || '删除使用记录失败');
  }

  const result = await response.json();

  // Handle new unified API response format
  if (result.success !== undefined) {
    return { success: result.success };
  }

  return result;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all usage records with optional filtering
 * Returns the records array directly for backward compatibility
 */
export function useUsageRecords(filters?: UsageFilters) {
  return useQuery({
    queryKey: [...USAGE_KEY, 'list', filters],
    queryFn: async () => {
      const result = await fetchUsageRecords(filters);
      return result.records;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single usage record by ID
 */
export function useUsageRecord(id: string) {
  return useQuery({
    queryKey: [...USAGE_KEY, 'detail', id],
    queryFn: () => fetchUsageRecordById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch usage records for a specific quilt
 * Returns the records array directly for backward compatibility
 */
export function useQuiltUsageRecords(quiltId: string) {
  return useQuery({
    queryKey: [...USAGE_KEY, 'by-quilt', quiltId],
    queryFn: async () => {
      const result = await fetchQuiltUsageRecords(quiltId);
      return result.records;
    },
    enabled: !!quiltId,
  });
}

/**
 * Hook to get the active usage record for a quilt
 */
export function useActiveUsageRecord(quiltId: string) {
  return useQuery({
    queryKey: [...USAGE_KEY, 'active', quiltId],
    queryFn: async () => {
      const result = await fetchQuiltUsageRecords(quiltId);
      return result.activeRecord;
    },
    enabled: !!quiltId,
  });
}

/**
 * Hook to fetch all active usage records
 * Returns the records array directly for backward compatibility
 */
export function useAllActiveUsageRecords() {
  return useQuery({
    queryKey: [...USAGE_KEY, 'all-active'],
    queryFn: async () => {
      const result = await fetchAllActiveUsageRecords();
      return result.records;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to create a new usage record
 */
export function useCreateUsageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUsageRecord,
    onSuccess: () => {
      // Invalidate usage queries
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });

      // Invalidate quilt queries (usage affects quilt status)
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to update a usage record
 */
export function useUpdateUsageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUsageRecord,
    onSuccess: () => {
      // Invalidate usage queries
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to end an active usage record
 */
export function useEndUsageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endUsageRecord,
    onSuccess: () => {
      // Invalidate usage queries
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });

      // Invalidate quilt queries (ending usage affects quilt status)
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to delete a usage record
 */
export function useDeleteUsageRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUsageRecord,
    onSuccess: () => {
      // Invalidate usage queries
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to get usage statistics for a quilt
 */
export function useUsageStats(quiltId: string) {
  return useQuery({
    queryKey: [...USAGE_KEY, 'stats', quiltId],
    queryFn: () => fetchUsageStats(quiltId),
    enabled: !!quiltId,
  });
}

/**
 * Hook to get overall usage statistics
 */
export function useOverallUsageStats() {
  return useQuery({
    queryKey: [...USAGE_KEY, 'overall-stats'],
    queryFn: fetchOverallUsageStats,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}
