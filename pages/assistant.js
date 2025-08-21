import { useEffect, useRef, useState } from 'react';

function TabButton({active, onClick, children}) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm border ${active ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} `}>
      {children}
    </button>
  );
}

export default function Assistant() {
  const [tab, setTab] = useState('generate'); // generate | translate | mic
  const [input, setInput] = useState('');
  const [format, setFormat] = useState('SOAP');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [src, setSrc] = useState('English');
  const [tgt, setTgt] = useState('Spanish');
  const [translated, setTranslated] = useState('');

  const recRef = useRef(null);
  const [micOn, setMicOn] = useState(false);

  // Mic setup
  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Mic/Dictation not supported in this browser. Try Chrome.'); return; }
    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = false;
    r.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ');
      setInput(prev => (prev ? prev + ' ' : '') + text);
    };
    r.onend = () => setMicOn(false);
    recRef.current = r;
    setMicOn(true);
    r.start();
  };
  const stopMic = () => { if (recRef.current) recRef.current.stop(); };

  const generate = async () => {
    setErr(''); setNote(''); setLoading(true);
    try {
      const resp = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ input, format }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed');
      setNote(data.note || '');
    } catch (e) { setErr(e?.message || 'Error'); }
    setLoading(false);
  };

  const doTranslate = async () => {
    setErr(''); setTranslated(''); setLoading(true);
    try {
      const resp = await fetch('/api/translate', { method: 'POST', body: JSON.stringify({ text: input, source: src, target: tgt })});
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed');
      setTranslated(data.text || '');
    } catch (e) { setErr(e?.message || 'Error'); }
    setLoading(false);
  };

  const copy = async (txt) => {
    try { await navigator.clipboard.writeText(txt); alert('Copied'); } catch {}
  };

  const downloadTxt = (txt, filename='docik_note.txt') => {
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">DocIK Assistant</h1>
      <p className="text-center mb-6">No PHI. For clinician workflow demo only.</p>

      <div className="flex gap-2 justify-center mb-6">
        <TabButton active={tab==='generate'} onClick={()=>setTab('generate')}>Generate</TabButton>
        <TabButton active={tab==='translate'} onClick={()=>setTab('translate')}>Translate</TabButton>
        <TabButton active={tab==='mic'} onClick={()=>setTab('mic')}>Mic</TabButton>
      </div>

      {tab === 'generate' && (
        <>
          <label className="text-sm font-medium">Format</label>
          <select value={format} onChange={(e)=>setFormat(e.target.value)} className="border rounded-xl p-3 mb-3 w-full">
            <option>SOAP</option>
            <option>H&P</option>
            <option>Discharge Summary</option>
          </select>
          <textarea rows={8} className="w-full border rounded-xl p-3"
            placeholder="Dictation or notes here (no PHI)" value={input} onChange={e=>setInput(e.target.value)} />
          <button onClick={generate} disabled={loading || !input.trim()}
            className="mt-4 w-full bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Generating...' : 'Generate Note'}
          </button>
          {err && <p className="mt-3 text-red-600">{err}</p>}
          {note && (<>
            <pre className="bg-gray-100 p-4 mt-6 rounded-xl whitespace-pre-wrap">{note}</pre>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>copy(note)} className="border rounded-xl px-4 py-2">Copy</button>
              <button onClick={()=>downloadTxt(note)} className="border rounded-xl px-4 py-2">Export .txt</button>
            </div>
          </>)}
        </>
      )}

      {tab === 'translate' && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium">From</label>
              <select value={src} onChange={e=>setSrc(e.target.value)} className="border rounded-xl p-3 w-full">
                <option>English</option><option>Spanish</option><option>French</option><option>Arabic</option><option>Bengali</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <select value={tgt} onChange={e=>setTgt(e.target.value)} className="border rounded-xl p-3 w-full">
                <option>Spanish</option><option>English</option><option>French</option><option>Arabic</option><option>Bengali</option>
              </select>
            </div>
          </div>
          <textarea rows={6} className="w-full border rounded-xl p-3"
            placeholder="Patient instructions (no PHI)" value={input} onChange={e=>setInput(e.target.value)} />
          <button onClick={doTranslate} disabled={loading || !input.trim()}
            className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Translating...' : 'Translate'}
          </button>
          {err && <p className="mt-3 text-red-600">{err}</p>}
          {translated && <pre className="bg-gray-100 p-4 mt-6 rounded-xl whitespace-pre-wrap">{translated}</pre>}
        </>
      )}

      {tab === 'mic' && (
        <>
          <p className="mb-3 text-sm text-gray-600">Use Chrome for best mic support. Click Start, dictate, then Stop.</p>
          <div className="flex gap-2">
            <button onClick={startMic} className="border rounded-xl px-4 py-2">Start Mic</button>
            <button onClick={stopMic} className="border rounded-xl px-4 py-2">Stop</button>
          </div>
          <textarea rows={8} className="w-full border rounded-xl p-3 mt-4"
            placeholder="Dictation will appear here..." value={input} onChange={e=>setInput(e.target.value)} />
        </>
      )}
    </main>
  );
}
