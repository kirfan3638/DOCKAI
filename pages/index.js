export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 p-6">
      <section className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold mb-4">DocIK — Clinical Documentation Assistant</h1>
        <p className="text-lg mb-6">
          HIPAA-aware AI for EMR-ready notes, multilingual instructions, and quick guideline summaries.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="/demo" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-blue-700">Open Demo</a>
          <a href="/assistant" className="bg-green-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-green-700">Open Assistant</a>
          <a href="/guidelines" className="bg-purple-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-purple-700">Guidelines Search</a>
        </div>
      </section>
    </main>
  );
}
