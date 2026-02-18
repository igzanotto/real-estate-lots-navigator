'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-base)]">
      <div className="text-center max-w-md animate-fade-up">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--status-sold-bg)] flex items-center justify-center">
          <svg className="w-7 h-7 text-[var(--status-sold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-light text-[var(--text-primary)] mb-3">
          Algo salio mal
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          Ocurrio un error inesperado. Por favor, intenta nuevamente.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[var(--accent)] text-[var(--text-inverse)] rounded-[var(--radius-md)] hover:bg-[var(--accent-light)] transition-colors duration-200 text-sm font-medium"
          >
            Intentar nuevamente
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-[var(--radius-md)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-200 text-sm font-medium border border-[var(--border-subtle)]"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
