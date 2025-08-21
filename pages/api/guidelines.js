const DOMAIN_HINTS = {
  "AHA/ACC": "professional.heart.org or acc.org",
  "IDSA": "idsociety.org",
  "CDC": "cdc.gov",
  "NEJM": "nejm.org",
  "JAMA": "jamanetwork.com",
  "GOLD": "goldcopd.org"
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  let body = {}; try { body = JSON.parse(req.body || "{}"); } catch {}
  const { q = "", sources = [] } = body;
  if (!q) return res.status(400).json({ error: "Missing query" });
  const apiKey = process.env.OPENAI_API_KEY;

  const allowed = sources.length ? sources : ["CDC","IDSA","AHA/ACC","NEJM","JAMA","GOLD"];
  const domainList = allowed.map(s => DOMAIN_HINTS[s]).filter(Boolean).join(", ");

  if (!apiKey) {
    // Mock summary so UI still works
    return res.status(200).json({ summary: `Mock summary for: "${q}". Check: ${domainList}. Decisions, red flags, and follow-up should be verified in primary sources.` });
  }

  const system = [
    "You are DOC IK Guidelines Assistant. Summarize only from reputable public clinical orgs.",
    "Constrain reasoning to known guidance; do NOT invent citations. Provide:",
    "1) Key decisions 2) First-line options 3) Red flags 4) Follow-up 5) Suggest official sites to verify.",
    "Be concise, clinician-facing, no PHI, and include a short 'Verify at:' list with domains."
  ].join(" ");

  const user = `Query: ${q}\nSources to prefer (domains): ${domainList}`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [{ role: "system", content: system }, { role: "user", content: user }]
      })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(500).json({ error: "OpenAI error", details: data });
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ summary: content });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: e.message });
  }
}
