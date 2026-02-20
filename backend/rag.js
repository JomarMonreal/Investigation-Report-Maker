const fs = require("fs");
const path = require("path");

const { Document } = require("langchain/document");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");

const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { OllamaEmbeddings } = require("@langchain/community/embeddings/ollama");

const pdfParse = require("pdf-parse");

const DATA_DIR = path.join(process.cwd(), "data");            // your PDFs folder
const CHROMA_DIR = path.join(process.cwd(), "chroma_store"); // persistent local store
const COLLECTION = "affidavit_pdfs";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  // baseUrl: "http://localhost:11434", // set if not default
});

let vectorStorePromise = null;

/** Load PDF -> text (simple; assumes text-based PDFs). */
async function loadPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const parsed = await pdfParse(buf);
  const text = (parsed.text || "").trim();
  return text;
}

/** Build or load a persistent vector store. */
async function getVectorStore() {
  if (vectorStorePromise) return vectorStorePromise;

  vectorStorePromise = (async () => {
    // Load existing store if present
    const store = await Chroma.fromExistingCollection(embeddings, {
      collectionName: COLLECTION,
      url: "http://localhost:8000", // if using chroma server
      // For local embedded chroma, you'd configure differently.
      // If you don’t want a server, see note below.
    });

    // Quick probe: if empty, index PDFs
    const probe = await store.similaritySearch("probe", 1).catch(() => []);
    if (probe.length > 0) return store;

    // Index PDFs
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
      if (!text || text.length < 50) continue; // likely scanned / unreadable
      docs.push(
        new Document({
          pageContent: text,
          metadata: { source: path.basename(filePath) },
        })
      );
    }

    if (docs.length === 0) {
      throw new Error(
        "No extractable text found. PDFs may be scanned images (needs OCR)."
      );
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 150,
    });

    const chunks = await splitter.splitDocuments(docs);

    // Create fresh collection + add documents
    const fresh = await Chroma.fromDocuments(chunks, embeddings, {
      collectionName: COLLECTION,
      url: "http://localhost:8000",
    });

    return fresh;
  })();

  return vectorStorePromise;
}

/** Retrieve top-k relevant chunks. */
async function retrieveContext(query, k = 4) {
  const store = await getVectorStore();
  const hits = await store.similaritySearch(query, k);

  // Build a clean context string + keep sources
  const context = hits
    .map((d, i) => {
      const src = d.metadata?.source ? `SOURCE: ${d.metadata.source}` : "SOURCE: unknown";
      return `[#${i + 1}] ${src}\n${d.pageContent}`;
    })
    .join("\n\n---\n\n");

  return { context, hits };
}

module.exports = { retrieveContext, getVectorStore };