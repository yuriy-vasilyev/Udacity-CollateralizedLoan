"use client";

import {
  createContext,
  FC,
  Fragment,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import classNames from "classnames";
import Link from "next/link";
import { Transition } from "@headlessui/react";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertParams {
  type: AlertType;
  message: string;
  closable?: boolean;
  actionLink?: {
    label: string;
    url: string;
  };
  autoClose?: number;
}

type AlertContext = { alert: (params: AlertParams) => void };

const initialState: AlertContext = { alert: () => undefined };

export const AlertContext = createContext<AlertContext>(initialState);

const DEFAULT_PARAMS: AlertParams = {
  type: "success",
  message: "",
  closable: true,
  actionLink: undefined,
  autoClose: 0,
};

interface AlertIconProps {
  type: AlertType;
  color: string;
}

const AlertIcon: FC<AlertIconProps> = ({ type, color }) => {
  const classes = classNames(`h-5 w-5 text-${color}-400`, {
    "text-green-400": type === "success",
    "text-red-400": type === "error",
    "text-blue-400": type === "info",
    "text-yellow-400": type === "warning",
  });

  return (
    <>
      {"success" === type && (
        <CheckCircleIcon className={classes} aria-hidden="true" />
      )}
      {"error" === type && (
        <XCircleIcon className={classes} aria-hidden="true" />
      )}
      {"info" === type && (
        <InformationCircleIcon className={classes} aria-hidden="true" />
      )}
      {"warning" === type && (
        <ExclamationTriangleIcon className={classes} aria-hidden="true" />
      )}
    </>
  );
};

interface AlertProviderProps {
  children: ReactNode;
}

const AlertProvider: FC<AlertProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [color, setColor] = useState("");

  useEffect(() => {
    let accentColor = "";

    switch (params.type) {
      case "success":
        accentColor = "green";
        break;

      case "error":
        accentColor = "red";
        break;

      case "info":
        accentColor = "blue";
        break;

      case "warning":
        accentColor = "yellow";
        break;
    }

    setColor(accentColor);
  }, [params]);

  const alert = (params: AlertParams) => {
    setParams((prevParams) => ({ ...prevParams, ...params }));
    setOpen(true);

    if (undefined !== params.autoClose && params.autoClose > 0) {
      setTimeout(() => {
        setOpen(false);
      }, params.autoClose * 1000);
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Transition
        show={open}
        as={Fragment}
        enter="transition-opacity transition-transform duration-75"
        enterFrom="opacity-0 -translate-y-full"
        enterTo="opacity-100 translate-y-0"
        leave="transition-opacity transition-transform duration-75"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-full"
      >
        <div className="fixed top-5 z-50 w-full px-2">
          <div
            className={classNames(
              "w-50 mx-auto max-w-3xl rounded-md p-4 shadow-xl",
              {
                "bg-green-50": params.type === "success",
                "bg-red-50": params.type === "error",
                "bg-blue-50": params.type === "info",
                "bg-yellow-50": params.type === "warning",
              },
            )}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertIcon type={params.type} color={color} />
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p
                  className={classNames("text-sm break-all", {
                    "text-green-800": params.type === "success",
                    "text-red-800": params.type === "error",
                    "text-blue-800": params.type === "info",
                    "text-yellow-800": params.type === "warning",
                  })}
                >
                  {params.message}
                </p>
                {params.actionLink && (
                  <p className="mt-3 text-sm md:ml-6 md:mt-0">
                    <Link
                      href={params.actionLink.url}
                      className={classNames("whitespace-nowrap font-medium", {
                        "text-green-700 hover:text-green-600":
                          params.type === "success",
                        "text-red-700 hover:text-red-600":
                          params.type === "error",
                        "text-blue-700 hover:text-blue-600":
                          params.type === "info",
                        "text-yellow-700 hover:text-yellow-600":
                          params.type === "warning",
                      })}
                    >
                      {params.actionLink.label}
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </p>
                )}
              </div>
              {params.closable && (
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={classNames(
                        "inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2",
                        {
                          "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50":
                            params.type === "success",
                          "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50":
                            params.type === "error",
                          "bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50":
                            params.type === "info",
                          "bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50":
                            params.type === "warning",
                        },
                      )}
                    >
                      <span className="sr-only">Dismiss</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </AlertContext.Provider>
  );
};

export default AlertProvider;
