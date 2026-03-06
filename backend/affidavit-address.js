const hasUsableText = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lowered = trimmed.toLowerCase();
  return lowered !== "undefined" && lowered !== "null";
};

const safeText = (value, placeholder) => (hasUsableText(value) ? value.trim() : placeholder);

const resolveAddressObject = (value) => {
  if (!value || typeof value !== "object") return null;

  if ("cityOrMunicipality" in value || "province" in value) {
    return value;
  }

  if ("completeAddress" in value && value.completeAddress && typeof value.completeAddress === "object") {
    return value.completeAddress;
  }

  if ("address" in value && value.address && typeof value.address === "object") {
    return value.address;
  }

  return null;
};

const extractMunicipalityProvince = (value) => {
  const location = resolveAddressObject(value);
  if (!location) return { municipality: undefined, province: undefined };

  const municipality =
    location.cityOrMunicipality ??
    location.cityMunicipality ??
    location.municipality ??
    location.city ??
    location.town;

  const province =
    location.province ??
    location.prov ??
    location.state;

  return { municipality, province };
};

const municipalityProvinceFormatter = (value) => {
  const { municipality, province } = extractMunicipalityProvince(value);
  return `${safeText(municipality, "[MISSING MUNICIPALITY]")}, ${safeText(province, "[MISSING PROVINCE]")}`;
};

const formatAddressForReport = (value) => {
  if (typeof value === "string") {
    return safeText(value, "[MISSING ADDRESS]");
  }

  if (value && typeof value === "object" && typeof value.address === "string") {
    const directAddress = safeText(value.address, "");
    if (directAddress) return directAddress;
  }

  const location = resolveAddressObject(value);
  if (!location) {
    return municipalityProvinceFormatter(value);
  }

  return municipalityProvinceFormatter(location);
};

module.exports = {
  extractMunicipalityProvince,
  formatAddressForReport,
  municipalityProvinceFormatter,
  resolveAddressObject,
};
