
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

// Function to get a query function with error handling options
export function getQueryFn({ on401 = "throw" }: { on401?: "throw" | "returnNull" } = {}) {
  return async ({ queryKey }: { queryKey: string[] }): Promise<any> => {
    const [url] = queryKey;
    const response = await fetch(url);
    
    if (response.status === 401 && on401 === "returnNull") {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  };
}

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
