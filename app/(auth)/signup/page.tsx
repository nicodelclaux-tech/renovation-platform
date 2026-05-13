'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import Link from 'next/link';

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
    <div className="min-h-screen bg-primary flex items-center justify-center p-md">
      <div className="w-full max-w-sm space-y-lg">
        <div className="text-center">
          <div className="w-12 h-12 rounded-md bg-accent mx-auto flex items-center justify-center font-bold text-neutral text-xl">R</div>
          <h1 className="mt-md text-2xl font-bold text-neutral">Create Account</h1>
          <p className="text-text-dim text-sm mt-xs">Start designing your renovation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-md">
          {error && <p className="text-red-400 text-sm text-center bg-red-400/10 p-sm rounded-md">{error}</p>}
          <div>
            <label className="text-xs font-mono text-text-dim uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-xs w-full bg-secondary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
              required
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-dim uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-xs w-full bg-secondary border border-border rounded-md px-sm py-xs text-neutral text-sm focus:outline-none focus:border-accent"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-neutral font-bold py-xs rounded-md hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-dim">
          Already have an account? <Link href="/login" className="text-accent underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
