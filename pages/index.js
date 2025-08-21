export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 p-6">
      <section className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Streamline Clinical Documentation with AI</h1>
        <p className="text-lg mb-6">
          DocIK is a HIPAA-aware documentation assistant for faster, EMR-ready notes — SOAP, H&amp;P, and Discharge.
        </p>
        <div className="flex gap-3 justify-center">
          <a href="/demo" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-blue-700">
            Try Demo
          </a>
          <a href="/assistant" className="bg-green-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-green-700">
            Open Assistant
          </a>
        </div>
      </section>
      <footer className="max-w-4xl mx-auto text-center text-sm text-gray-500">
        <a className="underline" href="/privacy">Privacy</a> · <a className="underline" href="/terms">Terms</a>
      </footer>
    </main>
  );
}
