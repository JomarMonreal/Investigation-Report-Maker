const express = require('express');
const {Ollama} = require('ollama');
const z = require('zod');
const fs = require('fs');
const path = require('path');
const { retrieveContext } = require("./rag");

const CustomTextSchema = z.object({
	  text: z.string(),
	  bold: z.boolean().optional(),
	  italic: z.boolean().optional(),
	  underline: z.boolean().optional(),
	  fontSize: z.string().optional(),
});

const CustomElementSchema = z.object({
	  type: z.enum(["paragraph", "heading"]),
	  level: z.number().optional(),
	  children: z.array(CustomTextSchema),
});

const CustomElementArraySchema = z.array(CustomElementSchema);

const systemPrompt = "You are an assistant that creates crime narratives based on the given details for an affidafit. Do not fabricate events not mentioned in the details. Respond in JSON. After generating the narrative, check each sentence if it is stated in the details provided. If the sentence is not stated in the details provided, it should be underlined by adding an underline attribute to the text object (example: {text: 'this should be underlined', underline: true}). Separate the narrative into different statements of events. Each event will be its own paragraph. Make sure all sentences are in tagalog.";

const dummyDetails = {
	suspect: "Ronaldo Martin",
	weapon: "kitchen knife",
	date: "November 20, 2025",
	time: "2:30 AM",
	place: "Lopez Ave., Los Banos, Laguna",
	crime: "attempted homicide",
	victim: "Asher Hernandez",
};

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

const municipalityProvinceFormatter = (incidentLocation) => {
  const { municipality: muni, province } = extractMunicipalityProvince(incidentLocation);
  return `${safe(muni, "[MISSING MUNICIPALITY]")}, ${safe(province, "[MISSING PROVINCE]")}`;
};


const app = express();
const PORT = 3000;
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'affidavit-of-poseur-buyer.json');

app.use(express.json());

// Create a fetch function with custom timeout
const fetchWithTimeout = (url, init = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 minutes

  return fetch(url, {
    ...init,
    signal: init.signal || controller.signal
  }).finally(() => clearTimeout(timeoutId))
};

const LEADING_LIST_MARKER_RE = /^\s*(?:\d+[\.\)]|\(\d+\)|[-*•])\s+/;

const safe = (v, placeholder = "[MISSING]") => {
  if (v === null || v === undefined) return placeholder;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return placeholder;
    if (trimmed.toLowerCase() === "undefined" || trimmed.toLowerCase() === "null") {
      return placeholder;
    }
    return trimmed;
  }
  return String(v);
};

const safeUpper = (v, placeholder = "[MISSING]") => safe(v, placeholder).toUpperCase();

const safeDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

// Month name (Tagalog-friendly output later if you want)
const monthName = (d) =>
  d ? d.toLocaleString("en-US", { month: "long" }) : "[MISSING MONTH]";

const formatAddressForReport = (value) => {
  if (typeof value === "string") {
    return safe(value, "[MISSING ADDRESS]");
  }
  if (value && typeof value === "object" && typeof value.address === "string") {
    return safe(value.address, "[MISSING ADDRESS]");
  }

  const location = resolveAddressObject(value);
  if (!location) {
    return municipalityProvinceFormatter(value);
  }

  return municipalityProvinceFormatter(location);
};

let cachedTemplate = null;

const getTemplate = () => {
  if (cachedTemplate) return cachedTemplate;
  const templateData = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  cachedTemplate = JSON.parse(templateData);
  return cachedTemplate;
};

const ollama = new Ollama({ fetch: fetchWithTimeout });

const DEFAULT_STATION = {
  name: "Los Banos Police Station",
  address: { cityOrMunicipality: "Los Banos", province: "Laguna" },
};

