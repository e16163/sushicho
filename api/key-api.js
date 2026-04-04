
// api/key-api.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { name, city, country } = req.body;

  try {
    const response = await openai.chat.completions.create({
      // gpt-4o-mini is ultra-fast and very cheap for this task
      model: "gpt-4o-mini", 
      messages: [
        { 
          role: "system", 
          content: "You are a data assistant. Respond ONLY with a JSON object. Do not include markdown formatting." 
        },
        { 
          role: "user", 
          content: `Find the current Yelp rating/review count and Google Maps rating/review count for "${name}" in ${city}, ${country}. 
                    Return JSON: {"yelp":{"rating":number,"reviews":number},"google":{"rating":number,"reviews":number}}. 
                    Use null if not found.` 
        }
      ],
      // This is the magic "JSON Mode"
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    res.status(200).json(result);

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ yelp: null, google: null });
  }
}
