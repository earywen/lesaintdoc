import Link from "next/link";

export default function AccessDeniedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass-card p-8 max-w-md text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-red-400 mb-2">Accès Refusé</h1>
                <p className="text-muted-foreground mb-6">
                    Ce roster est réservé aux membres de la guilde
                    <span className="text-white font-semibold"> Jet Set Club</span>.
                </p>
                <p className="text-sm text-zinc-500 mb-6">
                    Si tu es membre de la guilde et que tu vois ce message,
                    contacte un officier pour être ajouté à la liste.
                </p>
                <Link
                    href="/api/auth/signout"
                    className="inline-block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                    Se déconnecter
                </Link>
            </div>
        </div>
    );
}
