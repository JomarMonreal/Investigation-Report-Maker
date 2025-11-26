import { createContext } from "react";
import type { CaseDetails } from "../types/CaseDatails";

export interface CaseDetailsContextProps {
  caseDetails: CaseDetails;
  setCaseDetails: React.Dispatch<React.SetStateAction<CaseDetails>>;
}

const CaseDetailsContext = createContext<CaseDetailsContextProps | undefined>(undefined);

export default CaseDetailsContext;

