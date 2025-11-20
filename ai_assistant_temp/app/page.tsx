import ChatWidget from "@/vercel/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Educational Management Platform
          </h1>
          <p className="text-lg text-slate-600">
            Welcome to the admin dashboard. Use the AI Assistant on the right to
            answer questions about the platform without risking any data
            changes.
          </p>
          <div className="p-4 bg-white rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-2">Try asking:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>How do I add a new student?</li>
              <li>Where can I find the grade reports?</li>
              <li>Why is the attendance button disabled?</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center">
          <ChatWidget />
        </div>
      </div>
    </main>
  );
}
