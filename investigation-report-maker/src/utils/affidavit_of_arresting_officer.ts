import type { CaseDetails } from "../types/CaseDatails";
import type { CustomElement } from "./slateHelpers";

export const affidavitOfArrestingOfficer = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Lalawigan ng",
        "bold": true
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Bayan ng Mansalay"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "x -------------------------------- x"
      }
    ]
  },
  {
    "type": "paragraph",
    "children": [
      {
        "text": "SINUMPAANG SALAYSAY",
        "bold": true,
        "underline": true
      }
    ],
    "align": "center"
  },
  {
    "type": "paragraph",
    "align": "center",
    "children": [
      {
        "text": "(Affidavit of Arresting Officer)",
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "justify",
    "children": [
      {
        "text": "AKO, {{ARRESTING_OFFICER_NAME}} {{ARRESTING_OFFICER_AGE}} taong-gulang, kagawad ng Pulisya at nakatalaga sa {{ARRESTING_OFFICER_STATION}}, naninirahan sa {{ARRESTING_OFFICER_HOME_ADDRESS}}, matapos na makapanumpa alinsunod sa ipinag-uutos ng Saligang Batas ng Plilipinas ay malaya at kusang loob na nagsasalaysay gaya ng mga sumusunod:"
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "justify",
    "children": [
      {
        "text": "{{Narration}}"
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "justify",
    "children": [
      {
        "text": ""
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "justify",
    "children": [
      {
        "text": "SA KATUNAYAN NG LAHAT",
        "bold": true
      },
      {
        "text": " ay lumagda ako ng aking pangalan at apelyido ngayong ika-{{DAY}} ng {{MONTH}} {{YEAR}} dito sa {{LOCATION}}."
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "left",
    "children": [
      {
        "text": ""
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "right",
    "children": [
      {
        "text": "{{ARRESTING_OFFICER_NAME}}"
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "right",
    "children": [
      {
        "text": "(Nagsalaysay)"
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "center",
    "children": [
      {
        "text": "CERTIFICATION",
        "underline": true,
        "bold": true
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "justify",
    "children": [
      {
        "text": "SWORN AND SUBSCRIBED TO BEFORE ME this {{DAY}} day of {{MONTH}} {{YEAR}} at {{LOCATION}} and further certify that I personally examined the affaint and that I am fully satisfied that she voluntarily executed and understood the contents of the foregoing statements."
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "left",
    "children": [
      {
        "text": ""
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "right",
    "children": [
      {
        "text": "{{ADMINISTERING_OFFICER_NAME}}"
      }
    ]
  },
  {
    "type": "paragraph",
    "align": "right",
    "children": [
      {
        "text": "Administering Officer"
      }
    ]
  }
];

type PlaceholderKey =
  | "ARRESTING_OFFICER_NAME"
  | "ARRESTING_OFFICER_AGE"
  | "ARRESTING_OFFICER_STATION"
  | "ARRESTING_OFFICER_HOME_ADDRESS"
  | "Narration"
  | "DAY"
  | "MONTH"
  | "YEAR"
  | "LOCATION"
  | "ADMINISTERING_OFFICER_NAME";

type PlaceholderMap = Record<PlaceholderKey, string>;

/**
 * Deep-clone a value in a simple, JSON-safe way.
 * If you target modern browsers/node, you can swap for structuredClone.
 */
function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Replaces {{PLACEHOLDER}} occurrences in all text nodes of a Slate document.
 */
function substituteAffidavitPlaceholders(
  nodes: CustomElement[],
  placeholders: PlaceholderMap
): CustomElement[] {
  const cloned = deepClone(nodes);

  const replaceInText = (text: string): string =>
    text.replace(/{{(.*?)}}/g, (_match, rawKey: string) => {
      const key = rawKey.trim() as PlaceholderKey;
      const value = placeholders[key];
      return value ?? "";
    });

  const visit = (node: any): void => {
    if (typeof node.text === "string") {
      node.text = replaceInText(node.text);
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(visit);
    }
  };

  cloned.forEach(visit);
  return cloned;
}


export type AffidavitOfArrestingOfficerData = {
  arrestingOfficerName: string;
  arrestingOfficerAge: string;
  arrestingOfficerStation: string;
  arrestingOfficerHomeAddress: string;
  narration: string;
  day: string;
  month: string;
  year: string;
  location: string;
  administeringOfficerName: string;
}


function computeOfficerAge(caseDetails: CaseDetails): string {
  const officer = caseDetails.assignedOfficer;

  // Prefer explicit age if provided.
  if (typeof officer.age === "number") {
    return officer.age.toString();
  }

  if (!officer.dateOfBirth) {
    return "";
  }

  const dob = new Date(officer.dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return "";
  }

  const refDate = new Date(caseDetails.reportDate || new Date());
  let age = refDate.getFullYear() - dob.getFullYear();
  const monthDiff = refDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age.toString();
}

export const convertCaseDetailToAD = (
  caseDetails: CaseDetails
): AffidavitOfArrestingOfficerData => {
  const reportDate = new Date(caseDetails.reportDate);
  const safeDate = Number.isNaN(reportDate.getTime()) ? new Date() : reportDate;

  return {
    administeringOfficerName: caseDetails.administeringOfficer?.fullName || '',
    arrestingOfficerAge: computeOfficerAge(caseDetails),
    arrestingOfficerHomeAddress: caseDetails.assignedOfficer.address,
    arrestingOfficerName: caseDetails.assignedOfficer.fullName,
    arrestingOfficerStation: caseDetails.assignedOfficer.unitOrStation,
    day: safeDate.getDate().toString(),
    location: caseDetails.incidentLocation,
    month: (safeDate.getMonth() + 1).toString(),
    narration: "",
    year: safeDate.getFullYear().toString(),
  };
};

export const createAffidavitOfArrestingOfficerTemplate = (
  narration: string,
  ad: AffidavitOfArrestingOfficerData
): CustomElement[] => {
  const placeholders: PlaceholderMap = {
    ADMINISTERING_OFFICER_NAME: ad.administeringOfficerName ?? "",
    ARRESTING_OFFICER_AGE: ad.arrestingOfficerAge ?? "",
    ARRESTING_OFFICER_HOME_ADDRESS: ad.arrestingOfficerHomeAddress ?? "",
    ARRESTING_OFFICER_NAME: ad.arrestingOfficerName ?? "",
    ARRESTING_OFFICER_STATION: ad.arrestingOfficerStation ?? "",
    DAY: ad.day ?? "",
    LOCATION: ad.location ?? "",
    MONTH: ad.month ?? "",
    Narration: narration ?? "",
    YEAR: ad.year ?? "",
  };

  const filled = substituteAffidavitPlaceholders(
    affidavitOfArrestingOfficer,
    placeholders
  );

  return filled;
};
