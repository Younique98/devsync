/** @type {import('next').NextConfig} */
const nextConfig = {
    // Don't regenerate AGENTS.md/CLAUDE.md at the repo root on every
    // `next dev` - this repo's own README is the source of truth.
    agentRules: false,
    async headers() {
        return [
            {
                // Baseline security headers on every Next.js response (the
                // Express API sets its own equivalents in server.ts).
                source: '/:path*',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'no-referrer' },
                ],
            },
        ]
    },
}

module.exports = nextConfig
