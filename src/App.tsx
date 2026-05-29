/**
 * App.tsx
 * Root component — listens for Supabase auth state changes
 * and renders either the AuthForm (logged out) or the main
 * app (logged in).
 *
 * Views (when logged in):
 *   dashboard — list of past reviews
 *   new       — code input + review panel
 */

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { AuthForm } from './components/AuthForm'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { CodeInput } from './components/CodeInput'
import { ReviewPanel } from './components/ReviewPanel'
import { reviewCode } from './lib/claude'

type View = 'dashboard' | 'new'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [view, setView] = useState<View>('dashboard')

  // Review state
  const [review, setReview] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [pendingCode, setPendingCode] = useState('')
  const [pendingLanguage, setPendingLanguage] = useState('')
  const [pendingFilename, setPendingFilename] = useState<string | undefined>()
  const [saved, setSaved] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Get the current session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for sign in / sign out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Clean up the listener when the component unmounts
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (code:string, language: string, filename?: string) => {
    setReview('')
    setSaved(false)
    setPendingCode(code)
    setPendingLanguage(language)
    setPendingFilename(filename)
    setReviewLoading(true)

    try {
      await reviewCode(code, language, chunk => setReview(chunk))
    } catch {
      setReview('Something went wrong. Please try again.')
    } finally {
      setReviewLoading(false)
    }
  }

  // Saves the current review to Supabase under the authenticated user's ID.
  // Row Level Security on the reviews tables ensures users can only
  // ever read and write their own rows - enforced at the database level.
  const handleSave = async () => {
    if (!user || !review) return
    await supabase.from('reviews').insert({
      user_id: user.id,
      code: pendingCode,
      language: pendingLanguage,
      review,
      source: pendingFilename ? 'github' : 'manual',
      filename: pendingFilename ?? null,
    })
    setSaved(true)
    // increment trigger so Dashboard refetches when user goes back
    setRefreshTrigger(t => t + 1)
  }

  // Resets review state and switches to the new review view.
  // Called from both the Header button and the Dashboard empty state.
  const handleNewReview = () => {
    setView('new')
    setReview('')
    setSaved(false)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm animate-pulse">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen">
      <Header user={user} onNewReview={handleNewReview} />
      <main className="max-w-4xl mx-auto px-6 py-10 pb-20">
        {view === 'dashboard' && (
          <Dashboard onNewReview={handleNewReview} refreshTrigger={refreshTrigger} />
        )}
        {view === 'new' && (
          <div>
            <button
              onClick={() => setView('dashboard')}
              className="text-gray-500 hover:text-gray-300 text-sm mb-8 block"
            >
              Back to Dashboard
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CodeInput onSubmit={handleSubmit} loading={reviewLoading} />
              {(review || reviewLoading) && (
                <ReviewPanel
                  review={review}
                  loading={reviewLoading}
                  saved={saved}
                  onSave={handleSave}
                  onNewReview={handleNewReview}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
