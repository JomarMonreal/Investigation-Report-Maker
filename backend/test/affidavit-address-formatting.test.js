const test = require("node:test");
const assert = require("node:assert/strict");

const { formatAddressForReport } = require("../affidavit-address");

test("uses structured completeAddress when direct address text is blank", () => {
  const formatted = formatAddressForReport({
    address: "   ",
    completeAddress: {
      cityOrMunicipality: "Los Banos",
      province: "Laguna",
    },
  });

  assert.equal(formatted, "Los Banos, Laguna");
});

test("uses direct address text when available", () => {
  const formatted = formatAddressForReport({
    address: "Brgy. Timugan, Los Banos, Laguna",
    completeAddress: {
      cityOrMunicipality: "Los Banos",
      province: "Laguna",
    },
  });

  assert.equal(formatted, "Brgy. Timugan, Los Banos, Laguna");
});

test("treats literal undefined text as missing and falls back to structured address", () => {
  const formatted = formatAddressForReport({
    address: "undefined",
    completeAddress: {
      cityOrMunicipality: "Calamba",
      province: "Laguna",
    },
  });

  assert.equal(formatted, "Calamba, Laguna");
});
