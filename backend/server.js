const express = require('express');
const {default: ollama} = require('ollama');
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

const systemPrompt = "You are an assistant that creates crime narratives based on the given details for an affidafit. Do not fabricate events not mentioned in the details. Use Tagalog. Respond in JSON. After generating the narrative, check each sentence if it is stated in the details provided. If the sentence is not stated in the details provided, it should be underlined by adding an underline attribute to the text object (example: {text: 'this should be underlined', underline: true}). Separate the narrative into different statements of events. Each event will be its own paragraph.";

const dummyDetails = {
	suspect: "Ronaldo Martin",
	weapon: "kitchen knife",
	date: "November 20, 2025",
	time: "2:30 AM",
	place: "Lopez Ave., Los Banos, Laguna",
	crime: "attempted homicide",
	victim: "Asher Hernandez",
}


const app = express();
const PORT = 3000;

app.use(express.json());

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

		const details = req.body.details ? req.body.details : dummyDetails;

		console.log(systemPrompt + template);
		console.log('Generating Report...');
		const response = await ollama.chat({
			model: 'gemma3:12b',
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

		// affidavit of poseur buyer specific
		const header = [
			{
				"type": "paragraph",
				"children": [
					{
						"text": "Lalawigan ng",
						"bold": true
					}
				]
			},
			{
				"type": "paragraph",
				"children": [
					{
						"text": "Bayan ng Mansalay"
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
						"text": "AKO, {{ARRESTING_OFFICER_NAME}} {{ARRESTING_OFFICER_AGE}} taong-gulang, kagawad ng Pulisya at nakatalaga sa {{ARRESTING_OFFICER_STATION}}, naninirahan sa {{ARRESTING_OFFICER_HOME_ADDRESS}}, matapos na makapanumpa alinsunod sa ipinag-uutos ng Saligang Batas ng Plilipinas ay malaya at kusang loob na nagsasalaysay gaya ng mga sumusunod:"
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
						"text": " ay lumagda ako ng aking pangalan at apelyido ngayong ika-{{DAY}} ng {{MONTH}} {{YEAR}} dito sa {{LOCATION}}."
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
						"text": "{{ARRESTING_OFFICER_NAME}}"
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
						"text": "SWORN AND SUBSCRIBED TO BEFORE ME this {{DAY}} day of {{MONTH}} {{YEAR}} at {{LOCATION}} and further certify that I personally examined the affaint and that I am fully satisfied that she voluntarily executed and understood the contents of the foregoing statements."
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
						"text": "{{ADMINISTERING_OFFICER_NAME}}"
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
