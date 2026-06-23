'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { login, isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !loading && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen login-bg-pro flex items-center justify-center">
        <div className="text-sm font-medium text-slate-400 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          Authenticating...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen login-bg-pro flex flex-col items-center justify-center p-6">
      
      {/* Sleek Logo / Header Placeholder */}
      <div className="mb-12 flex flex-col items-center slide-up">
        <div className="w-20 h-20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] mb-6 relative group">
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-white/30 group-hover:bg-white/5"></div>
          <Image 
            src="/RadiceLogoNoText_light.svg" 
            alt="RaDiCe Logo" 
            fill
            className="object-contain p-4 invert brightness-0 opacity-95 drop-shadow-md transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">
          RaDiCe Admin
        </h1>
        <p className="text-slate-500 text-sm">
          Enter your credentials to access the workspace
        </p>
      </div>

      {/* Main Login Card */}
      <div className="pro-card px-8 py-10 sm:px-10 rounded-2xl w-full max-w-[400px] slide-up-delay-1 relative z-10">
        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-900/50 rounded-xl flex items-start gap-3">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
            </svg>
            <p className="text-sm text-red-400 leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-slate-300"
            >
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 pro-input rounded-xl text-sm"
              placeholder="director@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-slate-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pro-input rounded-xl text-sm pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-pro font-medium py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 text-[14px]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Subtle footer */}
      <div className="mt-12 text-xs text-slate-600 slide-up-delay-2 font-medium">
        &copy; {new Date().getFullYear()} RaDiCe Workflow Management System
      </div>
    </div>
  );
}
