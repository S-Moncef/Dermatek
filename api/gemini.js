export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { base64Image, mimeType } = req.body;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: 'google/gemma-3-12b-it:free',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Tu es un dermatologue expert. Analyse cette photo de peau et réponds UNIQUEMENT en JSON valide avec exactement cette structure:
{
  "skinType": "type de peau en français (ex: Normale, Grasse, Sèche, Mixte, Sensible)",
  "healthScore": nombre entre 0 et 100,
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3", "recommandation 4"]
}
Aucun texte avant ou après le JSON.`
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64Image}` }
          }
        ]
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: data?.error?.message || JSON.stringify(data) });
  }
  return res.status(200).json({
    candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }]
  });
}
