import { FC, useState } from "react";
import useContract from "@/hooks/useContract";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAlert } from "@/hooks/alert";
import { getErrorMessage, parseLoan } from "@/helpers";
import { ParsedLoan } from "@/types/ParsedLoan";

interface FormType {
  loanId: number;
}

const INITIAL_VALUES: FormType = {
  loanId: 0,
};

const validationSchema = Yup.object().shape({
  loanId: Yup.number().required("This field is required."),
});

const GetLoanInfoForm: FC = () => {
  const { contract } = useContract();
  const { alert } = useAlert();
  const [currentLoan, setCurrentLoan] = useState<
    (ParsedLoan & { id: number }) | null
  >(null);

  const formik = useFormik<FormType>({
    initialValues: INITIAL_VALUES,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const tx = await contract?.loans(values.loanId);

        setCurrentLoan({
          id: values.loanId,
          ...parseLoan(tx),
        });

        console.log("currentLoan", parseLoan(tx));

        formik.resetForm();

        alert({
          type: "success",
          message: "Loan info fetched successfully!",
          autoClose: 5000,
        });
      } catch (error) {
        alert({
          type: "error",
          message: getErrorMessage(error),
        });
      }
    },
  });

  return (
    <div>
      <div className="space-y-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Get Loan Info
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Everybody can fetch the loan info by providing the loan ID.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} noValidate>
            <div className="md:col-span-2">
              <div>
                <label
                  htmlFor="loanId"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Loan ID
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="new-airline-address"
                    className="block w-full rounded-md border-0 px-3 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    {...formik.getFieldProps("loanId")}
                  />
                  {formik.touched.loanId && formik.errors.loanId && (
                    <p className="mt-3 text-sm leading-6 text-red-600">
                      {formik.errors.loanId}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  disabled={formik.isSubmitting}
                >
                  Get loan info
                </button>
              </div>
            </div>
          </form>
        </div>
        {currentLoan && (
          <div className="p-4 border rounded-md mt-4">
            <h2 className="text-xl font-bold mb-4">
              Loan Details (ID: {currentLoan.id})
            </h2>
            <p>
              <strong>Borrower:</strong> {currentLoan.borrower}
            </p>
            <p>
              <strong>Lender:</strong>{" "}
              {currentLoan.isFunded ? currentLoan.lender : "N/A"}
            </p>
            <p>
              <strong>Collateral Amount:</strong> {currentLoan.collateralAmount}{" "}
              ETH
            </p>
            <p>
              <strong>Loan Amount:</strong> {currentLoan.loanAmount} ETH
            </p>
            <p>
              <strong>Interest Rate:</strong> {currentLoan.interestRate / 100}%
            </p>
            <p>
              <strong>Duration:</strong> {currentLoan.duration} seconds
            </p>
            <p>
              <strong>Start Time:</strong>{" "}
              {currentLoan.isFunded
                ? new Date(currentLoan.startTime * 1000).toLocaleString()
                : "N/A"}
            </p>
            <p>
              <strong>End Time:</strong>{" "}
              {currentLoan.isFunded
                ? new Date(
                    (currentLoan.startTime + currentLoan.duration) * 1000,
                  ).toLocaleString()
                : "N/A"}
            </p>
            <p>
              <strong>Funded:</strong> {currentLoan.isFunded ? "Yes" : "No"}
            </p>
            <p>
              <strong>Repaid:</strong> {currentLoan.isRepaid ? "Yes" : "No"}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCurrentLoan(null)}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetLoanInfoForm;
