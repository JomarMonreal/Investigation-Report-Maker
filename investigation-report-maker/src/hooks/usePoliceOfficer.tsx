import { useContext } from "react";
import type { PoliceOfficerContextProps } from "../context/PoliceOfficerProvider";
import { PoliceOfficerContext } from "../context/PoliceOfficerContext";

export const usePoliceOfficer = (): PoliceOfficerContextProps => {
  const context = useContext(PoliceOfficerContext);
  if (!context) {
    throw new Error("usePoliceOfficer must be used within a PoliceOfficerProvider");
  }
  return context;
};