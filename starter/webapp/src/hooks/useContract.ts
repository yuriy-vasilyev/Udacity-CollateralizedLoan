import { useContext } from "react";
import { ContractContext } from "@/context/contract";

export default function useContract() {
  return useContext(ContractContext);
}
