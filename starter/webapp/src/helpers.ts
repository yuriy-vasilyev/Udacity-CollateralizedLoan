import { ethers } from "ethers";
import { ParsedLoan } from "@/types/ParsedLoan";
import { RawLoan } from "@/types/RawLoan";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // @ts-ignore
    return error.info?.error?.data?.data?.reason ?? error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    return "An error occurred";
  }
};

export const parseLoan = (rawLoan: RawLoan): ParsedLoan => ({
  borrower: rawLoan.borrower,
  lender: rawLoan.lender,
  collateralAmount: ethers.formatEther(rawLoan.collateralAmount),
  loanAmount: ethers.formatEther(rawLoan.loanAmount),
  interestRate: Number(rawLoan.interestRate.toString()),
  duration: Number(rawLoan.duration.valueOf()),
  startTime: Number(rawLoan.startTime.valueOf()),
  isFunded: rawLoan.isFunded,
  isRepaid: rawLoan.isRepaid,
});
