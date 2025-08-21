export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body = {}; try { body = JSON.parse(req.body || "{}"); } catch {}
  const { text, source = "English", target = "Spanish" } = body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(200).json({ text: `[Mock ${source}->${target}] ` + text });

  const prompt = `Translate the following patient instructions from ${source} to ${target}, in simple, culturally sensitive language:\n\n${text}`;
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "system", content: "You translate patient instructions clearly and neutrally." }, { role: "user", content: prompt }]
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: "OpenAI error", details: data });
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ text: content });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
