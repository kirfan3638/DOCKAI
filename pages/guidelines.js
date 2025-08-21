import { useEffect, useRef, useState } from "react";

const ORGS = ["AHA/ACC","IDSA","CDC","NEJM","JAMA","GOLD"];

export default function Guidelines() {
  const [tab, setTab] = useState("Text");
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState(["AHA/ACC","IDSA","CDC"]);
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const [warn, setWarn] = useState("");

  const [recSupported, setRecSupported] = useState(false);
  const recRef = useRef(null);
  const [isRec, setIsRec] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(()=>{
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setRecSupported(!!SR);
    if (SR) {
      const r = new SR();
      r.lang = "en-US";
      r.continuous = true;
      r.interimResults = false;
      r.onresult = (e)=>{
        const txt = Array.from(e.results).map(r=>r[0].transcript).join(" ");
        setQuery(q => (q? q + " " : "") + txt);
      };
      r.onend = ()=> setIsRec(false);
      recRef.current = r;
    }
  },[]);

  const toggleSource = (s) =>
    setSources(p => p.includes(s) ? p.filter(x=>x!==s) : [...p, s]);

  async function askGuidelines(){
    setBusy(true); setWarn(""); setOut(null);
    try {
      const resp = await fetch("/api/guidelines", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ query, sources })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed");
      setOut(data);
      if (data?.mock) setWarn("OPENAI_API_KEY missing — showing mock output.");
    } catch(e){ setWarn(e.message || "Error"); }
    setBusy(false);
  }

  function startStopMic(){
    if (!recSupported) { setWarn("Mic unsupported in this browser."); return; }
    if (isRec) { recRef.current && recRef.current.stop(); setIsRec(false); }
    else { setWarn(""); recRef.current && recRef.current.start(); setIsRec(true); }
  }

  function onFile(e){
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPreview({ url, kind: f.type.startsWith("image/") ? "image" : "video" });
    const reader = new FileReader();
    reader.onload = ()=> setDataUrl(reader.result);
    reader.readAsDataURL(f);
  }

  async function analyzeMedia(){
    if (!dataUrl) { setWarn("Choose an image or short video first."); return; }
    setBusy(true); setWarn(""); setOut(null);
    try {
      const resp = await fetch("/api/guidelines-vision", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ dataUrl, prompt: "Interpret clinically for guideline context; be concise." })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed");
      setOut({
        summary: [data.summary],
        decisions: ["Use clinical judgment; verify with official orgs"],
        redFlags: ["Life-threatening findings → emergent escalation"],
        suggestedLinks: data.suggestedLinks || []
      });
      if (data?.mock) setWarn("OPENAI_API_KEY missing — showing mock output.");
    } catch(e){ setWarn(e.message || "Error"); }
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">Guidelines Search</h1>
      <p className="text-center mb-4 text-sm text-gray-600">HIPAA-aware: no PHI stored. Public clinical orgs only.</p>

      <div className="flex gap-2 justify-center mb-6">
        {["Text","Mic","Image/Video"].map(x => (
          <button key={x}
            className={\`px-4 py-2 rounded-2xl shadow \${tab===x ? "bg-blue-600 text-white":"bg-gray-100"}\`}
            onClick={()=>setTab(x)}>{x}</button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        {ORGS.map(s => (
          <label key={s} className="flex items-center gap-2 border rounded-full px-3 py-1">
            <input type="checkbox" checked={sources.includes(s)} onChange={()=>toggleSource(s)} />
            <span>{s}</span>
          </label>
        ))}
      </div>

      {tab==="Text" && (
        <div className="grid gap-3">
          <textarea rows={6} className="w-full border rounded-xl p-3" placeholder="e.g., CAP outpatient therapy; COPD exacerbation; NSTEMI antiplatelet…"
            value={query} onChange={e=>setQuery(e.target.value)} />
          <button onClick={askGuidelines} disabled={busy || !query.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow hover:bg-blue-700 disabled:opacity-50">
            {busy ? "Searching..." : "Ask DocIK (Guidelines)"}
          </button>
        </div>
      )}

      {tab==="Mic" && (
        <div className="grid gap-3">
          <div className="flex gap-2">
            <button onClick={startStopMic}
              className={\`\${isRec? "bg-red-600":"bg-green-600"} text-white px-6 py-3 rounded-2xl text-lg shadow hover:opacity-90\`}>
              {isRec ? "Stop Recording" : "Start Recording"}
            </button>
            <button onClick={askGuidelines} disabled={busy || !query.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow hover:bg-blue-700 disabled:opacity-50">
              {busy ? "Searching..." : "Ask"}
            </button>
          </div>
          <textarea rows={6} className="w-full border rounded-xl p-3" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
      )}

      {tab==="Image/Video" && (
        <div className="grid gap-3">
          <input type="file" accept="image/*,video/*" onChange={onFile} />
          {preview?.kind==="image" && <img src={preview.url} alt="preview" className="max-h-64 rounded-xl border" />}
          {preview?.kind==="video" && <video src={preview.url} controls className="max-h-64 rounded-xl border" />}
          <button onClick={analyzeMedia} disabled={busy || !dataUrl}
            className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-lg shadow hover:bg-purple-700 disabled:opacity-50">
            {busy ? "Analyzing..." : "Interpret Image/Video"}
          </button>
        </div>
      )}

      {warn && <p className="mt-4 text-red-600">{warn}</p>}
      {out && (
        <section className="mt-8 grid gap-4">
          {!!out.summary?.length && (
            <div className="p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">Summary</h3>
              <ul className="list-disc list-inside">{out.summary.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {!!out.decisions?.length && (
            <div className="p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">Key Decisions</h3>
              <ul className="list-disc list-inside">{out.decisions.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {!!out.redFlags?.length && (
            <div className="p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">Red Flags</h3>
              <ul className="list-disc list-inside">{out.redFlags.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {!!out.suggestedLinks?.length && (
            <div className="p-4 rounded-xl border">
              <h3 className="font-semibold mb-2">Suggested Official Links</h3>
              <ul className="list-disc list-inside">
                {out.suggestedLinks.map((u,i)=>(<li key={i}><a className="underline" href={u} target="_blank" rel="noreferrer">{u}</a></li>))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
