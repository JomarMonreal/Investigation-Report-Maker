import { createContext } from "react";
import type { CaseDetails } from "../types/CaseDatails";

export interface CaseDetailsContextProps {
  caseDetails: CaseDetails;
  setCaseDetails: React.Dispatch<React.SetStateAction<CaseDetails>>;
  isFetching: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
}

const CaseDetailsContext = createContext<CaseDetailsContextProps | undefined>(undefined);

export default CaseDetailsContext;

