import type { CustomElement } from "./slateHelpers";

export const informalReport = "Date/time: Nov 5, 2025 around 8:45 in the evening\
    place: Rizal street corner Mabini ave Brgy Maligalig Los Banos Laguna\
    Type: Robbery and assault (physical)\
    \
    So the victim, name Juan Dela Cruz, 27 years old male, said he was just walking home from work when two guys came near him. They was holding something sharp, like a knife or bolo, and told him to give his things. He tried to refuse but one of them hit him in the arm then they grab his phone and wallet that had about 2k pesos. After that they ride a black motorcycle no plate number, go fast toward Lopez ave side.\
    \
    Police from Los Banos station went there maybe 10 mins after. Victim was still bleeding small wounds in arm and was brought to RHU for treatement. CCTV in nearby sari sari store and one tricycle terminal was check if it got the suspect. They still doing follow up investigation and patrol for any suspect match the desciption.\
    \
    Report by: PO2 Maria Sntos\
    Los Banos police"

export const JSONFormat = `{"content": [
{
"type": "heading",
"level": 1,
"children": [{ "text": "Investigation Report" }]
},
{
"type": "paragraph",
"children": [
{ "text": "Case Number: " },
{ "text": "2025-1123", "bold": true },
{ "text": "\nDate: " },
{ "text": "November 4, 2025", "bold": true }
]
},
{
"type": "paragraph",
"children": [
{ "text": "Investigating Officer: " },
{ "text": "Detective Jane Doe", "italic": true }
]
},
{
"type": "paragraph",
"children": [
{
"text": "Summary: On November 3, 2025, at approximately 22:30 hours, officers responded to a reported burglary at 123 Elm Street. Upon arrival, the premises were secured and initial evidence collected. Witness statements were taken, and CCTV footage was retrieved from neighboring properties."
}
]
},
{
"type": "heading",
"level": 2,
"children": [{ "text": "Evidence Collected" }]
},
{
"type": "paragraph",
"children": [
{ "text": "1. Fingerprints from the front door handle.\n" },
{ "text": "2. CCTV footage from neighbor residence.\n" },
{ "text": "3. Footwear impressions in the backyard soil.\n" }
]
},
{
"type": "heading",
"level": 2,
"children": [{ "text": "Witness Statements" }]
},
{
"type": "paragraph",
"children": [
{
"text": "Witness John Smith reported seeing a suspicious individual leaving the property around 22:15 hours. The description matches a male, approximately 6 feet tall, wearing a dark hoodie."
}
]
},
{
"type": "heading",
"level": 2,
"children": [{ "text": "Conclusion" }]
},
{
"type": "paragraph",
"children": [
{
"text": "The investigation is ongoing. Evidence has been documented and forwarded to the forensics department. Further interviews will be conducted as leads are developed."
}
]
}
]`

export const policeReportSummary: CustomElement[] = [
  {
    type: 'heading',
    level: 1,
    children: [{ text: 'Report Summary', bold: true, fontSize: '20px' }],
  },

  // A. Case Overview
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'A. Case Overview', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Case No.:', bold: true },
      { text: ' PR-2025-1106-0412   ' },
      { text: 'Incident:', bold: true },
      { text: ' Vehicle burglary at a residential lot on November 6, 2025, ~02:55 AM.' },
    ],
  },

  // B. Key Facts
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'B. Key Facts', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Rear passenger window shattered; backpack and 13-inch laptop taken from a silver sedan at 1200 Block, Oakview Apartments, Lot B.',
      },
    ],
  },

  // C. Parties
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'C. Parties', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'Victim:', bold: true },
      { text: ' Alex Morgan (DOB: 1991-03-17). ' },
      { text: 'Suspect:', bold: true },
      { text: ' Jordan Rivera (DOB: 1997-09-05), detained. ' },
      { text: 'Witness:', bold: true },
      { text: ' Casey Taylor observed the break-in and flight toward Maple Street.' },
    ],
  },

  // D. Evidence
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'D. Evidence', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Photos of damage; latent prints from door handle; recovered backpack and laptop (serial recorded); surveillance video request submitted to property management.',
      },
    ],
  },

  // E. Actions
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'E. Actions', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Area canvass conducted; suspect located two blocks east carrying matching backpack; field show-up positive; arrest made; property logged.',
      },
    ],
  },

  // F. Findings
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'F. Findings', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Probable cause established via witness account, possession of stolen property, and physical evidence consistent with forced entry.',
      },
    ],
  },

  // G. Disposition
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'G. Disposition', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Suspect booked at Central Station on felony burglary; evidence held; case forwarded to the District Attorney for charging review.',
      },
    ],
  },

  // H. Next Steps
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'H. Next Steps', bold: true, fontSize: '16px' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          'Obtain and review surveillance footage; process latent prints; coordinate property release to victim; file supplemental report with lab results.',
      },
    ],
  },

  // Footer
  {
    type: 'paragraph',
    children: [
      {
        text: 'Summary derived from the fictional incident for testing purposes.',
        italic: true,
        fontSize: '12px',
      },
    ],
  },
];

