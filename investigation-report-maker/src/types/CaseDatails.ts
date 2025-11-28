// ---------------------------------------------------------------------------
// Basic value types
// ---------------------------------------------------------------------------

export type CasePriority = "Low" | "Medium" | "High" | "Critical";

export type IsoDate = `${number}-${number}-${number}`;        // e.g. "2025-11-26"
export type Time24h = `${number}:${number}`;                  // e.g. "14:30"

export type Sex = "Male" | "Female" | "Other" | "Prefer Not To Say";

export type CivilStatus =
  | "Single"
  | "Married"
  | "Widowed"
  | "Separated"
  | "Other";

export type ArrestType =
  | "Warrant"
  | "InFlagranteDelicto"
  | "HotPursuit"
  | "VoluntarySurrender"
  | "Not yet arrested";

export type WitnessType =
  | "CivilianEyewitness"
  | "ArrestingOfficer"
  | "PoseurBuyer"
  | "Expert"
  | "Other";

export type ComplainantRole =
  | "PrivateComplainant"
  | "LawEnforcementComplainant";

export type IdentificationMethod =
  | "CaughtInTheAct"
  | "IdentifiedByComplainant"
  | "IdentifiedByWitness"
  | "IdentifiedByInformant"
  | "PhotoLineup"
  | "InPersonLineup"
  | "Other";

export type SearchType =
  | "None"
  | "BodySearch"
  | "VehicleSearch"
  | "PremisesSearch";

export type InventoryType =
  | "None"
  | "InventoryOnly"
  | "PhotographyOnly"
  | "InventoryAndPhotography";


  /**
 * Structured mailing address within the Philippines.
 */
export interface PhilippineAddress {
  /**
   * Apartment, unit, floor, building name, and house or lot number.
   * Example: "Unit 3B, Bldg. 5, Lot 12"
   */
  buildingOrHouse?: string;

  /**
   * Street name.
   * Example: "Lopez Avenue"
   */
  street?: string;

  /**
   * Subdivision, village, or residential complex, if any.
   * Example: "Marymount Subdivision"
   */
  subdivisionOrVillage?: string;

  /**
   * Sitio or purok, if applicable.
   * Example: "Purok 2"
   */
  sitioOrPurok?: string;

  /**
   * Barangay name.
   * Example: "Barangay Batong Malake"
   */
  barangay: string;

  /**
   * City or municipality.
   * Example: "Los Baños"
   */
  cityOrMunicipality: string;

  /**
   * Province name.
   * For highly urbanized / independent cities, this may repeat the city
   * or use the parent province for administrative purposes.
   * Example: "Laguna"
   */
  province: string;

  /**
   * Region label or code (e.g., "Region IV-A", "CALABARZON", "NCR").
   */
  region?: string;

  /**
   * Four-digit ZIP/postal code.
   * Example: "4030"
   */
  postalCode?: string;

  /**
   * Country name. For Philippine addresses, always "Philippines".
   */
  country: 'Philippines';
}


// ---------------------------------------------------------------------------
// Shared person and officer types
// ---------------------------------------------------------------------------

export interface Person {
  /** Full legal name. */
  fullName: string;

  /** Age in years, if available. */
  age?: number;

  /** Date of birth, if known. */
  dateOfBirth?: IsoDate;

  /** Sex of the person. */
  sex?: Sex;

  /** Citizenship or nationality. */
  citizenship?: string;

  /** Civil status of the person. */
  civilStatus?: CivilStatus;

  /** Complete home or mailing address. */
  address: string;

  /** Structured address components. */
  completeAddress: PhilippineAddress;

  /** Primary contact number, if available. */
  contactNumber?: string;

  /** Email address, if available. */
  email?: string;
}

export interface Officer extends Person {
  /** Rank or position (e.g., "PO3", "Police Staff Sergeant"). */
  rankOrPosition: string;

  /** Unit, station, or office of assignment. */
  unitOrStation: string;

  /** Badge or ID number, if any. */
  badgeNumber: string;
}

export interface Complainant extends Person {
  /** Whether the complainant is also the victim. */
  isVictim: boolean;

  /** Role of the complainant in the case. */
  role: ComplainantRole;
}

export interface Suspect {
  /** Full name of the suspect or accused. */
  fullName: string;

  /** Known aliases or nicknames. */
  aliases?: string[];

  /** Sex of the suspect. */
  sex?: Sex;

