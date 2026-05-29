/**
 * AuthForm.tsx
 * Handles both sign in and sign up with email/password,
 * and GitHub OAuth. Supabase manages the session automatically
 * after a successful auth — App.tsx listens for the session change.
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthForm() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // Calls the appropriate Supabase auth method based on current mode
    // Supabase handles the session automatically on success -
    // App.tsx picks it up via onAuthStateChange
    const handleEmailAuth = async () => {
        setLoading(true)
        setError('')
        setMessage('')

        const { error } =
            mode === 'signup'
                ? await supabase.auth.signUp({ email, password })
                : await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
        } else if (mode === 'signup') {
            setMessage('Check your email to confirm your account.')
        }

        setLoading(false)
    }

    // Triggers GitHub OAuth redirect - Supabase handles the callback URL
    // Program requests the 'repo' scope so it can fetch files from private repos later
    const handleGitHubAuth = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                //Request access to user's repos for the GitHub file picker
                scopes: 'read:user repo',
                redirectTo: window.location.origin,
            },
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2x1 font-bold text-blue-400 tracking-wide">⌥ Code Reviewer</h1>
                    <p className="text-gray-500 text-sm mt-1">AI-powered code review in seconds</p>
                </div>

                <div className="panel">
                    {/* Mode toggle */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setMode('signin')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                mode === 'signin'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            Sign in
                        </button>
                        <button
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                                mode === 'signup'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            Sign up
                        </button>
                    </div>

                    {/* GitHub OAuth */}
                    <button
                        onClick={handleGitHubAuth}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm font-medium transition-colors mb-4"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                        </svg>
                        Continue with GitHub
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-gray-800" />
                        <span className="text-gray-600 text-xs">or</span>
                        <div className="flex-1 h-px bg-gray-800" />
                    </div>

                    {/* Email/Password Auth */}
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="label">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                                placeholder="you@example.com"
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                                placeholder="••••••••"
                                className="input"
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs">{error}</p>}
                        {message && <p className="text-green-400 text-xs">{message}</p>}

                        <button
                            onClick={handleEmailAuth}
                            disabled={loading || !email || !password}
                            className="btn-primary w-full mt-1"
                        >
                                {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
