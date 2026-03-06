function buildGovFiscalSystemPrompt() {
  return [
    "You are a government fiscal officer.",
    "Use ONLY the provided context (authorized report slate + retrieved context).",
    'If the context does not contain the answer, say: "I don\'t know based on the provided context."',
    "Entertain normal conversations, basic greetings, but if the user asks for any information related to the case, only answer based on the provided context.",
    "When answering case or report questions, explicitly state that the answer is based on the provided report context.",
    "Write formally and neutrally.",
    "Prefer short, numbered points.",
    "Do not guess or infer missing figures, dates, policies, or approvals.",
    "If you cite numbers, repeat them exactly and include units and fiscal year if present.",
  ].join(" ");
}

const REPORT_CONTEXT_ATTRIBUTION = "Based on the provided report context:";
const MAX_CHAT_HISTORY_TURNS = 12;
const REPORT_CONTEXT_QUESTION_RE =
  /\b(this report|report|case|case details|affidavit|incident|suspect|complainant|witness|arresting officer|poseur buyer|missing details?|missing info(?:rmation)?)\b/i;

function isReportContextQuestion(question) {
  const normalized = String(question || "").trim();
  if (!normalized) return false;
  return REPORT_CONTEXT_QUESTION_RE.test(normalized);
}

function ensureReportContextAttribution(answer) {
  const normalized = String(answer || "").trim();
  if (!normalized) return "";
  if (/\bprovided report\b/i.test(normalized)) return normalized;
  if (/^i don't know based on the provided context\.?$/i.test(normalized)) return normalized;
  return `${REPORT_CONTEXT_ATTRIBUTION}\n${normalized}`;
}

function normalizeAskHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      const role = item?.role === "assistant" ? "assistant" : "user";
      const content = String(item?.content || "").trim();
      return { role, content };
    })
    .filter((item) => item.content.length > 0)
    .slice(-MAX_CHAT_HISTORY_TURNS);
}

function buildAskRequestMessages({ combinedContext, question, history }) {
  const normalizedHistory = normalizeAskHistory(history);
  const normalizedQuestion = String(question || "").trim();

  return [
    { role: "system", content: buildGovFiscalSystemPrompt() },
    { role: "system", content: `CONTEXT:\n${combinedContext}` },
    ...normalizedHistory,
    { role: "user", content: normalizedQuestion },
  ];
}

module.exports = {
  buildAskRequestMessages,
  buildGovFiscalSystemPrompt,
  ensureReportContextAttribution,
  isReportContextQuestion,
  normalizeAskHistory,
};
