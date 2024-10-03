import { useCallback, useEffect, useState } from "react";
import { RegisteredFlight } from "@/types/RawLoan";
import { generateFlightKey, getErrorMessage } from "@/helpers";
import useContract from "@/hooks/useContract";
import { ethers } from "ethers";
import { useFlights } from "@/hooks/useFlights";

export function useRegisteredFlights() {
  const [flights, setFlights] = useState<RegisteredFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { contract } = useContract();
  const { flights: unregisteredFlights } = useFlights();

  const fetchFlights = useCallback(async () => {
    if (!contract || !unregisteredFlights.length) {
      return;
    }

    setLoading(true);
    setError("");

    const result: RegisteredFlight[] = [];

    for (const flight of unregisteredFlights) {
      try {
        const flightKey = ethers.encodeBytes32String(generateFlightKey(flight));

        const flightData = await contract.getFlight(flightKey);

        if (!flightData[0]) {
          continue;
        }

        const data: RegisteredFlight = {
          flightKey,
          name: flightData[0],
          datetime: parseInt(flightData[1]),
          origin: flightData[2],
          destination: flightData[3],
          isRegistered: flightData[4],
          statusCode: parseInt(flightData[5]),
          updatedTimestamp: parseInt(flightData[6]),
          airline: flightData[7],
        };

        if (!data.isRegistered) {
          continue;
        }

        result.push(data);
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      }
    }

    setFlights(result);

    setLoading(false);
  }, [contract, unregisteredFlights]);

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
