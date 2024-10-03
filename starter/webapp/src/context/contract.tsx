"use client";

import { createContext, FC, ReactNode, useEffect, useState } from "react";
import { BrowserProvider, Contract, Signer } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/constants";

interface ContractContextType {
  loading: boolean;
  signer: Signer | null;
  contract: Contract | null;
}

export const ContractContext = createContext<ContractContextType>({
  loading: false,
  signer: null,
  contract: null,
});

interface ContractProviderType {
  children: ReactNode;
}

const ContractProvider: FC<ContractProviderType> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [signer, setSigner] = useState<any | null>(null);
  const [contract, setContract] = useState<any | null>(null);

  const initContract = async () => {
    setLoading(true);

    try {
      if (!window.ethereum) {
        console.log("MetaMask not installed; using read-only defaults");
        return;
      } else {
        const provider = new BrowserProvider(window.ethereum);
        const currentSigner = await provider.getSigner();

        const instance = new Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          currentSigner,
        );

        await instance.waitForDeployment();

        setContract(instance);
        setSigner(currentSigner);
      }
    } catch (error) {
      console.error("Error initializing contract:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initContract().catch(console.error);
  }, []);

  return (
    <ContractContext.Provider value={{ loading, signer, contract }}>
      {loading || !contract || !signer ? (
        <div className="h-full bg-white">
          <div className="font-semibold text-gray-900 h-full text-center">
            {loading && <p>Loading contract...</p>}
            {!loading && !contract && <p>Contract not found</p>}
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </ContractContext.Provider>
  );
};

export default ContractProvider;
