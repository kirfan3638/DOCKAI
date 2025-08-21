export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { text, from = 'English', to = 'Spanish' } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

    const system = 'You translate clinical instructions accurately and simply. Never include identifiers. Keep tone neutral and clear.';
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `Translate from ${from} to ${to}:\n${text}` }
      ],
      temperature: 0.2
    };

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const t = await resp.text();
      return res.status(500).json({ error: 'OpenAI error', details: t });
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';
    return res.status(200).json({ translation: content });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', details: e.message || String(e) });
  }
}
