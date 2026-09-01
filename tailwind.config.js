/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#090e1a',
                surface: '#121826',
                'surface-hover': '#171f31',
                border: '#282f3e',
                ink: '#ecf0f4',
                'ink-muted': '#97a3b4',
                accent: '#22d3ee',
                // Nudged from #3987e5 - the original only hit 3.64:1 for
                // white button text against WCAG AA's 4.5:1 minimum for
                // normal-size text (computed via WCAG relative-luminance
                // contrast, not eyeballed). #3174c5 verified at 4.74:1;
                // still >=3:1 as a decorative chart line/dot against surface.
                'accent-strong': '#3174c5',
                good: '#0ca30c',
                warning: '#9085e9',
                // Nudged from #d03b3b - the original only hit 3.69:1 as
                // text against bg-surface (needs 4.5:1) and 3.43:1 inside
                // its own bg-critical/10 status pill. #db6a6a verified at
                // 5.30:1 / 4.73:1 respectively.
                critical: '#db6a6a',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
