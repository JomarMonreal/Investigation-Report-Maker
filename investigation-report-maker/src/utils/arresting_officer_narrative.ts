// Adjust the import path to your actual types location
import type { CaseDetails } from "../types/CaseDatails";

/**
 * Utility: checks if a string is non-empty after trimming.
 */
function hasText(value: string | undefined | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Builds a Tagalog case narrative using the structured data in CaseDetails.
 *
 * It uses:
 * - Case metadata (caseNumber, caseTitle, incidentDate/time, etc.)
 * - Complainant information
 * - Suspects and witnesses
 * - Pre-operation / buy-bust details (if any)
 * - Arrest details (if any)
 * - Evidence items and evidenceSummary
 * - Officer events (timeline)
 * - The free-form `narrative` field at the end as “detalyadong salaysay”
 *
 * Optional sections are included only when corresponding data exists.
 */
export function buildCaseNarrativeFromCaseDetails(
  caseDetails: CaseDetails
): string {
  const paragraphs: string[] = [];

  // ---------------------------------------------------------------------------
  // 1. Case intro / incident overview
  // ---------------------------------------------------------------------------

  {
    const parts: string[] = [];

    // Case number and title
    parts.push(
      `Ito ay tumutukoy sa kasong may bilang ${caseDetails.caseNumber} na may pamagat na “${caseDetails.caseTitle}”.`
    );

    // Incident date, time, type, location
    const incidentDateTime: string[] = [];

    if (hasText(caseDetails.incidentDate)) {
      incidentDateTime.push(`noong ${caseDetails.incidentDate}`);
    }
    if (hasText(caseDetails.incidentTime)) {
      incidentDateTime.push(`bandang ${caseDetails.incidentTime}`);
    }
    if (incidentDateTime.length > 0) {
      parts.push(
        `Ang insidente ay naganap ${incidentDateTime.join(" ")} sa ${caseDetails.incidentLocation}.`
      );
    } else {
      parts.push(`Ang insidente ay naganap sa ${caseDetails.incidentLocation}.`);
    }

    // Incident type and investigating unit
    const typeAndUnit: string[] = [];
    if (hasText(caseDetails.incidentType)) {
      typeAndUnit.push(
        `na iniuuri bilang ${caseDetails.incidentType.toLowerCase()}`
      );
    }
    if (hasText(caseDetails.investigatingUnit)) {
      typeAndUnit.push(
        `na kasalukuyang iniimbestigahan ng ${caseDetails.investigatingUnit}`
      );
    }
    if (typeAndUnit.length > 0) {
      parts.push(`Ang insidenteng ito ay ${typeAndUnit.join(" at ")}.`);
    }

    // Priority
    parts.push(
      `Ang kasong ito ay may antas ng prayoridad na ${caseDetails.priority}.`
    );

    paragraphs.push(parts.join(" "));
  }

  // ---------------------------------------------------------------------------
  // 2. Complainant
  // ---------------------------------------------------------------------------

  {
    const c = caseDetails.complainant;
    const parts: string[] = [];

    const base: string[] = [];

    if (hasText(c.fullName)) {
      base.push(c.fullName);
    }

    if (typeof c.age === "number") {
      base.push(`${c.age} taong-gulang`);
    }

    if (c.citizenship) {
      base.push(c.citizenship);
    }

    if (c.civilStatus) {
      base.push(c.civilStatus.toLowerCase());
    }

    if (hasText(c.address)) {
      base.push(`nakatira sa ${c.address}`);
    }

    if (base.length > 0) {
      parts.push(`Ang nagrereklamo sa kasong ito ay si ${base.join(", ")}.`);
    } else {
      parts.push(`May isang nagrereklamong partido sa kasong ito.`);
    }

    // Role and whether victim
    const roleParts: string[] = [];
    roleParts.push(
      c.role === "PrivateComplainant"
        ? "isang pribadong complainant"
        : "isang complainant mula sa law enforcement"
    );

    if (c.isVictim) {
      roleParts.push("na siya ring biktima ng insidente");
    }

    parts.push(`Siya ay ${roleParts.join(" at ")}.`);

    paragraphs.push(parts.join(" "));
  }

  // ---------------------------------------------------------------------------
  // 3. Suspects
  // ---------------------------------------------------------------------------

  if (Array.isArray(caseDetails.suspects) && caseDetails.suspects.length > 0) {
    const lines: string[] = [];

    caseDetails.suspects.forEach((s, index) => {
      const parts: string[] = [];

      const indexLabel =
        caseDetails.suspects.length > 1 ? `(${index + 1}) ` : "";

      if (hasText(s.fullName)) {
        parts.push(`${indexLabel}si ${s.fullName}`);
      } else {
        parts.push(`${indexLabel}ang isang hindi pa kilalang suspek`);
      }

      if (Array.isArray(s.aliases) && s.aliases.length > 0) {
        const aliasList = s.aliases.join(", ");
        parts.push(`na kilala rin sa alyas na ${aliasList}`);
      }

      if (s.sex) {
        parts.push(`na may kasariang ${s.sex.toLowerCase()}`);
      }

      if (s.occupation) {
        parts.push(`at ang kanyang trabaho ay ${s.occupation}`);
      }

      if (s.address) {
        parts.push(`na nakatira o huling nanirahan sa ${s.address}`);
      }

      if (s.identificationMethod) {
        parts.push(
          `na nakilala sa pamamagitan ng ${s.identificationMethod.toLowerCase()}`
        );
      }

      if (s.identificationDetails) {
        parts.push(`(${s.identificationDetails})`);
      }

      if (s.relationshipToComplainantOrWitnesses) {
        parts.push(
          `na may ugnayan sa complainant/saksi bilang ${s.relationshipToComplainantOrWitnesses}`
        );
      }

      lines.push(parts.join(", ") + ".");
    });

    paragraphs.push(
      `Ang sumusunod ang kinikilalang suspek/suspek sa kasong ito:\n\n` +
        lines.join("\n")
    );
  }

  // ---------------------------------------------------------------------------
  // 4. Witnesses
  // ---------------------------------------------------------------------------

  if (Array.isArray(caseDetails.witnesses) && caseDetails.witnesses.length > 0) {
    const lines: string[] = [];

    caseDetails.witnesses.forEach((w, index) => {
      const parts: string[] = [];
      const indexLabel =
        caseDetails.witnesses.length > 1 ? `(${index + 1}) ` : "";

      if (hasText(w.fullName)) {
        parts.push(`${indexLabel}si ${w.fullName}`);
      } else {
        parts.push(`${indexLabel}isang saksi`);
      }

      parts.push(
        `na isang ${w.witnessType} at naninirahan sa ${w.address || "hindi matukoy na tirahan"}`
      );

      if (w.relationToComplainantOrAccused) {
        parts.push(
          `na may ugnayan sa complainant/akusado bilang ${w.relationToComplainantOrAccused}`
        );
      }

      parts.push(
        `Na sa oras ng insidente, siya ay nasa ${w.locationDuringIncident} at personal na ${w.observationNarrative}.`
      );

      if (w.observationConditions) {
        parts.push(
          `Ang kanyang obserbasyon ay naapektuhan ng mga sumusunod na kondisyon: ${w.observationConditions}.`
        );
      }

      lines.push(parts.join(" "));
    });

    paragraphs.push(
      `May mga sumusunod na saksi na may mahalagang kaalaman sa insidente:\n\n` +
        lines.join("\n\n")
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Pre-operation / buy-bust (if any)
  // ---------------------------------------------------------------------------

  if (caseDetails.preOperationDetails?.isBuyBustOperation) {
    const p = caseDetails.preOperationDetails;
    const parts: string[] = [];

    parts.push(
      `Bago ang mismong insidente, isinagawa ang isang buy-bust/entrapment operation.`
    );

    if (p.preOperationReportNumber) {
      parts.push(
        `Ito ay nakasaad sa Pre-Operation Report na may bilang ${p.preOperationReportNumber}.`
      );
    }

    if (p.briefingDate || p.briefingTime) {
      const bits: string[] = [];
      if (p.briefingDate) bits.push(`noong ${p.briefingDate}`);
      if (p.briefingTime) bits.push(`bandang ${p.briefingTime}`);
      parts.push(
        `Nagkaroon ng pre-operation briefing ${bits.join(" ")} kung saan tinalakay ang plano ng operasyon.`
      );
    }

    if (p.preOperationPlanSummary) {
      parts.push(
        `Sa naturang briefing, napagkasunduan ang sumusunod na plano: ${p.preOperationPlanSummary}.`
      );
    }

    if (typeof p.informantUsed === "boolean") {
      parts.push(
        p.informantUsed
          ? `Isang informant ang ginamit upang makipag-ugnayan sa suspek.`
          : `Walang informant na ginamit sa operasyong ito.`
      );
    }

    if (typeof p.markedMoneyTotalAmount === "number") {
      parts.push(
        `Ang kabuuang halagang ginamit bilang marked money ay ${p.markedMoneyTotalAmount}.`
      );
    }

    if (p.markedMoneyDetails) {
      parts.push(
        `Ang denominasyon at serial number ng marked money ay ang mga sumusunod: ${p.markedMoneyDetails}.`
      );
    }

    if (p.markedMoneyMarkings) {
      parts.push(
        `Ang marked money ay may natatanging marka: ${p.markedMoneyMarkings}.`
      );
    }

    if (p.intendedTransactionLocation) {
      parts.push(
        `Ang napagkasunduang lugar ng transaksyon ay sa ${p.intendedTransactionLocation}.`
      );
    }

    if (p.negotiationSummary) {
      parts.push(
        `Bago ang aktuwal na bentahan, nagkaroon ng pag-uusap na ganito ang buod: ${p.negotiationSummary}.`
      );
    }

    if (p.saleOrDeliveryNarrative) {
      parts.push(
        `Sa mismong bentahan/delivery, ang mga sumunod na pangyayari ay: ${p.saleOrDeliveryNarrative}.`
      );
    }

    if (p.completionSignalDescription) {
      parts.push(
        `Ang napagkasunduang hudyat ng pagkumpleto ng transaksyon ay: ${p.completionSignalDescription}.`
      );
    }

    paragraphs.push(parts.join(" "));
  }

  // ---------------------------------------------------------------------------
  // 6. Arrest details (if any)
  // ---------------------------------------------------------------------------

  if (caseDetails.arrestDetails) {
    const a = caseDetails.arrestDetails;
    const parts: string[] = [];

    parts.push(
      `Ang pag-aresto ay isinagawa sa paraang ${a.arrestType}.`
    );

    if (a.warrantDetails) {
      parts.push(`Ang detalye ng warrant, kung mayroon, ay: ${a.warrantDetails}.`);
    }

    const dateTime: string[] = [];
    if (a.arrestDate) dateTime.push(`noong ${a.arrestDate}`);
    if (a.arrestTime) dateTime.push(`bandang ${a.arrestTime}`);
    if (dateTime.length > 0) {
      parts.push(
        `Ang aresto ay isinagawa ${dateTime.join(" ")} sa ${a.arrestLocation}.`
      );
    } else {
      parts.push(`Ang aresto ay isinagawa sa ${a.arrestLocation}.`);
    }

    const officer = a.arrestingOfficer;
    const officerBits: string[] = [];
    if (hasText(officer.rankOrPosition)) officerBits.push(officer.rankOrPosition);
    if (hasText(officer.fullName)) officerBits.push(officer.fullName);
    if (hasText(officer.unitOrStation))
      officerBits.push(`ng ${officer.unitOrStation}`);

    if (officerBits.length > 0) {
      parts.push(`Ang pisikal na pag-aresto ay isinagawa ni ${officerBits.join(" ")}.`);
    }

    if (a.arrestExecutionNarrative) {
      parts.push(
        `Sa pag-aresto, ang mga ginawa at sinabi ng mga pulis ay ang mga sumusunod: ${a.arrestExecutionNarrative}.`
      );
    }

    if (typeof a.rightsInformed === "boolean") {
      parts.push(
        a.rightsInformed
          ? `Ipinaalam sa inarestong suspek ang kanyang mga karapatan alinsunod sa Konstitusyon.`
          : `Hindi naipaliwanag sa suspek ang kanyang mga karapatan sa oras ng pag-aresto.`
      );
    }

    if (a.rightsExplanationDetails) {
      parts.push(
        `Ang pagpapaliwanag sa karapatan ay ginawa sa/wika: ${a.rightsExplanationDetails}.`
      );
    }

    if (a.searchType && a.searchType !== "None") {
      parts.push(
        `Matapos ang pag-aresto, isinagawa ang isang ${a.searchType.toLowerCase()} alinsunod sa ${a.searchBasis || "legal na batayan"}.`
      );
    }

    if (a.searchNarrative) {
      parts.push(
        `Ang detalye ng isinagawang paghahalughog ay ang mga sumusunod: ${a.searchNarrative}.`
      );
    }

    if (a.transportAndBookingDetails) {
      parts.push(
        `Pagkatapos maaresto, ang suspek ay dinala sa ${a.transportAndBookingDetails}.`
      );
    }

    if (a.medicalExaminationDetails) {
      parts.push(
        `Isinailalim ang suspek sa medikal na eksaminasyon na may mga sumusunod na detalye: ${a.medicalExaminationDetails}.`
      );
    }

    if (a.spontaneousStatements) {
      parts.push(
        `Sa panahon ng pag-aresto/pagdadala, ang suspek ay boluntaryong nagbigay ng mga pahayag: ${a.spontaneousStatements}.`
      );
    }

    paragraphs.push(parts.join(" "));
  }

  // ---------------------------------------------------------------------------
  // 7. Evidence and chain of custody
  // ---------------------------------------------------------------------------

  if (Array.isArray(caseDetails.evidence) && caseDetails.evidence.length > 0) {
    const lines: string[] = [];

    caseDetails.evidence.forEach((e, index) => {
      const parts: string[] = [];
      const indexLabel =
        caseDetails.evidence.length > 1 ? `(${index + 1}) ` : "";

      parts.push(`${indexLabel}${e.label}, ${e.description}`);

      if (e.quantityOrWeight) {
        parts.push(`na may sukat/dami na ${e.quantityOrWeight}`);
      }

      parts.push(`na narekober sa ${e.recoveryLocation}`);

      parts.push(
        `noong ${e.seizureDate} bandang ${e.seizureTime} mula sa kustodiya ni ${e.firstCustodianName}`
      );

      if (e.inventoryType && e.inventoryType !== "None") {
        parts.push(
          `kung saan isinagawa ang ${e.inventoryType.toLowerCase()} na inventory/photography`
        );
      }

      if (e.personsPresentDuringInventory) {
        parts.push(
          `na dinaluhan nina ${e.personsPresentDuringInventory} sa panahon ng inventory/photography`
        );
      }

      // Chain of custody: brief summary per item
      if (Array.isArray(e.chainOfCustody) && e.chainOfCustody.length > 0) {
        const chainLines = e.chainOfCustody.map((coc) => {
          return `Mula kay ${coc.from} patungo kay ${coc.to} noong ${coc.date} bandang ${coc.time} para sa layuning ${coc.purpose}${coc.reference ? ` (Ref: ${coc.reference})` : ""}.`;
        });
        parts.push(
          `Ang chain of custody para sa item na ito ay ang mga sumusunod: ${chainLines.join(
            " "
          )}`
        );
      }

      lines.push(parts.join(", ") + ".");
    });

    const summaryParts: string[] = [];
    if (hasText(caseDetails.evidenceSummary)) {
      summaryParts.push(caseDetails.evidenceSummary);
    } else {
      summaryParts.push(
        "Ang mga ebidensiya na nakalap sa kasong ito ay ang mga sumusunod:"
      );
    }

    paragraphs.push(summaryParts.join(" ") + "\n\n" + lines.join("\n\n"));
  }

  // ---------------------------------------------------------------------------
  // 8. Officer events / operational timeline
  // ---------------------------------------------------------------------------

  if (
    Array.isArray(caseDetails.officerEvents) &&
    caseDetails.officerEvents.length > 0
  ) {
    const lines: string[] = caseDetails.officerEvents.map((ev) => {
      return `Noong ${ev.date} bandang ${ev.time}, sa ${ev.location}, isinagawa ang ${ev.action} na kinabibilangan nina ${ev.peopleInvolved} gamit ang ${ev.materialsUsed}.`;
    });

    paragraphs.push(
      `Ang kronolohiya ng mga kilos ng mga operatiba sa kasong ito ay ang mga sumusunod:\n\n` +
        lines.join("\n")
    );
  }

  // ---------------------------------------------------------------------------
  // 9. Reporter / report preparation
  // ---------------------------------------------------------------------------

  {
    const parts: string[] = [];

    parts.push(
      `Ang ulat na ito ay inihanda noong ${caseDetails.reportDate} bandang ${caseDetails.reportTime}.`
    );

    const officer = caseDetails.assignedOfficer;
    const nameBits: string[] = [];
    if (officer.rankOrPosition) nameBits.push(officer.rankOrPosition);
    if (officer.fullName) nameBits.push(officer.fullName);

    if (nameBits.length > 0) {
      parts.push(`Ito ay inihanda ni ${nameBits.join(" ")}.`);
    }

    if (officer.unitOrStation) {
      parts.push(`Siya ay nakatalaga sa ${officer.unitOrStation}.`);
    }

    if (officer.badgeNumber) {
      parts.push(`May badge/ID number na ${officer.badgeNumber}.`);
    }

    paragraphs.push(parts.join(" "));
  }

  // ---------------------------------------------------------------------------
  // 10. Attached free-form narrative (if any)
  // ---------------------------------------------------------------------------

  if (hasText(caseDetails.narrative)) {
    paragraphs.push(
      `Bilang karagdagan, ang detalyadong salaysay ng pangyayari ay ang sumusunod:\n\n${caseDetails.narrative}`
    );
  }

  // Final result: paragraphs separated by blank lines
  return paragraphs.join("\n\n");
}
