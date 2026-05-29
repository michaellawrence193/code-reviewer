/**
 * Header.tsx
 * Top navigation bar shown to authenticated users.
 * Displays the app name, user email, and a sign out button.
 */

import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type Props = {
    user: User
    onNewReview: () => void
}

export function Header({ user, onNewReview }: Props) {
    // Signs out the current user - Supabase clears the session cookie
    // and App.tsx's onAuthStateChange listener sets user to null
    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <header className="border-b border-gray-800 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-lg font-bold text-blue-400 tracking-wide">⌥ Code Reviewer</h1>
                    <button
                        onClick={onNewReview}
                        className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        + New Review
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 hidden sm:block">{user.email}</span>
                    <button onClick={handleSignOut} className="btn-ghost text-sm">
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    )
}