const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildAskRequestMessages,
  buildGovFiscalSystemPrompt,
  ensureReportContextAttribution,
  isReportContextQuestion,
  normalizeAskHistory,
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

test("ask history normalization keeps only non-empty latest turns", () => {
  const history = normalizeAskHistory([
    { role: "user", content: "  " },
    { role: "assistant", content: "First answer" },
    { role: "invalid-role", content: "Question 2" },
  ]);

  assert.deepEqual(history, [
    { role: "assistant", content: "First answer" },
    { role: "user", content: "Question 2" },
  ]);
});

test("ask request messages include context, prior turns, and current question", () => {
  const messages = buildAskRequestMessages({
    combinedContext: "sample-context",
    question: "What is missing?",
    history: [
      { role: "user", content: "Initial question" },
      { role: "assistant", content: "Initial answer" },
    ],
  });

  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /government fiscal officer/i);
  assert.deepEqual(messages[1], { role: "system", content: "CONTEXT:\nsample-context" });
  assert.deepEqual(messages[2], { role: "user", content: "Initial question" });
  assert.deepEqual(messages[3], { role: "assistant", content: "Initial answer" });
  assert.deepEqual(messages[4], { role: "user", content: "What is missing?" });
});
