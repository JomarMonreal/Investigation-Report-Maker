const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const { Document } = require("@langchain/core/documents");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");
const { MemoryVectorStore } = require("@langchain/core/vectorstores");

const DATA_DIR = path.join(process.cwd(), "data");

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  // baseUrl: "http://localhost:11434",
});

let storePromise = null;

async function loadPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const parsed = await pdfParse(buf);
  return (parsed.text || "").trim();
}

async function getStore() {
  if (storePromise) return storePromise;

  storePromise = (async () => {
    if (!fs.existsSync(DATA_DIR)) {
      throw new Error(`PDF folder not found: ${DATA_DIR}`);
    }

    const pdfFiles = fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .map((f) => path.join(DATA_DIR, f));

    if (pdfFiles.length === 0) {
      throw new Error(`No PDFs found in: ${DATA_DIR}`);
    }

    const docs = [];
    for (const filePath of pdfFiles) {
      const text = await loadPdfText(filePath);
      if (!text || text.length < 50) continue; // scanned PDFs often land here
      docs.push(
        new Document({
          pageContent: text,
          metadata: { source: path.basename(filePath) },
        })
      );
    }

    if (docs.length === 0) {
      throw new Error("No extractable text found. PDFs may be scanned (needs OCR).");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });

    const chunks = await splitter.splitDocuments(docs);

    // In-memory store (simple + zero extra infrastructure)
    return MemoryVectorStore.fromDocuments(chunks, embeddings);
  })();

  return storePromise;
}

async function retrieveContext(query, k = 4) {
  const store = await getStore();
  const hits = await store.similaritySearch(query, k);

  const context = hits
    .map((d, i) => {
      const src = d.metadata?.source ? `SOURCE: ${d.metadata.source}` : "SOURCE: unknown";
      return `[#${i + 1}] ${src}\n${d.pageContent}`;
    })
    .join("\n\n---\n\n");

  return { context, hits };
}

module.exports = { retrieveContext };