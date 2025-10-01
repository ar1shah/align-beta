import Link from 'next/link';
import { Button } from './_components/Button';

export default function Home() {
  // Check if env vars are missing
  const envMissing =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ⚙️ Setup Required
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome to Align! Before you can start using the app, you need to
            configure your Supabase credentials.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h2 className="font-semibold text-amber-900 mb-2">
              Missing Environment Variables
            </h2>
            <p className="text-sm text-amber-800">
              Please create a <code className="bg-amber-100 px-2 py-1 rounded">.env.local</code> file
              in the project root with the following variables:
            </p>
          </div>
          <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-sm mb-6">
            <pre>
              NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{'\n'}
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
            </pre>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong className="text-gray-900">Step 1:</strong> Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">supabase.com</a></p>
            <p><strong className="text-gray-900">Step 2:</strong> Copy your Project URL and anon public key from Project Settings → API</p>
            <p><strong className="text-gray-900">Step 3:</strong> Create <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> in the project root and paste the values</p>
            <p><strong className="text-gray-900">Step 4:</strong> Run the SQL schema from <code className="bg-gray-100 px-2 py-1 rounded">SETUP.md</code> in your Supabase SQL Editor</p>
            <p><strong className="text-gray-900">Step 5:</strong> Restart the development server</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900 tracking-tight">
            Align
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find your perfect realtor match. Connect with experienced agents
            who understand your unique needs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" fullWidth>
              Log In
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="outline" fullWidth>
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="pt-12 text-sm text-gray-500">
          <p>Modern real estate connections, simplified.</p>
        </div>
      </div>
    </div>
  );
}

