import { useState } from "react";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState("SOAP");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function generate() {
    setLoading(true); setErr(""); setNote("");
    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ input, format })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed");
      setNote(data.note || "");
      if (data.mock) setErr("OPENAI_API_KEY missing — showing mock output.");
    } catch(e){ setErr(e.message || "Error"); }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">DocIK Assistant</h1>
      <p className="text-center mb-6">Paste dictation (no PHI). Get EMR-ready notes.</p>
      <div className="grid gap-3 mb-4">
        <label className="text-sm font-medium">Output format</label>
        <select value={format} onChange={(e)=>setFormat(e.target.value)} className="border rounded-xl p-3">
          <option>SOAP</option>
          <option>H&P</option>
          <option>Discharge Summary</option>
        </select>
      </div>
      <textarea rows={8} className="w-full border rounded-xl p-3" placeholder="Brief dictation (no PHI)…"
        value={input} onChange={(e)=>setInput(e.target.value)} />
      <button onClick={generate} disabled={loading || !input.trim()}
        className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Generating..." : "Generate Note"}
      </button>
      {err && <p className="mt-4 text-red-600">{err}</p>}
      {note && <pre className="bg-gray-100 p-4 mt-6 rounded-xl whitespace-pre-wrap">{note}</pre>}
    </main>
  );
}
