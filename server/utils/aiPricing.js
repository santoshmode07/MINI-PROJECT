const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Predicts a fair ride-sharing price range for a route in India.
 * @param {string} from - Pickup location/city
 * @param {string} to - Destination location/city
 * @returns {Object} - { min: number, max: number, hint: string }
 */
exports.predictPrice = async (from, to, distanceKM, vehicleType = 'Car') => {
  try {
    const prompt = `You are a specialized AI for an Indian inter-city ride-sharing platform "RideDosthi". 
    A user wants to offer a ${vehicleType.toUpperCase()} ride from "${from}" to "${to}".
    The exact calculated route distance is ${distanceKM ? distanceKM + " kilometers" : "unknown"}.
    
    CRITICAL FACTORS:
    - Vehicle: ${vehicleType} (Note: Bikes should be ~40-60% cheaper than Cars per seat).
    - Distance: ${distanceKM || 'Assume standard city-to-city distance'}.
    
    TASK: Return a "per-seat" fair price range in INR (₹) that is:
    1. Competitive for a ${vehicleType} in the Indian market.
    2. Considers fuel efficiency difference between a car (~15km/l) and a bike (~50km/l).
    3. Reflects the convenience of a car (AC/Storage) vs the speed/economy of a bike.
    
    Return ONLY a JSON object:
    {
      "min": number,
      "max": number,
      "reason": "Explain briefly in 5-8 words. e.g. 'Bike ride for 200km at economy rates.'"
    }
    No preamble. No markdown. Only raw JSON.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: "Return only raw JSON." }, { role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(chatCompletion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('[AI-Pricing] Error:', error.message);
    // Fallback if AI fails (very rough estimate: ₹100 base + random)
    return { min: 200, max: 500, reason: "Fallback estimation (Service busy)" };
  }
};
