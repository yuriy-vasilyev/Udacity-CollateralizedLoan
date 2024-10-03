export interface ParsedLoan {
  borrower: string;
  lender: string;
  collateralAmount: string; // Ether amount as a string
  loanAmount: string; // Ether amount as a string
  interestRate: number; // In basis points (e.g., 500 for 5%)
  duration: number; // In seconds
  startTime: number; // Timestamp in seconds
  isFunded: boolean;
  isRepaid: boolean;
}
