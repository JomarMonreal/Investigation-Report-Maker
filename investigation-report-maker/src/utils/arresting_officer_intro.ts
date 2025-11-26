// Adjust the import path to where your types live.
import type { Officer } from "../types/CaseDatails";

/**
 * Builds the standard Tagalog opening paragraph for the Affidavit of Arresting Officer.
 *
 * - Uses Officer fields (fullName, age, rankOrPosition, unitOrStation, address).
 * - Skips clauses when the corresponding field is missing or blank.
 * - Keeps the “AKO, …” structure consistent with your sample.
 */
export function buildArrestingOfficerAffidavitIntro(
  arrestingOfficer: Officer
): string {
  const hasText = (value: string | undefined): boolean =>
    typeof value === "string" && value.trim().length > 0;

  let intro = "AKO";

  // Name
  if (hasText(arrestingOfficer.fullName)) {
    intro += `, ${arrestingOfficer.fullName.trim()}`;
  }

  // Age
  if (typeof arrestingOfficer.age === "number") {
    intro += `, ${arrestingOfficer.age} taong-gulang`;
  }

  // Rank / position and station
  const hasRank = hasText(arrestingOfficer.rankOrPosition);
  const hasStation = hasText(arrestingOfficer.unitOrStation);

  if (hasRank || hasStation) {
    const rankPhrase = hasRank
      ? arrestingOfficer.rankOrPosition!.trim()
      : "kagawad ng Pulisya";

    if (hasStation) {
      intro += `, isang ${rankPhrase} na nakatalaga sa ${arrestingOfficer.unitOrStation!.trim()}`;
    } else {
      intro += `, isang ${rankPhrase}`;
    }
  }

  // Home address
  if (hasText(arrestingOfficer.address)) {
    intro += `, naninirahan sa ${arrestingOfficer.address!.trim()}`;
  }

  // Standard oath phrase
  intro +=
    ", matapos na makapanumpa alinsunod sa ipinag-uutos ng Saligang Batas ng Pilipinas ay malaya at kusang loob na nagsasalaysay gaya ng mga sumusunod:";

  return intro;
}
