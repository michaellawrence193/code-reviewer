/**
 * Dashboard.tsx
 * Shows the user's past reviews fetched from Supabase.
 * Each review card shows the language, filename, date,
 * and the first line of the review. Clicking opens the full review.
 * Reviews can be deleted individually.
 */

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase, type Review } from '../lib/supabase'

type Props = {
    onNewReview: () => void
    refreshTrigger: number
}

export function Dashboard({ onNewReview, refreshTrigger }: Props) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<Review | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Fetch reviews whenever the component mounts or refreshTrigger changes.
    // refreshTrigger is incremented by App.tsx after a save, which causes
    // this effect to re-run and pull the latest data from Supabase.
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false })
            setReviews(data ?? [])
            setLoading(false)
        }
        fetchReviews()
    }, [refreshTrigger])

    // e.stopPropagation() prevents the card's onClick from firing
    // when the delete button is clicked, so program doesn't open the review
    // at the same time as deleting it
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        // Stop the click from opening the review
        e.stopPropagation()
        setDeleting(id)
        await supabase.from('reviews').delete().eq('id', id)
        setReviews(prev => prev.filter(r => r.id !== id))
        setDeleting(null)
    }

    // Detail view for a selected review
    if (selected) {
        return (
            <div>
                <button
                    onClick={() => setSelected(null)}
                    className="text-gray-500 hover:text-gray-300 text-sm mb-6 block"
                >
                    Back to reviews
                </button>

                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <span className="text-sx px-2 py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
                        {selected.language}
                    </span>
                    {selected.filename && (
                        <span className="text=xs text-gray-500 font-mono">{selected.filename}</span>
                    )}
                    <span className="text-xs text-gray-600">
                        {new Date(selected.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                        selected.source === 'github'
                            ? 'bg-gray-800 text-gray-400'
                            : 'bg-gray-800 text-gray-400'
                    }`}>
                        {selected.source === 'github' ? 'GitHub' : 'Manual'}
                    </span>
                </div>

                {/* Code preview */}
                L<details className="mb-4">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 mb-2">
                        View submitted code
                    </summary>
                    <pre className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-xs text-gray-300 overflow-x-auto mt-2">
                        <code>{selected.code}</code>
                    </pre>
                </details>

                <div className="panel">
                    <div className="md-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.review}</ReactMarkdown>
                    </div>
                </div>
            </div>
        )
    }

    // List view
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Your Reviews</h2>
                    {!loading && reviews.length > 0 && (
                        <p className="text-gray-600 text-xs mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    )}
                </div>
                <button onClick={onNewReview} className="btn-primary text-sm px-3 py-1.5">
                    New Review
                </button>
            </div>

            {loading && (
                <p className="text-gray-600 text-sm animate-pulse">Loading reviews...</p>
            )}

            {!loading && reviews.length === 0 && (
                <div className="panel text-center py-16">
                    <p className="text-gray-500 text-sm font-medium mb-1">No reviews yet</p>
                    <p className="text-gray-600 text-xs mb-6">Paste code or pull a file from GitHub to get started</p>
                    <button onClick={onNewReview} className="btn-primary">
                        Review your first file
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {reviews.map(review => (
                    <div
                        key={review.id}
                        onClick={() => setSelected(review)}
                        className="panel cursor-pointer hover:border-gray-600 transition-colors group"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
                                        {review.language}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        {review.source === 'github' ? 'GitHub' : 'Manual'}
                                    </span>
                                    {review.filename && (
                                        <span className="text-xs text-gray-500 font-mono truncate max-w-48">
                                            {review.filename}
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-600 ml-auto">
                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 truncate">
                                    {review.review.split('\n').find(l => l.trim())?.replace(/^#+\s*/, '') ?? 'View review'}
                                </p>
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={e => handleDelete(e, review.id)}
                                disabled={deleting === review.id}
                                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-sx px-2 py-1 rounded shrink-0 "
                            >
                                {deleting === review.id ? '...' : 'X'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}