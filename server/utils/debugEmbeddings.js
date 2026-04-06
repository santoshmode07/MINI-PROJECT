const { PineconeEmbeddings } = require("@langchain/pinecone");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

async function check() {
  try {
    console.log("Testing Pinecone Inference with model: llama-text-embed-v2");
    const embeddings = new PineconeEmbeddings({
      model: "llama-text-embed-v2",
      apiKey: process.env.PINECONE_API_KEY,
    });
    
    const query = "What is RideDosthi?";
    console.log(`Embedding query: "${query}"`);
    const res = await embeddings.embedQuery(query);
    console.log("Success! Embedding length:", res.length);
  } catch (err) {
    console.error("Embedding failed:", err);
  }
}

check();
