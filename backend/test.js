async function parseResult() {
	const url = "http://localhost:3000/api/chat";

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const result = await response.json();
		const content =  JSON.parse(result.message.content);
		console.log(content);
	} catch (error) {
		console.log(error.message);
	}
}

parseResult();
