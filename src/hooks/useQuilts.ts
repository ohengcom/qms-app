'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QuiltSearchInput } from '@/lib/validations/quilt';

export function useQuilts(searchParams?: QuiltSearchInput) {
  return useQuery({
    queryKey: ['quilts'],
    queryFn: async () => {
      const response = await fetch('/api/quilts');
      if (!response.ok) {
        throw new Error(`Failed to fetch quilts: ${response.status}`);
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
}

export function useQuilt(id: string) {
  return useQuery({
    queryKey: ['quilt', id],
    queryFn: async () => {
      const response = await fetch(`/api/quilts/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch quilt: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/quilts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create quilt: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/quilts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update quilt: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
      queryClient.invalidateQueries({ queryKey: ['quilt'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteQuilt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/quilts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to delete quilt: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Usage tracking hooks - simplified stubs for now
export function useStartUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/usage/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to start usage: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useEndUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/usage/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to end usage: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quilts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
