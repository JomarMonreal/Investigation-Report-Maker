import { createContext } from "react";
import type { CaseDetails } from "../types/CaseDatails";
import type { Descendant } from "slate";

export type CaseDetailsSlateValue = Descendant[];

export interface CaseDetailsContextProps {
  caseDetails: CaseDetails;
  setCaseDetails: React.Dispatch<React.SetStateAction<CaseDetails>>;
  isFetching: boolean;
  setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
  slateValue: CaseDetailsSlateValue;
  setSlateValue: React.Dispatch<React.SetStateAction<CaseDetailsSlateValue>>;
}

const CaseDetailsContext = createContext<CaseDetailsContextProps | undefined>(undefined);

export default CaseDetailsContext;

