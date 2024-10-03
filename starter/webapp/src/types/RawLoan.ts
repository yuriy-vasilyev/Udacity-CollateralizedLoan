import { BigNumberish } from "ethers";

export interface RawLoan {
  borrower: string;
  lender: string;
  collateralAmount: BigNumberish;
  loanAmount: BigNumberish;
  interestRate: BigNumberish;
  duration: BigNumberish;
  startTime: BigNumberish;
  isFunded: boolean;
  isRepaid: boolean;
  // Indexed properties are optional since we will access fields by name
  [key: string]: any;
}
