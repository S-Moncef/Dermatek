export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { base64Image, mimeType } = req.body;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `Tu es un dermatologue expert. Analyse cette photo de peau et réponds UNIQUEMENT en JSON valide avec exactement cette structure:
{
  "skinType": "type de peau en français (ex: Normale, Grasse, Sèche, Mixte, Sensible)",
  "healthScore": nombre entre 0 et 100,
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3", "recommandation 4"]
}
Aucun texte avant ou après le JSON.` },
            { inline_data: { mime_type: mimeType, data: base64Image } }
          ]
        }]
      })
    }
  );

  const data = await response.json();
  return res.status(response.status).json(data);
}