const AFFIDAVIT_CONFIG = {
  "poseur-buyer": {
    subtitle: "(Affidavit of Poseur Buyer)",
    missingMessage: "Poseur buyer details are required.",
    resolveAffiant: (details) => details?.poseurBuyer,
    descriptor: (affiant) =>
      `kagawad ng Pulisya at nakatalaga sa ${safe(affiant?.unitOrStation, "[MISSING UNIT/STATION]")}`,
  },
  complainant: {
    subtitle: "(Affidavit of Complainant)",
    missingMessage: "Complainant details are required.",
    resolveAffiant: (details) => details?.complainant,
    descriptor: () => "isang nagrereklamo sa kasong ito",
  },
  witness: {
    subtitle: "(Affidavit of Witness)",
    missingMessage: "At least one witness is required.",
    resolveAffiant: (details, reqBody) => {
      const witnesses = Array.isArray(details?.witnesses) ? details.witnesses : [];
      if (witnesses.length === 0) return undefined;
      const rawIndex = Number(reqBody?.witnessIndex);
      const idx = Number.isInteger(rawIndex) && rawIndex >= 0 ? rawIndex : 0;
      return witnesses[idx] ?? witnesses[0];
    },
    descriptor: () => "isang saksi sa kasong ito",
  },
};

const getAffiantAge = (affiant) => {
  if (Number.isFinite(affiant?.age)) return Math.floor(affiant.age);
  const dob = safeDate(affiant?.dateOfBirth);
  return dob ? new Date().getFullYear() - dob.getFullYear() : "[MISSING AGE]";
};

const buildAffidavitDocument = ({
  subtitle,
  affiant,
  descriptor,
  details,
  station,
  narrative,
}) => {
  const reportDate = safeDate(details?.reportDate);
  const {
    municipality: incidentMunicipality,
    province: incidentProvince,
  } = extractMunicipalityProvince(details?.incidentLocation);

  const incProvince = safe(incidentProvince, "[MISSING PROVINCE]");
  const incMuni = safe(incidentMunicipality, "[MISSING MUNICIPALITY]");
  const incPlace = municipalityProvinceFormatter(details?.incidentLocation);
  const stationAddr = formatAddressForReport(station);
  const assignedOfficerName = safe(details?.assignedOfficer?.fullName, "[MISSING OFFICER NAME]");
  const affiantName = safe(affiant?.fullName, "[MISSING NAME]");
  const affiantNameUpper = safeUpper(affiant?.fullName, "[MISSING NAME]");
  const affiantAddress = formatAddressForReport(affiant);
  const affiantAge = safe(getAffiantAge(affiant), "[MISSING AGE]");

  const header = [
    {
      type: "paragraph",
      children: [{ text: `Lalawigan ng ${incProvince}`, bold: true }],
    },
    {
      type: "paragraph",
      children: [{ text: `Bayan ng ${incMuni}` }],
    },
    {
      type: "paragraph",
      children: [{ text: "x -------------------------------- x" }],
    },
    {
      type: "paragraph",
      children: [{ text: "SINUMPAANG SALAYSAY", bold: true, underline: true }],
      align: "center",
    },
    {
      type: "paragraph",
      align: "center",
      children: [{ text: subtitle }],
    },
    {
      type: "paragraph",
      align: "justify",
      children: [
        {
          text:
            `AKO, ${affiantNameUpper} ${affiantAge} taong-gulang, ` +
            `${descriptor}, naninirahan sa ${affiantAddress}, matapos na ` +
            `makapanumpa alinsunod sa ipinag-uutos ng Saligang Batas ng Pilipinas ` +
            `ay malaya at kusang loob na nagsasalaysay gaya ng mga sumusunod:`,
        },
      ],
    },
  ];

  const footer = [
    {
      type: "paragraph",
      align: "justify",
      children: [{ text: "" }],
    },
    {
      type: "paragraph",
      align: "justify",
      children: [
        { text: "SA KATUNAYAN NG LAHAT", bold: true },
        {
          text:
            ` ay lumagda ako ng aking pangalan at apelyido ngayong ika-` +
            `${safe(reportDate?.getDate(), "[MISSING DAY]")} ng ` +
            `${reportDate ? monthName(reportDate) : "[MISSING MONTH]"} ` +
            `${safe(reportDate?.getFullYear(), "[MISSING YEAR]")} dito sa ${incPlace}.`,
        },
      ],
    },
    {
      type: "paragraph",
      align: "left",
      children: [{ text: "" }],
    },
    { type: "paragraph", align: "right", children: [{ text: affiantName }] },
    {
      type: "paragraph",
      align: "right",
      children: [{ text: "(Nagsalaysay)" }],
    },
    {
      type: "paragraph",
      align: "center",
      children: [{ text: "CERTIFICATION", underline: true, bold: true }],
    },
    {
      type: "paragraph",
      align: "justify",
      children: [
        {
          text:
            `SWORN AND SUBSCRIBED TO BEFORE ME this ` +
            `${safe(reportDate?.getDate(), "[MISSING DAY]")} day of ` +
            `${reportDate ? monthName(reportDate) : "[MISSING MONTH]"} ` +
            `${safe(reportDate?.getFullYear(), "[MISSING YEAR]")} at ` +
            `${safe(stationAddr, "[MISSING STATION ADDRESS]")} and further certify that ` +
            `I personally examined the affiant and that I am fully satisfied that ` +
            `he/she voluntarily executed and understood the contents of the foregoing statements.`,
        },
      ],
    },
    {
      type: "paragraph",
      align: "left",
      children: [{ text: "" }],
    },
    { type: "paragraph", align: "right", children: [{ text: assignedOfficerName }] },
    {
      type: "paragraph",
      align: "right",
      children: [{ text: "Administering Officer" }],
    },
  ];

  return header.concat(narrative, footer);
};

