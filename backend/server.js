const express = require('express');
const {Ollama} = require('ollama');
const z = require('zod');
const fs = require('fs');
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



app.post('/api/generate', async (req, res) => {

	try {
		let template = '';
		
		try {
			const templateData = fs.readFileSync('templates/affidavit-of-poseur-buyer.json', 'utf8');
			const parsedTemplate = JSON.parse(templateData);

			template = JSON.stringify(parsedTemplate, null, 2);
		} catch (err) {
			console.error('Error reading template:', err);
			return res.status(500).json({ error: 'Template file not found' });
		}

	const details = req.body.caseDetails ? req.body.caseDetails : dummyDetails;
	console.log(systemPrompt + template);
	console.log('Generating Report...');
    console.log(details);

    const ollama = new Ollama({fetch: fetchWithTimeout});
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
		template: JSON.parse(template), // or template string
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
				"3) Output must match the JSON schema.\n",
			},
			{ role: "user", content: JSON.stringify(userPayload) },
		],
		format: z.toJSONSchema(CustomElementArraySchema),
	});

	const narrative = JSON.parse(response.message.content);
	for (var i = 0; i < narrative.length; i++) {
		narrative[i].children[0].text = (i + 1).toString() + ". " + narrative[i].children[0].text;
	}
	narrative.forEach((event) => console.log(event));

    // dummy narrative
    // const narrative = "NARRATIVE";


    console.log("printing events...");


    console.log("done printing events...");




	const station = req.body.policeStation
	? req.body.policeStation
	: { name: "Los Banos Police Station", address: { cityOrMunicipality: "Los Banos", province: "Laguna" } };

	// Parse dates safely
	const reportDate = safeDate(details?.reportDate);
	const incidentDate = safeDate(details?.incidentDate);
	
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

    // let response = {message: {content: {}}};
    // response.message.content = JSON.stringify(header.concat(narrative, footer));

    console.log(response);

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
});

app.post("/api/ask", async (req, res) => {
  try {
    const parsed = AskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body", details: parsed.error.flatten() });
    }

    const { question } = parsed.data;

    const { context } = await retrieveContext(question, 5);

    const ollama = new Ollama({ fetch: fetchWithTimeout });
    const response = await ollama.chat({
      model: "gemma3:latest",
      messages: [
        { role: "system", content: "Answer using ONLY the provided context. If missing, say you don't know." },
        { role: "user", content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}` },
      ],
    });

    return res.status(200).json({ answer: (response?.message?.content ?? "").trim() });
  } catch (e) {
    return res.status(500).json({ error: "Ask failed", message: e?.message ?? String(e) });
  }
});

app.listen(PORT, (error) => {
	if (!error)
		console.log("Server is running. App is listening at port " + PORT);
	else
		console.log("Error occurred, server can't start");
});
