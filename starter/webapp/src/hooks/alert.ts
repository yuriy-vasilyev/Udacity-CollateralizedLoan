import { AlertContext } from "@/context/alert";
import { useContext } from "react";

export const useAlert = () => {
  return useContext(AlertContext);
};
