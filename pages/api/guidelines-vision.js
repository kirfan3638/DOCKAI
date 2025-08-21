export const config = { api: { bodyParser: { sizeLimit: "12mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { dataUrl, prompt = "Interpret clinically for guideline context." } = await readJSON(req);
    if (!dataUrl) return res.status(400).json({ error: "Missing dataUrl" });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        mock: true,
        summary: "Mock vision summary: image/video reviewed. Verify with IDSA/CDC/AHA/ACC/GOLD.",
        suggestedLinks: ["https://idsociety.org","https://cdc.gov","https://professional.heart.org","https://goldcopd.org"]
      });
    }
    const messages = [
      { role: "system", content: "You are DOC IK. Provide concise, guideline-oriented interpretation. No PHI storage. Do not diagnose." },
      { role: "user", content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: dataUrl } }
      ]}
    ];
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature: 0.2 })
    });
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: "OpenAI error", details: text });
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ summary: content, suggestedLinks: [
      "https://idsociety.org","https://cdc.gov","https://professional.heart.org","https://goldcopd.org"
    ]});
  } catch(e){ return res.status(500).json({ error: e?.message || "Server error" }); }
}
async function readJSON(req){
  if (req.headers["content-type"]?.includes("application/json")) return await getBody(req);
  const text = await streamToString(req); try { return JSON.parse(text||"{}"); } catch { return {}; }
}
function getBody(req){ return new Promise((resolve)=>{ let b=""; req.on("data",c=>b+=c); req.on("end",()=>resolve(JSON.parse(b||"{}"))); });}
function streamToString(req){ return new Promise((resolve)=>{ let b=""; req.on("data",c=>b+=c); req.on("end",()=>resolve(b)); });}
