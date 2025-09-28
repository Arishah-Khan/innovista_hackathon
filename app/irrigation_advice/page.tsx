'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface AgentResponse {
  message: string;
  redirect: boolean;
  redirect_url: string | null;
  audio_url: string | null;
}

export default function AgentPage() {
  const [question, setQuestion] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''; // Fallback to empty string if undefined

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const formData = new FormData();
      if (question) {
        formData.append('question', question);
      }
      if (audioFile) {
        formData.append('audio', audioFile);
      }

      const res = await fetch(`${API_URL}/agent`, {
        method: 'POST',
        body: formData,
        // No need to set 'Content-Type' manually; fetch handles it for FormData
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      setResponse(data);

      if (data.redirect && data.redirect_url) {
        router.push(data.redirect_url);
      }
    } catch (err: unknown) {
      // Use unknown to comply with TypeScript's catch clause requirements
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing your request.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Commenting out handleAudioChange since there's no audio input in the form
  /*
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };
  */

  return (
    <div
      className="relative h-screen w-full flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(/irrigation.jpg)" }}
    >
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
          Agentic Agriflow - Irrigation Advisor
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">
              Ask about irrigation or a specific field (e.g., Field A)
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Should Field A be irrigated in the next 48 hours?"
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!question && !audioFile)}
            className={`w-full py-2 px-4 rounded-md text-white font-semibold ${
              loading || (!question && !audioFile)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md">
            <h2 className="text-lg font-semibold">Response</h2>
            <p>{response.message}</p>
            {response.audio_url && (
              <div className="mt-4">
                <audio controls className="w-full">
                  <source src={`${API_URL}${response.audio_url}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}