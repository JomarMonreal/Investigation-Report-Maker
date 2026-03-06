const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildGovFiscalSystemPrompt,
  ensureReportContextAttribution,
  isReportContextQuestion,
} = require("../chat-context");

test("asks for missing details in report are treated as report-context questions", () => {
  assert.equal(isReportContextQuestion("what's missing detail in this report?"), true);
});

test("report-context answers are prefixed when attribution is missing", () => {
  const answer = ensureReportContextAttribution("1. Missing incident date.\n2. Missing witness name.");

  assert.equal(
    answer,
    "Based on the provided report context:\n1. Missing incident date.\n2. Missing witness name."
  );
});

test("existing context attribution is preserved", () => {
  const answer = ensureReportContextAttribution(
    "Based on the provided report context: Missing witness address."
  );

  assert.equal(answer, "Based on the provided report context: Missing witness address.");
});

test("ask-system prompt requires explicit report-context attribution", () => {
  const prompt = buildGovFiscalSystemPrompt();
  assert.match(prompt, /explicitly state that the answer is based on the provided report context/i);
});
