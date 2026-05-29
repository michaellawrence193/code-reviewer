/**
 * api/review.ts
 * Vercel serverless function — receives code from the frontend,
 * sends it to Claude with a structured review prompt,
 * and returns the review. The Anthropic API key never touches the browser.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

    const { code, language } = req.body

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' })
    }

    const prompt = `You are an expert code reviewer. Review the following ${language} code thoroughly.
\`\`\`${language}
${code}
\`\`\`

Provide a structured review with these sections:

## Overview
A 2-3 sentence summary of the code's purpose and overall quality.

## Bugs & Errors
List any bugs, logic errors, or incorrect behavior. If none, say so.

## Security Issues
List any security vulnerabilities or concerns. If none, say so.

## Performance
List any performance issues or inefficiencies. If none, say so.

## Style & Best Practices
List style issues, naming conventions, or best practice violations.

## Suggestions
Provide 2-3 specific, actionable improvements with example code where helpful.

## Score
Rate the code out of 10 and give one sentance explaining the score.

Be specific, contructive, and reference exact line numbers or variable names where possible.`

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 2048,
                messages: [{ role: 'user', content: prompt }],
            }),
        })

        const data = await response.json()
        return res.status(response.status).json(data)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
}
