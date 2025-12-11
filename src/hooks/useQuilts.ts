'use client';

/**
 * Quilts Hooks - REST API + React Query
 *
 * Refactored from tRPC to use fetch + React Query.
 * Maintains the same interface and functionality.
 *
 * Requirements: 1.2, 1.3 - REST API migration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Quilt,
  QuiltSearchInput,
  CreateQuiltInput,
  UpdateQuiltInput,
} from '@/lib/validations/quilt';

// Query keys for cache management
const QUILTS_KEY = ['quilts'] as const;
const USAGE_KEY = ['usage'] as const;
const DASHBOARD_KEY = ['dashboard'] as const;

// API response types
interface QuiltsResponse {
  quilts: Quilt[];
  total: number;
  hasMore: boolean;
}

// Helper function to build query string from search params
function buildQueryString(searchParams?: QuiltSearchInput): string {
  if (!searchParams) return '';

  const params = new URLSearchParams();

  // Add filters
  if (searchParams.filters) {
    if (searchParams.filters.season) params.set('season', searchParams.filters.season);
    if (searchParams.filters.status) params.set('status', searchParams.filters.status);
    if (searchParams.filters.location) params.set('location', searchParams.filters.location);
    if (searchParams.filters.brand) params.set('brand', searchParams.filters.brand);
    if (searchParams.filters.search) params.set('search', searchParams.filters.search);
  }

  // Add pagination
  if (searchParams.skip !== undefined) params.set('offset', String(searchParams.skip));
  if (searchParams.take !== undefined) params.set('limit', String(searchParams.take));

  // Add sorting
  if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
  if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// Fetch functions
async function fetchQuilts(searchParams?: QuiltSearchInput): Promise<QuiltsResponse> {
  const queryString = buildQueryString(searchParams);
  const response = await fetch(`/api/quilts${queryString}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取被子列表失败' }));
    throw new Error(error.error || '获取被子列表失败');
  }

  return response.json();
}

async function fetchQuiltById(id: string): Promise<Quilt> {
  const response = await fetch(`/api/quilts/${id}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '获取被子详情失败' }));
    throw new Error(error.error || '获取被子详情失败');
  }

  return response.json();
}

async function createQuilt(data: CreateQuiltInput): Promise<Quilt> {
  const response = await fetch('/api/quilts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '创建被子失败' }));
    throw new Error(error.error || '创建被子失败');
  }

  return response.json();
}

async function updateQuilt(data: UpdateQuiltInput): Promise<Quilt> {
  const { id, ...updateData } = data;
  const response = await fetch(`/api/quilts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '更新被子失败' }));
    throw new Error(error.error || '更新被子失败');
  }

  return response.json();
}

async function deleteQuilt(input: { id: string }): Promise<{ success: boolean }> {
  const response = await fetch(`/api/quilts/${input.id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '删除被子失败' }));
    throw new Error(error.error || '删除被子失败');
  }

  return response.json();
}

// Usage tracking API functions
// These match the original tRPC interface for backward compatibility
interface StartUsageInput {
  quiltId: string;
  startDate: Date;
  usageType?: 'REGULAR' | 'GUEST' | 'SPECIAL_OCCASION' | 'SEASONAL_ROTATION';
  notes?: string;
}

interface EndUsageInput {
  quiltId: string;
  endDate?: Date;
  notes?: string;
}

interface UsageRecord {
  id: string;
  quiltId: string;
  startDate: Date;
  endDate: Date | null;
  usageType: string;
  notes: string | null;
}

async function startUsage(data: StartUsageInput): Promise<UsageRecord> {
  // Create a usage record via the usage API
  const response = await fetch('/api/usage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quiltId: data.quiltId,
      startDate: data.startDate.toISOString(),
      usageType: data.usageType || 'REGULAR',
      notes: data.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '开始使用失败' }));
    throw new Error(error.error || '开始使用失败');
  }

  // Also update the quilt status to IN_USE
  const statusResponse = await fetch(`/api/quilts/${data.quiltId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'IN_USE',
      usageType: data.usageType || 'REGULAR',
      notes: data.notes,
    }),
  });

  if (!statusResponse.ok) {
    // Log but don't fail - the usage record was created
    console.warn('Failed to update quilt status to IN_USE');
  }

  return response.json();
}

async function endUsage(data: EndUsageInput): Promise<UsageRecord | null> {
  // Update the quilt status to STORAGE (which will end the usage record)
  const response = await fetch(`/api/quilts/${data.quiltId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'STORAGE',
      notes: data.notes,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '结束使用失败' }));
    throw new Error(error.error || '结束使用失败');
  }

  const result = await response.json();
  return result.usageRecord;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all quilts with optional search/filter parameters
 */
export function useQuilts(searchParams?: QuiltSearchInput) {
  return useQuery({
    queryKey: [...QUILTS_KEY, searchParams],
    queryFn: () => fetchQuilts(searchParams),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single quilt by ID
 */
export function useQuilt(id: string) {
  return useQuery({
    queryKey: [...QUILTS_KEY, id],
    queryFn: () => fetchQuiltById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new quilt
 */
export function useCreateQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuilt,
    onSuccess: () => {
      // Invalidate quilt queries
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to update an existing quilt
 */
export function useUpdateQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuilt,
    onSuccess: () => {
      // Invalidate quilt queries
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });

      // Invalidate usage queries (status changes affect usage records)
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to delete a quilt
 */
export function useDeleteQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuilt,
    onSuccess: () => {
      // Invalidate quilt queries
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });

      // Invalidate usage queries (deleting quilt affects related usage records)
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });

      // Invalidate dashboard
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to start using a quilt (creates usage record and updates status to IN_USE)
 */
export function useStartUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}

/**
 * Hook to end using a quilt (ends usage record and updates status to STORAGE)
 */
export function useEndUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUILTS_KEY });
      queryClient.invalidateQueries({ queryKey: USAGE_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    },
  });
}
