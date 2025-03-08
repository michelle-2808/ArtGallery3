
import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest<T = any>(
  url: string,
  method: string = "GET",
  data?: unknown | undefined,
): Promise<T> {
  const fullUrl = url.startsWith("/api") ? url : `/api${url}`;
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.statusText}`);
  }

  // For DELETE requests that return 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
