import { useState } from 'react';

export default function Demo() {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const generateNote = () => {
    setLoading(true);
    setTimeout(() => {
      setNote(`**SOAP Note (Mock)**

**S:** 45-year-old male with hx HTN presents with chest tightness radiating to L arm x2h.
**O:** BP 140/90, HR 88, RR 18, SpO2 97% RA.
**A:** Suspected NSTEMI. DDx: GERD, unstable angina.
**P:** Telemetry admit, ASA, beta-blocker, serial troponins, cardiology consult.`);
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">DocIK Live Demo</h1>
      <div className="text-center">
        <button onClick={generateNote} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow hover:bg-blue-700">
          {loading ? 'Generating...' : 'Generate Mock SOAP'}
        </button>
      </div>
      <pre className="bg-gray-100 p-4 mt-8 rounded-xl whitespace-pre-wrap">{note}</pre>
    </main>
  );
}
