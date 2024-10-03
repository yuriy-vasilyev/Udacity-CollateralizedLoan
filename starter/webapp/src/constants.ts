import contractAbi from "../../hardhat-js/artifacts/contracts/CollateralizedLoan.sol/CollateralizedLoan.json";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x";
export const CONTRACT_ABI = contractAbi.abi;
