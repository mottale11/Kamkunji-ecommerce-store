'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
          <FaEnvelope className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification link to <span className="font-medium">{email || 'your email address'}</span>
        </p>
        <p className="text-sm text-gray-600">
          Please click the link in the email to verify your account and complete your registration.
        </p>
        <div className="mt-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-500"
          >
            <FaArrowLeft className="mr-1" /> Back to home
          </Link>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            Didn't receive an email?{' '}
            <Link 
              href="/auth/signin" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Try signing in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
