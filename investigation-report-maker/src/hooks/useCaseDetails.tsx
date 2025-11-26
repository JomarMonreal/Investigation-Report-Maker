import { useContext } from "react";
import CaseDetailsContext, { type CaseDetailsContextProps } from "../context/CaseDetailsContext";

export const useCaseDetails = (): CaseDetailsContextProps => {
  const context = useContext(CaseDetailsContext);
  if (!context) {
    throw new Error("useCaseDetails must be used within a CaseDetailsProvider");
  }
  return context;
};