import '../styles/globals.css';
import { useEffect, useState } from 'react';

function HipaaBanner() {
  const [accepted, setAccepted] = useState(true);
  useEffect(() => {
    const v = window.localStorage.getItem('docik_hipaa_ok');
    if (v !== 'yes') setAccepted(false);
  }, []);
  if (accepted) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-xl z-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        <p className="text-sm">
          🔐 For demo only. Do not submit protected health information (PHI). No data is stored. By continuing you agree to the{' '}
          <a href="/privacy" className="underline">Privacy</a> and <a href="/terms" className="underline">Terms</a>.
        </p>
        <button onClick={() => { window.localStorage.setItem('docik_hipaa_ok','yes'); location.reload(); }}
          className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm">
          I understand
        </button>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }) {
  return (<>
    <Component {...pageProps} />
    <HipaaBanner />
  </>);
}
