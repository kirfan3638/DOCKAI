export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { input } = req.body;
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY in environment' });
  }
  try {
    // Placeholder: in production, call OpenAI here
    const fakeResponse = `🤖 Assistant reply to: "${input}"`;
    res.status(200).json({ output: fakeResponse });
  } catch (err) {
    res.status(500).json({ error: 'API error' });
  }
}
