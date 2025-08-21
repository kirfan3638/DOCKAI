import { useState } from 'react';

export default function Demo() {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const generateNote = () => {
    setLoading(true);
    setTimeout(() => {
      setNote(`**SOAP Note (Mock)**

**S:** 45-year-old male with history of HTN presents with chest tightness radiating to left arm, onset 2 hours ago.

**O:** BP 140/90, HR 88, RR 18, O2 97%. ECG shows ST depression in leads II, III, aVF.

**A:** Suspected NSTEMI. Differential: GERD, angina.

**P:** Admit to telemetry, start aspirin, beta-blocker, obtain troponins, consult cardiology.`);
      setLoading(false);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">DocIK Live Demo</h1>
      <p className="mb-6 text-center">
        Click below to simulate a SOAP note generated from a clinician’s dictation.
      </p>
      <div className="text-center">
        <button
          onClick={generateNote}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Note'}
        </button>
      </div>
      <pre className="bg-gray-100 p-4 mt-8 rounded-xl whitespace-pre-wrap">
        {note}
      </pre>
    </main>
  );
}
