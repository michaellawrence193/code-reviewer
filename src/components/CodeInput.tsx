/**
 * CodeInput.tsx
 * Step 1 of the review flow.
 * Lets users either paste code manually with a language selector,
 * or switch to the GitHub tab to pick a file from their repos.
 * Calls onSubmit with the code and language to trigger the review.
 */

import { useState } from 'react'

const LANGUAGES = [
    'TypeScript', 'JavaScript', 'Python', 'Rust',
    'Go', 'Java', 'C#', 'C++', 'Ruby', 'PHP',
    'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'Other'
]

type Props = {
    onSubmit: (code: string, language: string, filename?: string) => void
    loading: boolean
}

export function CodeInput({ onSubmit, loading }: Props) {
    const [tab, setTab] = useState<'manual' | 'github'>('manual')
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('Typescript')
    const [repoUrl, setRepoUrl] = useState('')
    const [filePath, setFilePath] = useState('')
    const [fetching, setFetching] = useState(false)
    const [fetchError, setFetchError] = useState('')

    const handleManualSubmit = () => {
        if (code.trim()) onSubmit(code, language)
    }

    // Parses the GitHub URL to extract owner and repo name,
    // then calls the GitHub Contents API to fetch the raw file.
    // GitHub returns file content base64-encoded, so program decodes it with atob().
    // Program also guesses the language from the file expension to pre-fill the selector.
    const handleGitHubFetch = async () => {
        setFetching(true)
        setFetchError('')
        try {
            // Parse owner/repo from URL or plain text
            const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
            if (!match) throw new Error('Invalid GitHub repo URL')
            const [, owner, repo] = match
            const cleanPath = filePath.replace(/^\//, '')

            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`
            )
            if (!response.ok) throw new Error('File not found - check the repo URL and file path')
            
            const data = await response.json()
            // GitHub returns file content as base64
            const decoded = atob(data.content.replace(/\n/g, ''))

            // Guess language from file extension
            const ext = cleanPath.split('.').pop()?.toLowerCase()
            const extMap: Record<string, string> = {
                ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
                py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', cs: 'C#',
                cpp: 'C++', rb: 'Ruby', php: 'PHP', swift: 'Swift', kt: 'Kotlin',
                sql: 'SQL', html: 'HTML', css: 'CSS',
            }
            if (ext && extMap[ext]) setLanguage(extMap[ext])

            onSubmit(decoded, extMap[ext as string] || language, cleanPath)
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : 'Failed to fetch file')
        } finally {
            setFetching(false)
        }
    }

    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-1">New Review</h2>
            <p className="text-gray-400 text-sm mb-6">Paste your code or pull a file from GitHub</p>

            {/* Tab switcher */}
            <div className="flex gap-2 mb-6">
                {(['manual', 'github'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
                            tab === t
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                    >
                        {t === 'manual' ? 'Paste code' : 'From GitHub'}
                    </button>
                ))}
            </div>

            {tab === 'manual' && (
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="label">Language</label>
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="input"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}    
                        </select>
                    </div>
                    <div>
                        <label className="label">Code</label>
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="Paste your code here..."
                            rows={16}
                            className="input resize-none font-memo text-xs"
                        />
                    </div>
                    <button
                        onClick={handleManualSubmit}
                        disabled={!code.trim() || loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Reviewing...' : 'Review my code'}
                    </button>
                </div>
            )}

            {tab === 'github' && (
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="label">GitHub repo URL</label>
                        <input
                            type="text"
                            value={repoUrl}
                            onChange={e => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/username/repo"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">File path</label>
                        <input
                            type="text"
                            value={filePath}
                            onChange={e => setFilePath(e.target.value)}
                            placeholder="src/components/App.tsx"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="label">Language</label>
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="input"
                        >
                            {LANGUAGES.map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                    </div>
                    {fetchError && <p className="text-red-400 text-xs">{fetchError}</p>}
                    <button
                        onClick={handleGitHubFetch}
                        disabled={!repoUrl.trim() || !filePath.trim() || fetching || loading}
                        className="btn-primary w-full"
                    >
                        {fetching ? 'Fetching...' : loading ? 'Reviewing...' : 'Fetch & review'}
                    </button>
                </div>
            )}
        </div>
    )
}