export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { query = "", sources = ["AHA/ACC","IDSA","CDC","NEJM","JAMA","GOLD"] } = await readJSON(req);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        mock: true,
        summary: [
          "Mock summary: verify with official org sites.",
          "Outline key management steps; include risk stratification."
        ],
        decisions: ["Choose first-line therapy per org", "Adjust for comorbidities", "Follow-up criteria"],
        redFlags: ["Hypoxia", "Hemodynamic instability", "AMS"],
        suggestedLinks: ["https://idsociety.org","https://cdc.gov","https://professional.heart.org","https://goldcopd.org"]
      });
    }
    const orgHints = {
      "AHA/ACC":"professional.heart.org",
      "IDSA":"idsociety.org",
      "CDC":"cdc.gov",
      "NEJM":"nejm.org",
      "JAMA":"jamanetwork.com",
      "GOLD":"goldcopd.org"
    };
    const domains = sources.map(s => orgHints[s] || s).join(", ");
    const system = [
      "You are DOC IK, a HIPAA-aware clinical documentation assistant.",
      "Summarize public guidelines from major organizations only (no private/paywalled content).",
      "Do not claim to browse. Provide concise bullet points and suggest official links."
    ].join(" ");
    const messages = [
      { role: "system", content: system },
      { role: "user", content:
        `Question: ${query}\nFocus on these orgs/domains: ${domains}.\n` +
        "Return JSON with keys summary[], decisions[], redFlags[], suggestedLinks[] (official org pages)." }
    ];
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, messages })
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: "OpenAI error", details: text });
    }
    const data = await resp.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "";
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch { parsed = tryExtractJSON(raw); }
    return res.status(200).json({
      summary: parsed?.summary || [],
      decisions: parsed?.decisions || [],
      redFlags: parsed?.redFlags || [],
      suggestedLinks: parsed?.suggestedLinks || []
    });
  } catch(e){ return res.status(500).json({ error: e?.message || "Server error" }); }
}
async function readJSON(req){
  if (req.headers["content-type"]?.includes("application/json")) return await getBody(req);
  const text = await streamToString(req); try { return JSON.parse(text||"{}"); } catch { return {}; }
}
function getBody(req){ return new Promise((resolve)=>{ let b=""; req.on("data",c=>b+=c); req.on("end",()=>resolve(JSON.parse(b||"{}"))); });}
function streamToString(req){ return new Promise((resolve)=>{ let b=""; req.on("data",c=>b+=c); req.on("end",()=>resolve(b)); });}
function tryExtractJSON(s){ const m=s.match(/\{[\s\S]*\}/); try{ return JSON.parse(m?m[0]:"{}"); }catch{ return {}; } }
