export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900 p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-center">DocIK</h1>
      <p className="text-center text-gray-700 mb-8">HIPAA-aware clinical documentation tools. No PHI stored.</p>
      <div className="flex flex-wrap gap-3 justify-center">
        <a href="/demo" className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-blue-700">Open Demo</a>
        <a href="/assistant" className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-green-700">Open Assistant</a>
        <a href="/guidelines" className="bg-purple-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-purple-700">Guidelines Search</a>
      </div>
    </main>
  );
}
