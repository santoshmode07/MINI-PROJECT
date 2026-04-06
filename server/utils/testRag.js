const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ragService = require('./ragService');
const mongoose = require('mongoose');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const threadId = "test-thread-" + Date.now();
    
    console.log("--- Testing General Chat ---");
    const res1 = await ragService.ask("What is RideDosthi?", threadId);
    console.log("Answer 1:", res1);

    console.log("\n--- Testing Metadata Filter (Passenger) ---");
    // This will only search in docs tagged with 'passenger'
    const passengerFilter = {
      must: [
        {
          key: "metadata.category",
          match: { value: "passenger" }
        }
      ]
    };
    const res2 = await ragService.ask("How do I book a ride?", threadId, passengerFilter);
    console.log("Answer 2 (Filtered):", res2);

    console.log("\n--- Testing Context Memory ---");
    const res3 = await ragService.ask("Can you repeat the booking steps?", threadId);
    console.log("Answer 3 (With Memory):", res3);

    console.log("\nTest Completed.");
    process.exit(0);
  } catch (error) {
    console.error("Test Failed:", error);
    process.exit(1);
  }
}

test();
