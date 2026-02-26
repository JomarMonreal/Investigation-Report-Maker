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

const municipalityProvinceFormatter = (incidentLocation) => {
  const muni = incidentLocation?.cityOrMunicipality;
  const province = incidentLocation?.province;
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

const safe = (v, placeholder = "[MISSING]") => {
  if (v === null || v === undefined) return placeholder;
  if (typeof v === "string" && v.trim() === "") return placeholder;
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

let cachedTemplate = null;

const getTemplate = () => {
  if (cachedTemplate) return cachedTemplate;
  const templateData = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  cachedTemplate = JSON.parse(templateData);
  return cachedTemplate;
};

const ollama = new Ollama({ fetch: fetchWithTimeout });


app.post('/api/generate', async (req, res) => {

	try {
		let template;
		try {
			template = getTemplate();
		} catch (err) {
			console.error('Error reading template:', err);
			return res.status(500).json({ error: 'Template file not found' });
		}

	const details = req.body.caseDetails ? req.body.caseDetails : dummyDetails;
	console.log('Generating Report...');
	// Build a retrieval query from your case details (tune this!)
	const ragQuery = [
		details.crime,
		details.place,
		details.weapon,
		details.suspect,
		details.victim,
		"affidavit",
		"elements of the crime",
		"procedure",
		].filter(Boolean).join(" | ");

	const { context } = await retrieveContext(ragQuery, 5);

	// Include the template too (right now you only log it)
	const userPayload = {
		caseDetails: details,
		template,
		referenceMaterials: context,
		};

	const response = await ollama.chat({
		model: "gemma3:latest",
		messages: [
			{
			role: "system",
			content:
				systemPrompt +
				"\n\nRULES:\n" +
				"1) Use ONLY the provided caseDetails and referenceMaterials.\n" +
				"2) If a fact is not explicitly in those, underline it.\n" +
				"3) Output must match the JSON schema.\n" +
				"4) Remove duplicate information from the narrative.\n" +
				"5) If the caseDetails are missing key information, do not fabricate it. Just leave it out or say it's missing.\n" +
				"6) The narrative should be in Tagalog.\n\n" 
			},
			{ role: "user", content: JSON.stringify(userPayload) },
		],
		format: z.toJSONSchema(CustomElementArraySchema),
	});

	const narrative = JSON.parse(response.message.content);
	for (var i = 0; i < narrative.length; i++) {
		narrative[i].children[0].text = (i + 1).toString() + ". " + narrative[i].children[0].text;
	}




	const station = req.body.policeStation
	? req.body.policeStation
	: { name: "Los Banos Police Station", address: { cityOrMunicipality: "Los Banos", province: "Laguna" } };

	// Parse dates safely
	let reportDate = safeDate(details?.reportDate);
	let incidentDate = safeDate(details?.incidentDate);
	
	reportDate = new Date(details.reportDate);
    incidentDate = new Date(details.incidentDate);

	// Poseur Buyer safe fields
	const poseurName = safeUpper(details?.poseurBuyer?.fullName, "[MISSING NAME]");
	const poseurDob = safeDate(details?.poseurBuyer?.dateOfBirth);
	const poseurAge = poseurDob ? new Date().getFullYear() - poseurDob.getFullYear() : "[MISSING AGE]";
	const poseurUnit = safe(details?.poseurBuyer?.unitOrStation, "[MISSING UNIT/STATION]");
	const poseurAddr = municipalityProvinceFormatter(details?.poseurBuyer?.address);

	// Incident location safe fields
	const incProvince = safe(details?.incidentLocation?.province, "[MISSING PROVINCE]");
	const incMuni = safe(details?.incidentLocation?.cityOrMunicipality, "[MISSING MUNICIPALITY]");
	const incPlace = municipalityProvinceFormatter(details?.incidentLocation);

	// Station address could be a string or an object—support both
	const stationAddr =
	typeof station?.address === "string"
		? station.address
		: municipalityProvinceFormatter(station?.address);

	// Assigned officer safe
	const assignedOfficerName = safe(details?.assignedOfficer?.fullName, "[MISSING OFFICER NAME]");


		// affidavit of poseur buyer specific
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
						"text": "(Affidavit of Poseur Buyer)"
					}
				]
			},
			{
				type: "paragraph",
				align: "justify",
				children: [
				{
					text:
					`AKO, ${poseurName} ${poseurAge} taong-gulang, ` +
					`kagawad ng Pulisya at nakatalaga sa ${poseurUnit}, ` +
					`naninirahan sa ${poseurAddr}, matapos na makapanumpa ` +
					`alinsunod sa ipinag-uutos ng Saligang Batas ng Pilipinas ay ` +
					`malaya at kusang loob na nagsasalaysay gaya ng mga sumusunod:`,
				},
				],
			},
		];

		const footer = [

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
				"type": "paragraph",
				"align": "left",
				"children": [
					{
						"text": ""
					}
				]
			},
 			{ type: "paragraph", align: "right", children: [{ text: safe(details?.poseurBuyer?.fullName, "[MISSING NAME]") }] },
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
				"type": "paragraph",
				"align": "left",
				"children": [
					{
						"text": ""
					}
				]
			},
			{ type: "paragraph", align: "right", children: [{ text: assignedOfficerName }] },
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

		response.message.content = JSON.stringify(header.concat(narrative, footer));
		// end of affidavit of poseur buyer specific

		console.log("Total Generation Time (s): " + response.total_duration / 1000000000);
		res.status(200);
		res.send(response);
	} catch (error) {
		console.error('Error calling Ollama:', error);

		if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
			res.status(504).json({ 
				error: 'Ollama request timeout', 
				message: 'The request took too long. Try a smaller model or simpler request.' 
			});
		} else if (error.message.includes('fetch failed') || error.message.includes('connect')) {
			res.status(503).json({ 
				error: 'Ollama service unavailable', 
				message: 'Make sure Ollama is running. Run "ollama serve" in terminal.' 
			});
		} else {
			res.status(500).json({ 
				error: 'Generation failed', 
				message: error.message 
			});
		}
	}



});

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
