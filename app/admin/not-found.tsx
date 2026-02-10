'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Not Found</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The resource you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
