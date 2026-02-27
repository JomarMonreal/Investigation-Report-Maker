import React, { useState } from "react";
import CaseDetailsContext, { type CaseDetailsContextProps }  from "./CaseDetailsContext";
import type { CaseDetails, IsoDate, Time24h } from "../types/CaseDatails";

const getCurrentReportDateTime = (): { reportDate: IsoDate; reportTime: Time24h } => {
  const now = new Date();
  const reportDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-") as IsoDate;
  const reportTime = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join(":") as Time24h;

  return { reportDate, reportTime };
};

export const CaseDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reportDate, reportTime } = getCurrentReportDateTime();

  const [slateValue, setSlateValue] = useState<CaseDetailsContextProps["slateValue"]>([
    {
      children: [{ text: "" }],
    },
  ]);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    caseNumber: "",
    caseTitle: "",
    incidentDate: "" as IsoDate,
    incidentTime: "" as Time24h,
    reportDate,
    reportTime,
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

  const [isFetching, setIsFetching] = useState<boolean>(false);

  return (
    <CaseDetailsContext.Provider value={{ caseDetails, setCaseDetails, isFetching, setIsFetching, slateValue, setSlateValue }}>
      {children}
    </CaseDetailsContext.Provider>
  );
};

export default CaseDetailsProvider;
