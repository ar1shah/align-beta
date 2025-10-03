'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, FileTextIcon } from 'lucide-react';

interface MSASignCardProps {
  hasSigned: boolean;
  realtorId: string;
}

export function MSASignCard({ hasSigned, realtorId }: MSASignCardProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');

  async function handleSign() {
    if (!agreed) {
      setError('Please check the agreement box to continue');
      return;
    }

    setSigning(true);
    setError('');

    try {
      const res = await fetch('/api/realtor/sign-msa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ realtorId }),
      });

      if (!res.ok) {
        throw new Error('Failed to sign MSA');
      }

      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
      setSigning(false);
    }
  }

  if (hasSigned) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Master Service Agreement
            </h2>
            <p className="text-sm text-green-600 font-medium">Signed & Active</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          You have successfully signed the Align Referral MSA. You are now able to
          receive and accept leads.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <FileTextIcon className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Master Service Agreement
        </h2>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-3">
          ALIGN REFERRAL MASTER SERVICE AGREEMENT
        </h3>

        <div className="space-y-4 text-sm text-gray-700">
          <p>
            This Master Service Agreement (&quot;Agreement&quot;) is entered into between
            Align Agents RE (&quot;Align&quot;) and the undersigned real estate agent
            (&quot;Realtor&quot;).
          </p>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Services</h4>
            <p>
              Align will provide qualified buyer and seller leads to Realtor within
              Realtor&apos;s designated service areas. Realtor agrees to respond to
              assigned leads within 24 hours and provide professional representation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Referral Fee</h4>
            <p>
              Realtor agrees to pay Align a referral fee as specified in individual
              deal contracts. Standard referral fees range from 25% to 35% of the
              gross commission earned on closed transactions.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Territory</h4>
            <p>
              Realtor&apos;s territory and coverage areas will be defined in their
              profile settings and may be updated at any time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              4. Independent Contractor
            </h4>
            <p>
              Realtor is an independent contractor. This Agreement does not create
              an employment, partnership, or joint venture relationship.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              5. Compliance & Licensing
            </h4>
            <p>
              Realtor warrants that they hold all necessary real estate licenses in
              good standing and will comply with all applicable laws, regulations,
              and professional standards.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">6. Term</h4>
            <p>
              This Agreement remains in effect until terminated by either party with
              30 days written notice. All pending transactions at termination will
              be completed under this Agreement&apos;s terms.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I have read and agree to the terms of this Master Service Agreement. By
            checking this box, I electronically sign this agreement.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSign}
          disabled={!agreed || signing}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {signing ? 'Signing...' : 'Sign Agreement'}
        </button>
      </div>
    </div>
  );
}

