import { useEffect, useState } from "react";
import { CreditsType } from "@/lib/types";

export const useCredits = () => {
  const [credits, setCredits] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/credits");

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data: CreditsType = await response.json();
      console.log("credits data", data);
      setCredits(data.credits);
      setIsPremium(data.isPremium);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching credits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return {
    usersCredits: credits,
    isUserPremium: isPremium,
    isLoading: loading,
    error,
    refetch: fetchCredits,
  };
};
