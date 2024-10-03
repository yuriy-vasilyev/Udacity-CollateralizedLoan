import { FC } from "react";
import useContract from "@/hooks/useContract";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useAlert } from "@/hooks/alert";
import { getErrorMessage } from "@/helpers";
import { ethers } from "ethers";

interface FormType {
  collateralAmount: number;
  interestRate: number;
  duration: number;
}

const INITIAL_VALUES: FormType = {
  collateralAmount: 1,
  interestRate: 500,
  duration: 0,
};

const validationSchema = Yup.object().shape({
  collateralAmount: Yup.number()
    .required("This field is required.")
    .min(1, "The minimum amount is 1 ETH."),
  interestRate: Yup.number()
    .required("This field is required.")
    .positive("This field must be a positive number.")
    .min(100, "The minimum value is 100 which means 1%."),
  duration: Yup.number()
    .required("This field is required.")
    .min(3600, "The minimum duration is 3600 seconds (1 hour)."),
});

const LoanRequestForm: FC = () => {
  const { contract } = useContract();
  const { alert } = useAlert();

  const formik = useFormik<FormType>({
    initialValues: INITIAL_VALUES,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const tx = await contract?.depositCollateralAndRequestLoan(
          values.interestRate,
          values.duration,
          {
            value: ethers.parseEther(values.collateralAmount.toString()),
          },
        );

        await tx.wait();

        formik.resetForm();

        alert({
          type: "success",
          message: "Loan requested successfully!",
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
                Request a Loan
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Borrowers deposit ETH as collateral.
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                The contract records the loan request and gives the collateral
                as the loan amount.
              </p>
            </div>

            <div className="md:col-span-2">
              <div>
                <label
                  htmlFor="collateralAmount"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Collateral amount
                </label>
                <div className="mt-2">
                  <div className="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-600 sm:max-w-md">
                    <input
                      type="text"
                      id="collateralAmount"
                      className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      {...formik.getFieldProps("collateralAmount")}
                    />
                    <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
                      ether
                    </span>
                  </div>
                </div>
                {formik.touched.collateralAmount &&
                formik.errors.collateralAmount ? (
                  <p className="mt-3 text-sm leading-6 text-red-600">
                    {formik.errors.collateralAmount}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Min. 1 ether
                  </p>
                )}
              </div>
              <div className="mt-6">
                <label
                  htmlFor="interestRate"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Interest rate
                </label>
                <div className="mt-2">
                  <div className="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-600 sm:max-w-md">
                    <input
                      type="text"
                      id="interestRate"
                      className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      {...formik.getFieldProps("interestRate")}
                    />
                    <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
                      basis points
                    </span>
                  </div>
                </div>
                {formik.touched.interestRate && formik.errors.interestRate ? (
                  <p className="mt-3 text-sm leading-6 text-red-600">
                    {formik.errors.interestRate}
                  </p>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Basis points are 1/100 of a percent. 500 basis points is 5%.
                  </p>
                )}
              </div>
              <div className="mt-6">
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Duration
                </label>
                <div className="mt-2">
                  <div className="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-emerald-600 sm:max-w-md">
                    <input
                      type="text"
                      id="duration"
                      className="block w-full flex-1 border-0 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      {...formik.getFieldProps("duration")}
                    />
                    <span className="flex select-none items-center pr-3 text-gray-500 sm:text-sm">
                      seconds
                    </span>
                  </div>
                </div>
                {formik.touched.duration && formik.errors.duration && (
                  <p className="mt-3 text-sm leading-6 text-red-600">
                    {formik.errors.duration}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  disabled={formik.isSubmitting}
                >
                  Request Loan
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoanRequestForm;
