"use client";

import { useCallback, useState } from "react";

export function useFetch<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (url: string, init?: RequestInit) => {
    setError(null);
    try {
      return await fetch(url, init);
    } catch (err) {
      const requestError =
        err instanceof Error ? err : new Error("Network request failed");
      setError(requestError);
      throw requestError;
    }
  }, []);

  const fetchJson = useCallback(
    async (url: string, init?: RequestInit) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, init);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const json = (await response.json()) as T;
        setData(json);
        return json;
      } catch (err) {
        const requestError =
          err instanceof Error ? err : new Error("Network request failed");
        setError(requestError);
        throw requestError;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { data, error, loading, fetchData, fetchJson, setData };
}
