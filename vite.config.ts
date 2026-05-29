import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local dev only
const apiKey = ''

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    {
      name: 'api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/review', async (req, res) => {
          const chunks: Buffer[] = []
          req.on('data', (chunk: Buffer) => chunks.push(chunk))
          req.on('end', async () => {
            const { code, language } = JSON.parse(Buffer.concat(chunks).toString())

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
              res.statusCode = response.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(data))
            } catch (error) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Proxy error' }))
            }
          })
        })
      },
    },
  ],
})
