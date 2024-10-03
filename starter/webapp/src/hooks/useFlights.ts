import { useCallback, useEffect, useState } from "react";
import { UnregisteredFlight } from "@/types/RawLoan";
import { getErrorMessage } from "@/helpers";
import useContract from "@/hooks/useContract";
import axios from "axios";

export function useFlights() {
  const [flights, setFlights] = useState<UnregisteredFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { contract } = useContract();

  const fetchFlights = useCallback(async () => {
    if (!contract) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/api/flights");
      setFlights(data.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchFlights().catch(console.error);
  }, [fetchFlights]);

  return {
    flights,
    loading,
    error,
    fetchFlights,
  };
}