  /** Occupation, if known. */
  occupation?: string;

  /** Home or last known address, if known. */
  address?: string;

  /** How this suspect was identified. */
  identificationMethod?: IdentificationMethod;

  /** Description or explanation of the identification method. */
  identificationDetails?: string;

  /** Relationship to the complainant or witnesses, if any. */
  relationshipToComplainantOrWitnesses?: string;

  /** Narrative focused on the suspect's acts/events. */
  suspectEventsNarrative?: string;
}

export interface Witness extends Person {
  /** Classification of the witness. */
  witnessType: WitnessType;

  /** Relationship to the complainant or accused, if any. */
  relationToComplainantOrAccused?: string;

  /** Where the witness was and what they were doing during the incident. */
  locationDuringIncident: string;

  /** What the witness personally saw, heard, or did. */
  observationNarrative: string;

  /** Factors affecting the quality of observation (lighting, distance, obstructions, etc.). */
  observationConditions?: string;
}

export interface PoseurBuyer extends Officer {
  /** Whether the real identity is confidential. */
  isConfidential: boolean;

  /** Code name or alias used in the operation, if any. */
  codeName?: string;

  /** Narrative of the negotiation and sale from the poseur buyer's perspective. */
  poseurBuyerNarrative?: string;
}

// ---------------------------------------------------------------------------
// Evidence and chain of custody
// ---------------------------------------------------------------------------

export interface EvidenceItem {
  /** Short label for the item (e.g., "Heat-sealed plastic sachet"). */
  label: string;

  /** Detailed description and markings on the item. */
  description: string;

  /** Quantity or weight, if applicable. */
  quantityOrWeight?: string;

  /** Exact place where the item was recovered. */
  recoveryLocation: string;

  /** Date when the item was seized. */
  seizureDate: IsoDate;

  /** Time when the item was seized. */
  seizureTime: Time24h;

  /** Name of the first officer who had custody of this item. */
  firstCustodianName: string;

  /** Chain-of-custody history for this specific item. */
  chainOfCustody: ChainOfCustodyEntry[];

  /** Whether inventory/photography was performed. */
  inventoryType?: InventoryType;

  /** Persons present during inventory and/or photographing. */
  personsPresentDuringInventory?: string;
}

export interface ChainOfCustodyEntry {
  /** Name of the person transferring custody. */
  from: string;

  /** Name of the person receiving custody. */
  to: string;

  /** Date of the transfer. */
  date: IsoDate;

  /** Time of the transfer. */
  time: Time24h;

  /** Purpose of the transfer (e.g., "laboratory examination", "court presentation"). */
  purpose: string;

  /** Reference, such as receipt number or logbook entry. */
  reference?: string;
}

// ---------------------------------------------------------------------------
// Incident timeline / officer events
// ---------------------------------------------------------------------------

export interface OfficerEvent {
  /** Date of the event. */
  date: IsoDate;

  /** Time of the event. */
  time: Time24h;

  /** Location of the event. */
  location: string;

  /** Action taken by officers (e.g., "conducted surveillance", "served warrant"). */
  action: string;

  /** People involved in this specific event. */
  peopleInvolved: string;

  /** Materials or tools used (e.g., marked money, vehicle, equipment). */
  materialsUsed: string;
}

// ---------------------------------------------------------------------------
// Arrest and post-arrest details
// ---------------------------------------------------------------------------

export interface ArrestDetails {
  /** Type of arrest performed. */
  arrestType: ArrestType;

  /** Warrant number, issuing court, date, and offense (if by warrant). */
  warrantDetails?: string;

  /** Date of arrest. */
  arrestDate: IsoDate;

  /** Time of arrest. */
  arrestTime: Time24h;

  /** Exact place of arrest. */
  arrestLocation: string;

  /** Officer who physically effected the arrest. */
  arrestingOfficer: Officer;

  /** Description of words/actions when effecting the arrest (identification, announcement, etc.). */
  arrestExecutionNarrative: string;

  /** Whether the suspect's rights were informed. */
  rightsInformed: boolean;

  /** How and in what language the rights were explained, if applicable. */
  rightsExplanationDetails?: string;

  /** Type of search, if any, associated with the arrest. */
  searchType: SearchType;

  /** Legal basis of the search (consent, incident to arrest, warrant, etc.). */
  searchBasis?: string;

  /** Narrative description of the search conducted. */
  searchNarrative?: string;

