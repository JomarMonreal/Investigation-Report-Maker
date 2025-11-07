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
}