const createRagQuery = (details) => {
  const suspectNames = Array.isArray(details?.suspects)
    ? details.suspects.map((s) => s?.fullName).filter(Boolean)
    : [];

  return [
    details?.incidentType,
    details?.caseTitle,
    details?.incidentLocation?.cityOrMunicipality,
    details?.incidentLocation?.province,
    ...suspectNames,
    "affidavit",
    "elements of the crime",
    "procedure",
  ]
    .filter(Boolean)
    .join(" | ");
};

const generateNarrative = async (details, template, affidavitKind) => {
  const ragQuery = createRagQuery(details);
  const { context } = await retrieveContext(ragQuery, 5);

  const userPayload = {
    affidavitType: affidavitKind,
    caseDetails: details,
    template,
    referenceMaterials: context,
  };

  const response = await ollama.chat({
    model: "gemma3:27b",
    messages: [
      {
        role: "system",
        content:
          systemPrompt +
          "\n\nRULES:\n" +
          "1) Use ONLY the provided caseDetails and referenceMaterials.\n" +
          "2) Before marking anything as missing, search ALL parts of caseDetails (including nested objects, arrays, and narrative fields) and infer from there if present.\n" +
          "3) If still missing after checking the full caseDetails, use the exact placeholder [MISSING INFO]. Do not fabricate facts.\n" +
          "4) Output ONLY the narrative body paragraphs. Do NOT include affidavit header/footer, signatures, certification blocks, labels, or titles.\n" +
          "5) Output must match the JSON schema exactly.\n" +
          "6) Do NOT add numbering or bullets (no '1.', '2)', '-', etc.) on header or footer.\n" +
          "7) Remove duplicate information from the narrative.\n" +
          "8) The narrative should be in Tagalog.\n" +
          "9) If a fact is not explicitly in caseDetails, set underline: true on the corresponding text.\n\n",
      },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
    format: z.toJSONSchema(CustomElementArraySchema),
  });

  const raw = JSON.parse(response.message.content);
  const parsed = CustomElementArraySchema.parse(raw);

  const narrative = parsed.map((node) => {
    const children = Array.isArray(node.children) ? node.children : [];
    const normalizedChildren = children.map((child, index) => {
      if (typeof child?.text !== "string") return { text: "" };
      const text =
        index === 0
          ? child.text.replace(LEADING_LIST_MARKER_RE, "").trimStart()
          : child.text;
      return { ...child, text };
    });

    return {
      type: "paragraph",
      align: "justify",
      children: normalizedChildren.length > 0 ? normalizedChildren : [{ text: "" }],
    };
  });

  return { response, narrative };
};

const handleGenerateAffidavit = async (req, res, affidavitKind) => {
  try {
    const config = AFFIDAVIT_CONFIG[affidavitKind];
    if (!config) {
      return res.status(400).json({ error: "Invalid affidavit type." });
    }

    let template;
    try {
      template = getTemplate();
    } catch (err) {
      console.error("Error reading template:", err);
      return res.status(500).json({ error: "Template file not found" });
    }

    const details = req.body.caseDetails ? req.body.caseDetails : dummyDetails;
    const station = req.body.policeStation || details?.policeStation || DEFAULT_STATION;
    const affiant = config.resolveAffiant(details, req.body);

    if (!affiant) {
      return res.status(400).json({
        error: "Missing affidavit data",
        message: config.missingMessage,
      });
    }

    const descriptor = config.descriptor(affiant, details);
    const { response, narrative } = await generateNarrative(details, template, affidavitKind);
    const affidavitNodes = buildAffidavitDocument({
      subtitle: config.subtitle,
      affiant,
      descriptor,
      details,
      station,
      narrative,
    });

    response.message.content = JSON.stringify(affidavitNodes);
    console.log("Total Generation Time (s): " + response.total_duration / 1000000000);
    return res.status(200).send(response);
  } catch (error) {
    console.error("Error calling Ollama:", error);

    if (error.code === "UND_ERR_HEADERS_TIMEOUT") {
      return res.status(504).json({
        error: "Ollama request timeout",
        message: "The request took too long. Try a smaller model or simpler request.",
      });
    }
    if (error.message.includes("fetch failed") || error.message.includes("connect")) {
      return res.status(503).json({
        error: "Ollama service unavailable",
        message: 'Make sure Ollama is running. Run "ollama serve" in terminal.',
      });
    }
    return res.status(500).json({
      error: "Generation failed",
      message: error.message,
    });
  }
};

app.post("/api/generate", async (req, res) => handleGenerateAffidavit(req, res, "poseur-buyer"));
app.post("/api/generate/poseur-buyer", async (req, res) => handleGenerateAffidavit(req, res, "poseur-buyer"));
app.post("/api/generate/complainant", async (req, res) => handleGenerateAffidavit(req, res, "complainant"));
app.post("/api/generate/witness", async (req, res) => handleGenerateAffidavit(req, res, "witness"));

const AskSchema = z.object({
  question: z.string().min(1, "question is required"),
  slateValue: z.array(z.any()).optional(), // React-Slate Descendant[]
});

function slateToPlainText(nodes) {
  if (!Array.isArray(nodes)) return "";

  const parts = [];

  const walk = (node) => {
    if (!node || typeof node !== "object") return;

    // text leaf
    if (typeof node.text === "string") {
      parts.push(node.text);
      return;
    }

    // element with children
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child);
      parts.push("\n"); // block-ish separator
    }
  };

  for (const n of nodes) walk(n);

  return parts
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}

