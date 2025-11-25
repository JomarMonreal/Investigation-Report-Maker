export type CasePriority = "Low" | "Medium" | "High" | "Critical";

export interface PoliceCaseDetails {
  caseNumber: string;
  caseTitle: string;
  date: string;        // ISO date (YYYY-MM-DD)
  time: string;        // 24h time (HH:MM)
  incidentType: string;
  location: string;
  reportingPerson: string;
  contactNumber: string;
  involvedParties: string;  // comma- or newline-separated
  assignedOfficer: string;
  badgeNumber: string;
  priority: CasePriority;
  evidenceSummary: string;
  narrative: string;        // big text area

  arrestingOfficerAge: number;
  arrestingOfficerStation: string;
  arrestingOfficerHomeAddress: string;
  currentDate: string; // ISO date (YYYY-MM-DD)
  administeringOfficer: string;

  suspectName: string;
  suspectOccupation: string;
  suspectHomeAddress: string;
  suspectEvents: string;

  officerEvents: Array<{
    time: string; // 24h time (HH:MM)
    location: string;
    action: string;
    peopleInvolved: string;
    materialsUsed: string;
  }>;
}
