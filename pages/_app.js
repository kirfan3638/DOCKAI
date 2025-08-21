import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <div className="w-full bg-yellow-50 text-yellow-900 text-sm px-4 py-2">
        <strong>HIPAA Notice:</strong> Do not enter Protected Health Information (PHI) in this demo. Content is for clinician workflow demos only.
      </div>
      <Component {...pageProps} />
      <footer className="text-center text-xs text-gray-500 py-8">
        <a className="underline mx-2" href="/privacy">Privacy</a>
        <a className="underline mx-2" href="/terms">Terms</a>
      </footer>
    </>
  );
}
