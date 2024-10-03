import { FC } from "react";
import useContract from "@/hooks/useContract";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAlert } from "@/hooks/alert";
import { getErrorMessage } from "@/helpers";
import { ethers } from "ethers";

interface FormType {
  loanId: number;
  amount: number;
}

const INITIAL_VALUES: FormType = {
  loanId: 0,
  amount: 0,
};

const validationSchema = Yup.object().shape({
  loanId: Yup.number().required("This field is required."),
  amount: Yup.number()
    .required("This field is required.")
    .min(1, "The minimum amount is 1 ETH."),
});

const LoanRepayForm: FC = () => {
  const { contract } = useContract();
  const { alert } = useAlert();

  const formik = useFormik<FormType>({
    initialValues: INITIAL_VALUES,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const tx = await contract?.repayLoan(values.loanId, {
          value: ethers.parseEther(values.amount.toString()),
        });

        await tx.wait();

        formik.resetForm();

        alert({
          type: "success",
          message: "Loan repaid successfully!",
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
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Repay a Loan
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Borrowers repay the loan with interest before the due date.
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Upon successful repayment, the contract returns the collateral
                to the borrower.
              </p>
            </div>

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
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Amount
                </label>
                <div className="mt-2">
                  <div className="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-600 sm:max-w-md">
                    <input
                      type="text"
                      id="amount"
                      className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      {...formik.getFieldProps("amount")}
                    />
                    <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
                      ether
                    </span>
                  </div>
                </div>
                {formik.touched.amount && formik.errors.amount ? (
                  <p className="mt-3 text-sm leading-6 text-red-600">
                    {formik.errors.amount}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    You must send the exact loan amount in ETH that was
                    requested.
                  </p>
                )}
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  disabled={formik.isSubmitting}
                >
                  Repay Loan
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoanRepayForm;
