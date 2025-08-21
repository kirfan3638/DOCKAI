import { useEffect, useRef, useState } from 'react';

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map(t => (
        <button key={t}
          onClick={() => onChange(t)}
          className={"px-4 py-2 rounded-xl text-sm " + (active===t ? "bg-blue-600 text-white" : "bg-gray-100")}>
          {t}
        </button>
      ))}
    </div>
  );
}

export default function Assistant() {
  const [tab, setTab] = useState('Generate');
  const [format, setFormat] = useState('SOAP');
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [langIn, setLangIn] = useState('English');
  const [langOut, setLangOut] = useState('English');
  const [translation, setTranslation] = useState('');

  // Mic
  const recRef = useRef(null);
  const [micOn, setMicOn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = 'en-US';
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e) => {
          let t = '';
          for (let i=0; i<e.results.length; i++) {
            t += e.results[i][0].transcript;
          }
          setInput(prev => (prev ? prev + ' ' : '') + t.trim());
        };
        rec.onend = () => setMicOn(false);
        recRef.current = rec;
      }
    }
  }, []);

  const toggleMic = () => {
    if (!recRef.current) {
      alert('SpeechRecognition not supported in this browser.');
      return;
    }
    if (micOn) {
      recRef.current.stop();
      setMicOn(false);
    } else {
      setInput(''); // fresh capture
      recRef.current.start();
      setMicOn(true);
    }
  };

  const generate = async () => {
    setErr(''); setNote(''); setLoading(true);
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, format })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed');
      setNote(data.note || '');
    } catch(e) {
      setErr(e.message || 'Error');
    } finally { setLoading(false); }
  };

  const doTranslate = async () => {
    setErr(''); setTranslation(''); setLoading(true);
    try {
      const resp = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, from: langIn, to: langOut })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed');
      setTranslation(data.translation || '');
    } catch(e) {
      setErr(e.message || 'Error');
    } finally { setLoading(false); }
  };

  const copyText = (txt) => {
    navigator.clipboard.writeText(txt || '').then(()=>{},()=>{});
  };

  const exportTxt = (txt, filename='docik-note.txt') => {
    const blob = new Blob([txt || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">DocIK Assistant</h1>
      <p className="text-center mb-6 text-sm text-gray-600">No PHI. Nothing is stored. Outputs are EMR-ready drafts.</p>

      <Tabs tabs={['Generate','Translate','Mic']} active={tab} onChange={setTab} />

      {tab==='Mic' && (
        <div className="mb-6">
          <button onClick={toggleMic}
            className={"px-4 py-2 rounded-xl " + (micOn ? "bg-red-600 text-white" : "bg-green-600 text-white")}>
            {micOn ? 'Stop Mic' : 'Start Mic (English)'}
          </button>
          <p className="text-sm mt-2 text-gray-600">Uses your browser’s Web Speech API. Best in Chrome.</p>
        </div>
      )}

      <div className="grid gap-3 mb-4">
        {tab!=='Translate' && (
          <>
            <label className="text-sm font-medium">Output format</label>
            <select value={format} onChange={e=>setFormat(e.target.value)} className="border rounded-xl p-3">
              <option value="SOAP">SOAP</option>
              <option value="H&P">H&amp;P</option>
              <option value="Discharge Summary">Discharge Summary</option>
            </select>
          </>
        )}

        {tab==='Translate' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">From</label>
              <input value={langIn} onChange={e=>setLangIn(e.target.value)} className="border rounded-xl p-3 w-full" />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <input value={langOut} onChange={e=>setLangOut(e.target.value)} className="border rounded-xl p-3 w-full" />
            </div>
          </div>
        )}

        <textarea rows={8} placeholder={tab==='Translate' ? "Text to translate (no PHI)" : "Dictation or notes here (no PHI)"}
          className="w-full border rounded-xl p-3" value={input} onChange={e=>setInput(e.target.value)} />
      </div>

      {tab==='Generate' && (
        <button onClick={generate} disabled={loading || !input.trim()}
          className="mt-1 w-full bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Note'}
        </button>
      )}

      {tab==='Translate' && (
        <button onClick={doTranslate} disabled={loading || !input.trim()}
          className="mt-1 w-full bg-purple-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-purple-700 disabled:opacity-50">
          {loading ? 'Translating...' : 'Translate'}
        </button>
      )}

      <div className="mt-6 space-y-6">
        {note && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Output</h2>
              <div className="flex gap-2">
                <button onClick={()=>copyText(note)} className="text-sm underline">Copy</button>
                <button onClick={()=>exportTxt(note)} className="text-sm underline">Export .txt</button>
              </div>
            </div>
            <pre className="bg-gray-100 p-4 rounded-xl whitespace-pre-wrap">{note}</pre>
          </section>
        )}
        {translation && (
          <section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold">Translation</h2>
              <div className="flex gap-2">
                <button onClick={()=>copyText(translation)} className="text-sm underline">Copy</button>
                <button onClick={()=>exportTxt(translation,'docik-translation.txt')} className="text-sm underline">Export .txt</button>
              </div>
            </div>
            <pre className="bg-gray-100 p-4 rounded-xl whitespace-pre-wrap">{translation}</pre>
          </section>
        )}
        {err && <p className="text-red-600">{err}</p>}
      </div>
    </main>
  );
}
