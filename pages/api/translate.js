export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { text = "", target = "es" } = await readJSON(req);
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(200).json({ mock: true, translated: `(Mock ${target}) ` + text });
    const messages = [
      { role: "system", content: "Translate clinically and clearly; no PHI retained." },
      { role: "user", content: `Translate to ${target}: ${text}` }
    ];
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.2, messages })
    });
    if (!resp.ok) return res.status(500).json({ error: "OpenAI error" });
    const data = await resp.json();
    const out = data?.choices?.[0]?.message?.content?.trim() || "";
    res.status(200).json({ translated: out });
  } catch(e){ res.status(500).json({ error: e?.message || "Server error" }); }
}
async function readJSON(req){
  if (req.headers["content-type"]?.includes("application/json")) return await getBody(req);
  const text = await streamToString(req); try { return JSON.parse(text||"{}"); } catch { return {}; }
}
function getBody(req){ return new Promise((resolve)=>{ let b=""; req.on("data",c=>b+=c); req.on("end",()=>resolve(JSON.parse(b||"{}"))); });}
function streamToString(req){ return new Promise((resolve)=>{ let b=""; req.on("data",c=>b+=c); req.on("end",()=>resolve(b)); });}
