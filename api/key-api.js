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
      model: "gpt-4o-mini-search-preview",
      messages: [
        {
          role: "system",
          content: "You are a data assistant. Respond ONLY with a JSON object. Do not include markdown formatting."
        },
        {
          role: "user",
          content: `Search for the current Yelp rating and review count, and Google Maps rating and review count for the restaurant "${name}" in ${city}, ${country}.
                    Return JSON: {"yelp":{"rating":number,"reviews":number},"google":{"rating":number,"reviews":number}}.
                    Use null for any value you cannot find.`
        }
      ],
      web_search_options: {},
    });

    const raw = response.choices[0].message.content;
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);
    res.status(200).json(result);

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ yelp: null, google: null });
  }
}
