import express from "express";
import cors from "cors";
import ollama from "ollama";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const { details, systemPrompt } = req.body;

  console.log("details: ", details)
  console.log("systemPrompt: ", systemPrompt)

  try {
    const response = await ollama.chat({
      model: "gemma3:27b",
      format: "json",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(details) }
      ]
    });

    console.log(response.message.content)

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

