import Link from 'next/link'

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
            <div className="max-w-lg text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    DevOps Platform
                </div>
                <h1 className="text-5xl font-bold tracking-tight">DevSync</h1>
                <p className="mt-4 text-slate-400 text-lg">
                    Full-stack DevOps monitoring and automation platform, built on Vault,
                    Terraform, Nomad, and Consul.
                </p>
                <Link
                    href="/dashboard"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                    View Dashboard
                    <span aria-hidden>→</span>
                </Link>
            </div>
        </main>
    )
}
