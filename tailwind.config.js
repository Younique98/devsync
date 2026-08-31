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
                'accent-strong': '#3987e5',
                good: '#0ca30c',
                warning: '#9085e9',
                critical: '#d03b3b',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
