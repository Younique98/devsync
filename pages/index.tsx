import Link from 'next/link'

export default function Home() {
    return (
        <main className="max-w-2xl mx-auto mt-24 px-4 font-sans">
            <h1 className="text-4xl font-bold text-slate-900">DevSync</h1>
            <p className="mt-2 text-slate-600">
                Full-stack DevOps monitoring and automation platform.
            </p>
            <Link
                href="/dashboard"
                className="mt-6 inline-block text-blue-600 hover:text-blue-800 hover:underline"
            >
                View the monitoring dashboard →
            </Link>
        </main>
    )
}
