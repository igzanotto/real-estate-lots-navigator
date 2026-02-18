import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-base)]">
      <div className="text-center animate-fade-up">
        <p className="font-display text-8xl font-light text-[var(--accent)] mb-4 tracking-tight">404</p>
        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-2">
          Pagina no encontrada
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Lo sentimos, la pagina que estas buscando no existe.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--text-inverse)] rounded-[var(--radius-md)] hover:bg-[var(--accent-light)] transition-colors duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
