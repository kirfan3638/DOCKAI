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

      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 py-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-left space-y-2">
            <li>✅ Voice Dictation to Structured Notes</li>
            <li>✅ HIPAA-Compliant Templates</li>
            <li>✅ Multilingual Patient Instructions</li>
            <li>✅ Timer + Task Tracking for Rounds</li>
            <li>✅ EMR-Ready Export</li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside text-left space-y-2">
            <li>Dictate or type your note</li>
            <li>Review AI-generated output</li>
            <li>Copy into your EMR or export</li>
            <li>Done in minutes</li>
          </ol>
        </div>
      </section>

      <section className="max-w-3xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Join the Beta</h2>
        <p className="text-md mb-6">
          We’re inviting a small group of early users to test DocIK and shape its roadmap.
        </p>
        <form
          action="https://formspree.io/f/mnqelvjp"
          method="POST"
          className="space-y-4 text-left max-w-md mx-auto"
        >
          <input type="text" name="name" placeholder="Your Name" required className="w-full border border-gray-300 rounded-xl p-3"/>
          <input type="email" name="email" placeholder="Your Email" required className="w-full border border-gray-300 rounded-xl p-3"/>
          <textarea name="message" placeholder="Optional Message" rows="3" className="w-full border border-gray-300 rounded-xl p-3"/>
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-green-700 w-full">
            Request Early Access
          </button>
        </form>
      </section>
    </main>
  );
}
