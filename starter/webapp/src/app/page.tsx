"use client";

import LoanRequestForm from "./LoanRequestForm";
import Section from "@/app/Section";
import LoanFundForm from "@/app/LoanFundForm";
import LoanRepayForm from "@/app/LoanRepayForm";
import ClaimCollateralForm from "@/app/ClaimCollateralForm";
import GetLoanInfoForm from "@/app/GetLoanInfoForm";

export default function Home() {
  return (
    <div>
      <Section>
        <GetLoanInfoForm />
      </Section>
      <Section>
        <LoanRequestForm />
      </Section>
      <Section>
        <LoanFundForm />
      </Section>
      <Section>
        <LoanRepayForm />
      </Section>
      <Section>
        <ClaimCollateralForm />
      </Section>
    </div>
  );
}
