import { useState } from 'react';

export default function Assistant() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setResponse(data.output || 'No response');
    } catch (err) {
      setResponse('Error connecting to API');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">DocIK Assistant</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          rows="4"
          className="w-full border border-gray-300 rounded-xl p-3"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-2xl text-lg shadow-lg hover:bg-green-700"
        >
          {loading ? 'Thinking...' : 'Ask Assistant'}
        </button>
      </form>
      <div className="mt-6 bg-gray-100 p-4 rounded-xl whitespace-pre-wrap">
        {response}
      </div>
    </main>
  );
}
