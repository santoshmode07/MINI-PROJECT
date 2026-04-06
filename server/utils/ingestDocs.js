const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ragService = require('./ragService');
const fs = require('fs');
const mongoose = require('mongoose');

async function ingest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for ingestion...");

    // The PDFs are in the root directory
    await ragService.ingestAllPdfs("../../");
    
    console.log("Ingestion completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
}

ingest();