export const policeReportTemplate: CustomElement[] = [
  {
    type: "heading",
    level: 1,
    children: [{ text: "{{REPORT_TITLE}}", bold: true }],
  },

  // A. Case Overview
  {
    type: "heading",
    level: 2,
    children: [{ text: "A. Case Overview", bold: true }],
  },
  {
    type: "paragraph",
    children: [
      { text: "Case No.: ", bold: true },
      { text: "{{CASE_NUMBER}}  " },
      { text: "Incident: ", bold: true },
      { text: "{{INCIDENT_SUMMARY}}" },
    ],
  },

  // B. Key Facts
  {
    type: "heading",
    level: 2,
    children: [{ text: "B. Key Facts", bold: true }],
  },
  {
    type: "paragraph",
    children: [{ text: "{{KEY_FACTS}}" }],
  },

  // C. Parties
  {
    type: "heading",
    level: 2,
    children: [{ text: "C. Parties", bold: true }],
  },
  {
    type: "paragraph",
    children: [
      { text: "Victim: ", bold: true },
      { text: "{{VICTIM_NAME}} (DOB: {{VICTIM_DOB}}). " },
      { text: "Suspect: ", bold: true },
      { text: "{{SUSPECT_NAME}} (DOB: {{SUSPECT_DOB}}) — {{SUSPECT_STATUS}}. " },
      { text: "Witness: ", bold: true },
      { text: "{{WITNESS_STATEMENT_BRIEF}}" },
    ],
  },

  // D. Evidence
  {
    type: "heading",
    level: 2,
    children: [{ text: "D. Evidence", bold: true }],
  },
  {
    type: "paragraph",
    children: [{ text: "{{EVIDENCE_SUMMARY}}" }],
  },

  // E. Actions
  {
    type: "heading",
    level: 2,
    children: [{ text: "E. Actions", bold: true }],
  },
  {
    type: "paragraph",
    children: [{ text: "{{ACTIONS_TAKEN}}" }],
  },

  // F. Findings
  {
    type: "heading",
    level: 2,
    children: [{ text: "F. Findings", bold: true }],
  },
  {
    type: "paragraph",
    children: [{ text: "{{FINDINGS}}" }],
  },

  // G. Disposition
  {
    type: "heading",
    level: 2,
    children: [{ text: "G. Disposition", bold: true }],
  },
  {
    type: "paragraph",
    children: [{ text: "{{DISPOSITION}}" }],
  },

  // H. Next Steps
  {
    type: "heading",
    level: 2,
    children: [{ text: "H. Next Steps", bold: true }],
  },
  {
    type: "paragraph",
    children: [{ text: "{{NEXT_STEPS}}" }],
  },

  // Footer
  {
    type: "paragraph",
    children: [
      { text: "Prepared by: ", italic: true },
      { text: "{{OFFICER_NAME}} (Badge {{BADGE_NUMBER}})", italic: true },
    ],
  },
];
