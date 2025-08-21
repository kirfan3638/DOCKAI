export default function Privacy() {
  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Privacy Notice</h1>
      <p className="mb-4">This demo is HIPAA-aware and designed for educational/preview use only. Do not submit PHI.</p>
      <ul className="list-disc list-inside space-y-1">
        <li>No data is stored server-side; requests are processed in-memory.</li>
        <li>Environment secrets are managed via Vercel and never exposed to the client.</li>
        <li>Users are responsible for ensuring HIPAA compliance in their environment.</li>
      </ul>
    </main>
  );
}
