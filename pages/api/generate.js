export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body = {};
  try { body = JSON.parse(req.body || "{}"); } catch {}
  const { input, format = "SOAP" } = body;
  if (!input) return res.status(400).json({ error: "Missing input" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Mock fallback so UI still works
    return res.status(200).json({ note: `**${format} (Mock)**\n\nS: ${input}\nO: VSS.\nA: Problem-focused summary.\nP: Follow local protocols; verify guidelines.` });
  }

  const system = [
    "You are DOC IK, a HIPAA-aware documentation assistant for clinicians.",
    "Return concise, EMR-ready notes. Do not store PHI. Avoid definitive diagnoses; keep to documentation tone.",
    "Formats: SOAP, H&P, Discharge Summary."
  ].join(" ");

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [{ role: "system", content: system }, { role: "user", content: `Format: ${format}\nInput:\n${input}` }]
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: "OpenAI error", details: data });
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ note: content });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
