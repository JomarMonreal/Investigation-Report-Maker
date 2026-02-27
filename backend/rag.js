const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { Document } = require("@langchain/core/documents");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { OllamaEmbeddings } = require("@langchain/ollama");

const { PDFParse } = require("pdf-parse"); // pdf-parse@2.4.5

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_DIR = path.join(process.cwd(), ".cache");
const INDEX_CACHE_PATH = path.join(CACHE_DIR, "rag-index-cache-v1.json");
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 150;
const EMBEDDING_MODEL = "nomic-embed-text";

const embeddings = new OllamaEmbeddings({
  model: EMBEDDING_MODEL,
  // baseUrl: "http://localhost:11434",
});

let indexPromise = null;

/** Cosine similarity for two same-length vectors. */
function cosineSim(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

async function loadPdfText(filePath) {
  const buf = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buf });

  try {
    const out = await parser.getText();
    return (out?.text || "").trim();
  } finally {
    await parser.destroy?.();
  }
}

function hashIndexInputs(pdfFiles) {
  const fileFingerprints = pdfFiles.map((filePath) => {
    const stat = fs.statSync(filePath);
    return {
      file: path.basename(filePath),
      size: stat.size,
      mtimeMs: Math.floor(stat.mtimeMs),
    };
  });

  const digestInput = JSON.stringify({
    embeddingModel: EMBEDDING_MODEL,
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
    fileFingerprints,
  });

  return crypto.createHash("sha256").update(digestInput).digest("hex");
}

function readCachedIndex(expectedInputHash) {
  if (!fs.existsSync(INDEX_CACHE_PATH)) return null;

  try {
    const raw = fs.readFileSync(INDEX_CACHE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.inputHash !== expectedInputHash) {
      return null;
    }

    if (!Array.isArray(parsed.docs) || !Array.isArray(parsed.vectors)) {
      return null;
    }
    if (parsed.docs.length === 0 || parsed.docs.length !== parsed.vectors.length) {
      return null;
    }

    const docs = parsed.docs.map(
      (doc) =>
        new Document({
          pageContent: typeof doc?.pageContent === "string" ? doc.pageContent : "",
          metadata: doc?.metadata && typeof doc.metadata === "object" ? doc.metadata : {},
        })
    );

    if (docs.length === 0) return null;

    return {
      docs,
      vectors: parsed.vectors,
    };
  } catch {
    return null;
  }
}

function writeCachedIndex(inputHash, docs, vectors) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const payload = {
      inputHash,
      docs: docs.map((doc) => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata ?? {},
      })),
      vectors,
    };
    fs.writeFileSync(INDEX_CACHE_PATH, JSON.stringify(payload));
  } catch (err) {
    console.warn("[rag] Failed to write index cache:", err?.message ?? err);
  }
}

/**
 * Build an in-memory embedding index:
 * { docs: Document[], vectors: number[][] }
 */
async function getIndex() {
  if (indexPromise) return indexPromise;

  indexPromise = (async () => {
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

    const inputHash = hashIndexInputs(pdfFiles);
    const cached = readCachedIndex(inputHash);
    if (cached) {
      return cached;
    }

    const rawDocs = [];
    for (const filePath of pdfFiles) {
      const text = await loadPdfText(filePath);
      if (!text || text.length < 50) continue; // likely scanned or empty
      rawDocs.push(
        new Document({
          pageContent: text,
          metadata: { source: path.basename(filePath) },
        })
      );
    }

    if (rawDocs.length === 0) {
      throw new Error("No extractable text found. PDFs may be scanned (needs OCR).");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });

    const chunks = await splitter.splitDocuments(rawDocs);

    // Embed all chunks once
    const texts = chunks.map((d) => d.pageContent);
    const vectors = await embeddings.embedDocuments(texts);

    if (!Array.isArray(vectors) || vectors.length !== chunks.length) {
      throw new Error("Embedding failed: unexpected embeddings shape.");
    }

    writeCachedIndex(inputHash, chunks, vectors);

    return { docs: chunks, vectors };
  })();

  return indexPromise;
}

/** Retrieve top-k similar chunks for a query. */
async function retrieveContext(query, k = 4) {
  const { docs, vectors } = await getIndex();
  const qVec = await embeddings.embedQuery(query);

  // Score each chunk
  const scored = docs.map((doc, i) => ({
    doc,
    score: cosineSim(qVec, vectors[i]),
  }));

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k).map((x) => x.doc);

  const context = top
    .map((d, i) => {
      const src = d.metadata?.source ? `SOURCE: ${d.metadata.source}` : "SOURCE: unknown";
      return `[#${i + 1}] ${src}\n${d.pageContent}`;
    })
    .join("\n\n---\n\n");

  return { context, hits: top };
}

async function warmRagIndex() {
  await getIndex();
}

module.exports = { retrieveContext, warmRagIndex };
