// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/math/Math.sol";

// Collateralized Loan Contract
contract CollateralizedLoan {
    // Using OpenZeppelin's Math library for uint256
    using Math for uint256;

    // Define the structure of a loan
    struct Loan {
        address borrower;
        address lender;
        uint256 collateralAmount;
        uint256 loanAmount;
        uint256 interestRate; // in basis points (e.g., 500 for 5%)
        uint256 duration;     // in seconds
        uint256 startTime;
        bool isFunded;
        bool isRepaid;
    }

    // Create a mapping to manage the loans
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;

    // Define events for loan requested, funded, repaid, and collateral claimed
    event LoanRequested(
        uint256 loanId,
        address borrower,
        uint256 collateralAmount,
        uint256 loanAmount,
        uint256 interestRate,
        uint256 duration
    );
    event LoanFunded(uint256 loanId, address lender);
    event LoanRepaid(uint256 loanId);
    event CollateralClaimed(uint256 loanId, address lender);

    // Custom Modifiers
    modifier loanExists(uint256 loanId) {
        require(loanId < nextLoanId, "Loan does not exist");
        _;
    }

    modifier notFunded(uint256 loanId) {
        require(!loans[loanId].isFunded, "Loan already funded");
        _;
    }

    // Function to deposit collateral and request a loan
    function depositCollateralAndRequestLoan(uint256 _interestRate, uint256 _duration) external payable {
        require(msg.value > 0, "Collateral must be greater than zero");
        uint256 _loanAmount = msg.value; // For simplicity, loan amount equals collateral amount

        loans[nextLoanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            collateralAmount: msg.value,
            loanAmount: _loanAmount,
            interestRate: _interestRate,
            duration: _duration,
            startTime: 0,
            isFunded: false,
            isRepaid: false
        });

        emit LoanRequested(
            nextLoanId,
            msg.sender,
            msg.value,
            _loanAmount,
            _interestRate,
            _duration
        );

        nextLoanId++;
    }

    // Function to fund a loan
    function fundLoan(uint256 loanId) external payable loanExists(loanId) notFunded(loanId) {
        Loan storage loan = loans[loanId];
        require(msg.value == loan.loanAmount, "Incorrect loan amount sent");

        loan.lender = msg.sender;
        loan.isFunded = true;
        loan.startTime = block.timestamp;

        // Transfer the loan amount to borrower safely
        (bool success, ) = loan.borrower.call{value: msg.value}("");
        require(success, "Transfer to borrower failed");

        // Emit LoanFunded event
        emit LoanFunded(loanId, msg.sender);
    }

    // Function to repay a loan
    function repayLoan(uint256 loanId) external payable loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(msg.sender == loan.borrower, "Only borrower can repay");

        // Calculate interest using Math.mulDiv to prevent overflow
        uint256 interest = Math.mulDiv(loan.loanAmount, loan.interestRate, 10000);
        uint256 totalRepayment = loan.loanAmount + interest;

        require(msg.value == totalRepayment, "Incorrect repayment amount");

        loan.isRepaid = true;

        // Transfer repayment to lender safely
        (bool successLender, ) = loan.lender.call{value: msg.value}("");
        require(successLender, "Transfer to lender failed");

        // Return collateral to borrower safely
        (bool successBorrower, ) = loan.borrower.call{value: loan.collateralAmount}("");
        require(successBorrower, "Return of collateral failed");

        // Emit LoanRepaid event
        emit LoanRepaid(loanId);
    }

    // Function to claim collateral on default
    function claimCollateral(uint256 loanId) external loanExists(loanId) {
        Loan storage loan = loans[loanId];
        require(loan.isFunded, "Loan not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(msg.sender == loan.lender, "Only lender can claim collateral");
        require(block.timestamp > loan.startTime + loan.duration, "Loan not yet due");

        loan.isRepaid = true;

        // Transfer collateral to lender safely
        (bool success, ) = loan.lender.call{value: loan.collateralAmount}("");
        require(success, "Transfer of collateral failed");

        // Emit CollateralClaimed event
        emit CollateralClaimed(loanId, loan.lender);
    }
}
