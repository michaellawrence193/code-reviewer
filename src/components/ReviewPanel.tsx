/**
 * ReviewPanel.tsx
 * Displays the AI review output with markdown formatting.
 * Shows a loading state while the review is being generated.
 * Offers a button to save the review to Supabase.
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
    review: string
    loading: boolean
    saved: boolean
    onSave: () => void
    onNewReview: () => void
}

export function ReviewPanel({ review, loading, saved, onSave, onNewReview }: Props) {
    // The save button only appears once the review is loaded and not yet saved.
    // Once saved it switches to a green checkmark - no duplicate saves possible.
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Review</h2>
                <div className="flex gap-2">
                    {!loading && review && !saved && (
                        <button onClick={onSave} className="btn-primary text-sm px-3 py-1.5">
                            Save review
                        </button>
                    )}
                    {saved && (
                        <span className="text-green-400 text-sm flex items-center gap-1">
                            Saved
                        </span>
                    )}
                    <button onClick={onNewReview} className="btn-ghost text-sm">
                        New review
                    </button>
                </div>
            </div>

            <div className="panel min-h-64">
                {loading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="animate-pulse">Analysing your code</span>
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-100">.</span>
                        <span className="animate-bounce delay-200">.</span>
                    </div>
                )}
                {review && (
                    <div className="md-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{review}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}