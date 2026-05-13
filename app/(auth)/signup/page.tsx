'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp(email, password);
      router.push('/projects');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-md">
      <div className="w-full max-w-sm">
        <div className="bg-surface border border-border rounded-xl p-lg shadow-[var(--shadow-card)]">
          <div className="text-center mb-lg">
            <div className="w-10 h-10 rounded-lg bg-accent mx-auto flex items-center justify-center font-bold text-white">R</div>
            <h1 className="mt-md text-xl font-semibold text-neutral">Create account</h1>
            <p className="text-text-dim text-sm mt-1">Start designing your renovation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-md">
            {error && <p className="text-red-600 text-sm text-center bg-red-50 p-sm rounded-md">{error}</p>}
            <div>
              <label className="text-xs font-medium text-text-dim">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full border border-border rounded-md px-sm py-2 text-neutral text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface" required />
            </div>
            <div>
              <label className="text-xs font-medium text-text-dim">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-border rounded-md px-sm py-2 text-neutral text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-surface" minLength={6} required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-accent text-white font-medium py-2 rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-xs">
              <UserPlus size={15} /> {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-text-dim mt-lg">
            Already have an account? <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