  /** Station or office where the suspect was brought and time of arrival. */
  transportAndBookingDetails?: string;

  /** Medical examination details, if any (place, time, doctor, summary). */
  medicalExaminationDetails?: string;

  /** Any spontaneous statements or admissions by the suspect. */
  spontaneousStatements?: string;
}

// ---------------------------------------------------------------------------
// Buy-bust / entrapment operation details (for poseur buyer affidavit)
// ---------------------------------------------------------------------------

export interface PreOperationDetails {
  /** Whether this case involved a buy-bust or entrapment operation. */
  isBuyBustOperation: boolean;

  /** Pre-operation report number or reference, if any. */
  preOperationReportNumber?: string;

  /** Date of pre-operation briefing. */
  briefingDate?: IsoDate;

  /** Time of pre-operation briefing. */
  briefingTime?: Time24h;

  /** Summary of the pre-operation plan (targets, roles, objectives). */
  preOperationPlanSummary?: string;

  /** Whether an informant was used. */
  informantUsed?: boolean;

  /** Total amount of marked money, if used. */
  markedMoneyTotalAmount?: number;

  /** Description of denominations and serial numbers of marked money. */
  markedMoneyDetails?: string;

  /** Description of markings on the marked money. */
  markedMoneyMarkings?: string;

  /** Intended transaction location (address and description). */
  intendedTransactionLocation?: string;

  /** Summary of conversation or negotiation before the sale. */
  negotiationSummary?: string;

  /** Exact acts showing sale or delivery from an operational perspective. */
  saleOrDeliveryNarrative?: string;

  /** Agreed signal that the transaction was completed. */
  completionSignalDescription?: string;
}

// ---------------------------------------------------------------------------
// Core case details – main aggregate root
// ---------------------------------------------------------------------------

export interface CaseDetails {
  // --- Case information -----------------------------------------------------

  /** System or blotter case number. */
  caseNumber: string;

  /** Case title or caption (e.g., "People vs. Juan Dela Cruz"). */
  caseTitle: string;

  /** Date of the incident. */
  incidentDate: IsoDate;

  /** Time of the incident (start or primary time). */
  incidentTime: Time24h;

  /** Date when the report or case record was prepared. */
  reportDate: IsoDate;

  /** Time when the report or case record was prepared. */
  reportTime: Time24h;

  /** General incident type (e.g., "Sale of illegal drugs", "Robbery"). */
  incidentType: string;

  /** Exact place of incident (address, landmarks, description). */
  incidentLocation: string;

  /** Station or unit handling the case (investigating unit). */
  investigatingUnit: string;

  /** Priority level of the case. */
  priority: CasePriority;

  // --- Parties --------------------------------------------------------------

  /** Complainant or reporting person. */
  complainant: Complainant;

  /** Suspect or accused parties. */
  suspects: Suspect[];

  /** Witnesses to the incident. */
  witnesses: Witness[];

  // --- Officers and assignments --------------------------------------------

  /** Officer formally assigned to the case (case investigator). */
  assignedOfficer: Officer;

  /** Arresting officers involved in the operation. */
  arrestingOfficers: Officer[];

  /** Poseur buyer, if any. */
  poseurBuyer?: PoseurBuyer;

  /** Officer administering oaths or affidavits, if tracked. */
  administeringOfficer?: Officer;

  // --- Operation / buy-bust details ----------------------------------------

  /** Details specific to buy-bust or entrapment operations. */
  preOperationDetails?: PreOperationDetails;

  // --- Arrest and post-arrest procedure ------------------------------------

  /** Details about the arrest and post-arrest processes. */
  arrestDetails?: ArrestDetails;

  // --- Evidence and chain of custody ---------------------------------------

  /** Evidence items seized in connection with this case. */
  evidence: EvidenceItem[];

  // --- Narratives -----------------------------------------------------------

  /** Short summary of evidence or key evidence notes. */
  evidenceSummary: string;

  /** Short summary of the incident (one to a few paragraphs). */
  incidentSummary: string;

  /** Full narrative of the incident for affidavits and reports. */
  narrative: string;

  // --- Timeline / officer events -------------------------------------------

  /**
   * Chronological officer events (surveillance, buy-bust, arrest, transport, etc.).
   * This replaced your original `officerEvents` type with stricter date/time types.
   */
  officerEvents: OfficerEvent[];
}
