// Importing necessary modules and functions from Hardhat and Chai for testing
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Describing a test suite for the CollateralizedLoan contract
describe("CollateralizedLoan", function () {
  // A fixture to deploy the contract before each test. This helps in reducing code repetition.
  async function deployCollateralizedLoanFixture() {
    // Deploying the CollateralizedLoan contract and returning necessary variables
    const CollateralizedLoan =
      await ethers.getContractFactory("CollateralizedLoan");
    const [owner, borrower, lender, ...addrs] = await ethers.getSigners();
    const collateralizedLoan = await CollateralizedLoan.deploy();

    return { collateralizedLoan, owner, borrower, lender, addrs };
  }

  // Test suite for the loan request functionality
  describe("Loan Request", function () {
    it("Should let a borrower deposit collateral and request a loan", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower } = await loadFixture(
        deployCollateralizedLoanFixture,
      );

      // Set up test for depositing collateral and requesting a loan
      const collateralAmount = ethers.parseEther("1"); // Returns bigint
      const interestRate = 500; // 5%
      const duration = 3600; // 1 hour

      await expect(
        collateralizedLoan
          .connect(borrower)
          .depositCollateralAndRequestLoan(interestRate, duration, {
            value: collateralAmount,
          }),
      ).to.emit(collateralizedLoan, "LoanRequested");

      const loan = await collateralizedLoan.loans(0);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.collateralAmount).to.equal(collateralAmount);
      expect(loan.loanAmount).to.equal(collateralAmount);
      expect(loan.interestRate).to.equal(BigInt(interestRate));
      expect(loan.duration).to.equal(BigInt(duration));
    });
  });

  // Test suite for funding a loan
  describe("Funding a Loan", function () {
    it("Allows a lender to fund a requested loan", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower, lender } = await loadFixture(
        deployCollateralizedLoanFixture,
      );

      // Borrower deposits collateral and requests a loan
      const collateralAmount = ethers.parseEther("1");
      const interestRate = 500; // 5%
      const duration = 3600; // 1 hour

      await collateralizedLoan
        .connect(borrower)
        .depositCollateralAndRequestLoan(interestRate, duration, {
          value: collateralAmount,
        });

      // Lender funds the loan
      const loanAmount = collateralAmount;

      await expect(
        collateralizedLoan.connect(lender).fundLoan(0, { value: loanAmount }),
      ).to.emit(collateralizedLoan, "LoanFunded");

      const loan = await collateralizedLoan.loans(0);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.isFunded).to.be.true;
    });
  });

  // Test suite for repaying a loan
  describe("Repaying a Loan", function () {
    it("Enables the borrower to repay the loan fully", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower, lender } = await loadFixture(
        deployCollateralizedLoanFixture,
      );

      // Borrower deposits collateral and requests a loan
      const collateralAmount = ethers.parseEther("1");
      const interestRate = 500; // 5%
      const duration = 3600; // 1 hour

      await collateralizedLoan
        .connect(borrower)
        .depositCollateralAndRequestLoan(interestRate, duration, {
          value: collateralAmount,
        });

      // Lender funds the loan
      await collateralizedLoan
        .connect(lender)
        .fundLoan(0, { value: collateralAmount });

      // Fetch the loan details from the contract
      const loan = await collateralizedLoan.loans(0);
      const loanAmount = loan.loanAmount; // bigint
      const loanInterestRate = loan.interestRate; // bigint

      // Borrower repays the loan
      const interest = (loanAmount * loanInterestRate) / 10000n;
      const totalRepayment = loanAmount + interest;

      await expect(
        collateralizedLoan
          .connect(borrower)
          .repayLoan(0, { value: totalRepayment }),
      ).to.emit(collateralizedLoan, "LoanRepaid");

      const updatedLoan = await collateralizedLoan.loans(0);
      expect(updatedLoan.isRepaid).to.be.true;
    });
  });

  // Test suite for claiming collateral
  describe("Claiming Collateral", function () {
    it("Permits the lender to claim collateral if the loan isn't repaid on time", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower, lender } = await loadFixture(
        deployCollateralizedLoanFixture,
      );

      // Borrower deposits collateral and requests a loan
      const collateralAmount = ethers.parseEther("1");
      const interestRate = 500; // 5%
      const duration = 1; // 1 second for testing

      await collateralizedLoan
        .connect(borrower)
        .depositCollateralAndRequestLoan(interestRate, duration, {
          value: collateralAmount,
        });

      // Lender funds the loan
      await collateralizedLoan
        .connect(lender)
        .fundLoan(0, { value: collateralAmount });

      // Fetch the loan from the contract
      const loan = await collateralizedLoan.loans(0);

      // Convert loan.duration (bigint) to number
      const loanDuration = Number(loan.duration);

      // Increase time to simulate loan duration passing
      await ethers.provider.send("evm_increaseTime", [loanDuration + 1]);
      await ethers.provider.send("evm_mine");

      // Lender claims the collateral
      await expect(
        collateralizedLoan.connect(lender).claimCollateral(0),
      ).to.emit(collateralizedLoan, "CollateralClaimed");

      const updatedLoan = await collateralizedLoan.loans(0);
      expect(updatedLoan.isRepaid).to.be.true;
    });
  });
});
