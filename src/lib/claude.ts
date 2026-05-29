/**
 * claude.ts
 * Sends code to Claude for review via the /api/review serverless function.
 * Returns a structured review with bugs, security issues,
 * performance notes, and style suggestions.
 */

export type ReviewRequest = {
    code: string
    laguage: string
}

export async function reviewCode(
    code: string,
    language: string,
    onChunk: (text: string) => void
): Promise<void> {
    // Sends the code to the vercel serverless function which forwards it
    // to Anthropic. Program never calls Anthropic directly from the browers -
    // the API key lives in Vercel's environment variables only.
    const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
    })

    if (!response.ok) throw new Error('Review request failed')

    const data = await response.json()
    onChunk(data.content[0].text)
}