import { createContext } from "react";
import type { PoliceOfficerContextProps } from "./PoliceOfficerProvider";

export const PoliceOfficerContext = createContext<PoliceOfficerContextProps | undefined>(undefined);
