import React, { useState } from "react";
import CaseDetailsContext  from "./CaseDetailsContext";
import type { CaseDetails, IsoDate, Time24h } from "../types/CaseDatails";

export const CaseDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    caseNumber: "",
    caseTitle: "",
    incidentDate: "" as IsoDate,
    incidentTime: "" as Time24h,
    reportDate: "" as IsoDate,
    reportTime: "" as Time24h,
    incidentType: "",
    incidentLocation: {
      barangay: "",
      cityOrMunicipality: "",
      province: "",
      street: "",
      postalCode: "",
      country: "Philippines",
    },
    investigatingUnit: "",
    priority: "Low",
    complainant: {
      fullName: "",
      address: "",
      isVictim: false,
      role: "PrivateComplainant",
    },
    suspects: [],
    witnesses: [],
    assignedOfficer: {
      fullName: "",
      address: "",
      rankOrPosition: "",
      unitOrStation: "",
      badgeNumber: "",
    },
    arrestingOfficers: [],
    evidence: [],
    officerEvents: [],
    policeStation: {
      name: "",
      address: {
        barangay: "",
        cityOrMunicipality: "",
        province: "",
        street: "",
        postalCode: "",
        country: "Philippines",
      },
      contactNumber: "",
      email: "",
    },
    administeringOfficer: undefined,
    evidenceSummary: "",
    incidentSummary: "",
    narrative: "",
  });

  return (
    <CaseDetailsContext.Provider value={{ caseDetails, setCaseDetails }}>
      {children}
    </CaseDetailsContext.Provider>
  );
};

export default CaseDetailsProvider;