function buildGovFiscalSystemPrompt() {
  return [
    "You are a government fiscal officer.",
    "Use ONLY the provided context (authorized report slate + retrieved context).",
    'If the context does not contain the answer, say: "I don\'t know based on the provided context."',
	"Entertain normal conversations, basic greetings, but if the user asks for any information related to the case, only answer based on the provided context.",
    "Write formally and neutrally.",
    "Prefer short, numbered points.",
    "Do not guess or infer missing figures, dates, policies, or approvals.",
    "If you cite numbers, repeat them exactly and include units and fiscal year if present.",
  ].join(" ");
}

app.post("/api/ask", async (req, res) => {
  try {
    const parsed = AskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const { question, slateValue } = parsed.data;

    // Slate -> text (authorized report content)
    const slateContext = slateToPlainText(slateValue);

    // RAG context
    const { context: retrievedContext } = await retrieveContext(question, 5);

    const combinedContext = [
      "=== REPORT SLATE (AUTHORIZED VIEW) ===",
      slateContext || "(No report slate text.)",
      "",
      "=== RETRIEVED CONTEXT ===",
      retrievedContext || "(No retrieved context.)",
    ].join("\n");

    const response = await ollama.chat({
      model: "gemma3:latest",
      messages: [
        { role: "system", content: buildGovFiscalSystemPrompt() },
        { role: "user", content: `CONTEXT:\n${combinedContext}\n\nQUESTION:\n${question}` },
      ],
    });

    return res.status(200).json({
      answer: String(response?.message?.content ?? "").trim(),
    });
  } catch (e) {
    return res.status(500).json({
      error: "Ask failed",
      message: e?.message ?? String(e),
    });
  }
});

app.listen(PORT, (error) => {
	if (!error)
		console.log("Server is running. App is listening at port " + PORT);
	else
		console.log("Error occurred, server can't start");
});
