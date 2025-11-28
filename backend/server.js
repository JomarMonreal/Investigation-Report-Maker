const express = require('express');
const {Ollama} = require('ollama');
const z = require('zod');
const fs = require('fs');


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
	const muni = incidentLocation.cityOrMunicipality;
	const province = incidentLocation.province;
	return `${muni}, ${province}`;
}

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
		const station = req.body.policeStation ? req.body.policeStation : {name: "Los Banos Police Station", address: "Los Banos, Laguna"};

		console.log(systemPrompt + template);
		console.log('Generating Report...');
    console.log(details);
    const ollama = new Ollama({fetch: fetchWithTimeout});
		const response = await ollama.chat({
			model: 'gemma3:4b',
			messages: [
				{role: 'system', content: systemPrompt},
				{role: 'user', content: JSON.stringify(details)},
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


    reportDate = new Date(details.reportDate);
    indidentDate = new Date(details.incidentDate);

		// affidavit of poseur buyer specific
		const header = [
			{
				"type": "paragraph",
				"children": [
					{
						"text": `Lalawigan ng ${details.incidentLocation.province}`, // WARN: No 'Province' input field
						"bold": true
					}
				]
			},
			{
				"type": "paragraph",
				"children": [
					{
						"text": `Bayan ng ${details.incidentLocation.cityOrMunicipality}` // WARN: No 'City' input field
					}
				]
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
				"type": "paragraph",
				"align": "justify",
				"children": [
					{
						"text": `AKO, ${details.arrestingOfficers[0]?.fullName.toUpperCase()} ${new Date().getFullYear() - new Date(details.arrestingOfficers[0]?.dateOfBirth).getFullYear()} taong-gulang, kagawad ng Pulisya at nakatalaga sa ${details.arrestingOfficers[0]?.unitOrStation}, naninirahan sa ${municipalityProvinceFormatter(details.arrestingOfficers[0]?.address)}, matapos na makapanumpa alinsunod sa ipinag-uutos ng Saligang Batas ng Plilipinas ay malaya at kusang loob na nagsasalaysay gaya ng mga sumusunod:` // WARN: NOT PRECISE AGE
					}
				]
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
				"type": "paragraph",
				"align": "justify",
				"children": [
					{
						"text": "SA KATUNAYAN NG LAHAT",
						"bold": true
					},
					{
						"text": ` ay lumagda ako ng aking pangalan at apelyido ngayong ika-${reportDate.getDate()} ng ${reportDate.getMonth()} ${reportDate.getFullYear()} dito sa ${municipalityProvinceFormatter(details.incidentLocation)}.`
					}
				]
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
			{
				"type": "paragraph",
				"align": "right",
				"children": [
					{
						"text": `${details.arrestingOfficers[0]?.fullName}` // WARN: hard coded to take the first arresting officer.
					}
				]
			},
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
				"type": "paragraph",
				"align": "justify",
				"children": [
					{
						"text": `SWORN AND SUBSCRIBED TO BEFORE ME this ${reportDate.getDate()} day of ${reportDate.getMonth()} ${reportDate.getFullYear()} at ${municipalityProvinceFormatter(station.address)} and further certify that I personally examined the affaint and that I am fully satisfied that she voluntarily executed and understood the contents of the foregoing statements.`
					}
				]
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
			{
				"type": "paragraph",
				"align": "right",
				"children": [
					{
						"text": `${details.assignedOfficer.fullName}`
					}
				]
			},
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

app.listen(PORT, (error) => {
	if (!error)
		console.log("Server is running. App is listening at port " + PORT);
	else
		console.log("Error occurred, server can't start");
});
