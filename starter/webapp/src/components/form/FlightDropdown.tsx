import { FC, Fragment } from "react";
import { UnregisteredFlight } from "@/types/RawLoan";
import { formatFlightDate } from "@/helpers";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";

interface FlightDropdownProps {
  flights: UnregisteredFlight[];
  loading: boolean;
  value: number;
  onChange: (flight: number) => void;
  error?: string;
}

const FlightDropdown: FC<FlightDropdownProps> = ({
  flights,
  loading,
  value,
  onChange,
  error,
}) => {
  const chosenFlight = flights[value] ?? null;

  const generateFlightLabel = (flight: UnregisteredFlight) =>
    flight
      ? `${flight.name} - ${flight.origin} - ${flight.destination} - ${formatFlightDate(flight.datetime)}`
      : "Select a flight";

  return (
    <>
      {loading && <p>Loading flights...</p>}
      {flights.length === 0 && <p>No flights found.</p>}
      {flights.length > 0 && (
        <>
          <Listbox value={value} onChange={(value) => onChange(value)}>
            {({ open }) => (
              <>
                <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                  Flight
                </Listbox.Label>
                <div className="relative mt-2">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6">
                    <span className="block truncate">
                      {chosenFlight
                        ? generateFlightLabel(chosenFlight)
                        : "Select a flight"}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronUpDownIcon
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {flights.length > 0 &&
                        flights.map((item, index) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? "bg-emerald-600 text-white"
                                  : "text-gray-900",
                                "relative cursor-default select-none py-2 pl-3 pr-9",
                              )
                            }
                            value={index}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "block truncate",
                                  )}
                                >
                                  {generateFlightLabel(item)}
                                </span>

                                {selected ? (
                                  <span
                                    className={classNames(
                                      active
                                        ? "text-white"
                                        : "text-emerald-600",
                                      "absolute inset-y-0 right-0 flex items-center pr-4",
                                    )}
                                  >
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
          {error && (
            <p className="mt-3 text-sm leading-6 text-red-600">{error}</p>
          )}
        </>
      )}
    </>
  );
};

export default FlightDropdown;
