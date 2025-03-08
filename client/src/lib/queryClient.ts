import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  QueryClient,
  MutationCache,
  QueryCache,
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
});

export async function apiRequest<T = any>(
  endpoint: string,
  method: string = "GET",
  data?: unknown | undefined,
): Promise<T> {
  const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  // For DELETE requests that return 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return await res.json();
}