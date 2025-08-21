import { useState } from 'react';

const SOURCES = [
  { key: 'AHA/ACC', label: 'AHA/ACC (cardiology)' },
  { key: 'IDSA', label: 'IDSA (infectious disease)' },
  { key: 'CDC', label: 'CDC' },
  { key: 'NEJM', label: 'NEJM' },
  { key: 'JAMA', label: 'JAMA' },
  { key: 'GOLD', label: 'GOLD (COPD)' },
];

const QUICK = [
  { label: 'AHA/ACC', url: 'https://www.google.com/search?q=site%3Aprofessional.heart.org+%s' },
  { label: 'IDSA', url: 'https://www.google.com/search?q=site%3Aidsociety.org+%s' },
  { label: 'CDC', url: 'https://www.google.com/search?q=site%3Acdc.gov+%s' },
  { label: 'NEJM', url: 'https://www.google.com/search?q=site%3Anejm.org+%s' },
  { label: 'JAMA', url: 'https://www.google.com/search?q=site%3Ajamanetwork.com+%s' },
  { label: 'GOLD', url: 'https://www.google.com/search?q=site%3Agoldcopd.org+%s' },
];

export default function Guidelines() {
  const [q, setQ] = useState('community-acquired pneumonia outpatient therapy');
  const [sel, setSel] = useState(['IDSA','CDC']);
  const [res, setRes] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const toggle = (k) => setSel(s => s.includes(k) ? s.filter(x=>x!==k) : [...s, k]);

  const ask = async () => {
    setErr(''); setRes(''); setLoading(true);
    try {
      const resp = await fetch('/api/guidelines', { method: 'POST', body: JSON.stringify({ q, sources: sel }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Failed');
      setRes(data.summary || '');
    } catch (e) { setErr(e?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Guidelines Search (DocIK)</h1>
      <p className="text-center mb-6">Summaries constrained to major clinical orgs. Always verify primary sources.</p>

      <label className="text-sm font-medium">Query</label>
      <input value={q} onChange={e=>setQ(e.target.value)} className="w-full border rounded-xl p-3 mb-3" />

      <div className="grid md:grid-cols-3 gap-2 mb-4">
        {SOURCES.map(s => (
          <label key={s.key} className="border rounded-xl p-3 flex items-center gap-2">
            <input type="checkbox" checked={sel.includes(s.key)} onChange={()=>toggle(s.key)} />
            {s.label}
          </label>
        ))}
      </div>

      <button onClick={ask} className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-purple-700">
        Ask DocIK (Guidelines)
      </button>

      {err && <p className="mt-4 text-red-600">{err}</p>}
      {res && <pre className="bg-gray-100 p-4 mt-6 rounded-xl whitespace-pre-wrap">{res}</pre>}

      <h2 className="text-xl font-semibold mt-10 mb-2">Quick source links</h2>
      <div className="flex gap-2 flex-wrap">
        {QUICK.map(qs => (
          <a key={qs.label} className="underline text-blue-700" target="_blank" rel="noreferrer"
             href={qs.url.replace('%s', encodeURIComponent(q))}>{qs.label}</a>
        ))}
      </div>
    </main>
  );
}
