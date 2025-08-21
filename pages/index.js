export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 p-6">
      <section className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Streamline Clinical Documentation with AI</h1>
        <p className="text-lg mb-6">
          DocIK is your HIPAA-compliant AI assistant for faster, EMR-ready notes — including SOAP, H&P, and discharge summaries.
          Designed by clinicians, for clinicians.
        </p>
        <a href="/demo" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-blue-700">
          Try DocIK for Free
        </a>
      </section>
    </main>
  );
}
