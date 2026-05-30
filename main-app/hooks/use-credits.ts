"use client";

import { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { CreditsType } from "@/lib/types";

export const useCredits = () => {
  const [credits, setCredits] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchData } = useFetch<CreditsType>();

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchData("/api/credits");

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = (await response.json()) as CreditsType;
      setCredits(data.credits);
      setIsPremium(data.isPremium);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching credits:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    void fetchCredits();
  }, [fetchCredits]);

  return {
    usersCredits: credits,
    isUserPremium: isPremium,
    isLoading: loading,
    error,
    refetch: fetchCredits,
  };
};
