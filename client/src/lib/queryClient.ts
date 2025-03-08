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

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
};

export async function apiRequest<T = any>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  const fullUrl = url.startsWith("/api") ? url : `/api${url}`;

  try {
    const response = await fetch(fullUrl, {
      method: options?.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    // For DELETE requests that return 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to make API request');
  }
}

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