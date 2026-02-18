import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProjects } from '@/lib/data/repository';

export default async function HomePage() {
  const projects = await getProjects();

  // If only one project, redirect directly to it
  if (projects.length === 1) {
    redirect(`/p/${projects[0].slug}`);
  }

  // Multiple projects: show a listing
  return (
    <div className="min-h-screen bg-[var(--bg-base)] relative grain">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-[0.2em] mb-3">
            Explorador Inmobiliario
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-light text-[var(--text-primary)] tracking-tight">
            Proyectos
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-sm">
            Selecciona un proyecto para explorar
          </p>
        </div>
      </header>

      {/* Projects grid */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid gap-4 md:grid-cols-2 stagger-children">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/p/${project.slug}`}
              className="group block bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-6 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-glow)] transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] font-medium border border-[var(--accent)]/15">
                  {project.type === 'subdivision' ? 'Loteo' : 'Edificio'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  project.status === 'available'
                    ? 'bg-[var(--status-available-bg)] text-[var(--status-available)] border border-[var(--status-available)]/15'
                    : 'bg-[var(--status-unavailable-bg)] text-[var(--status-unavailable)] border border-[var(--status-unavailable)]/15'
                }`}>
                  {project.status === 'available' ? 'Disponible' : project.status}
                </span>
              </div>

              <h2 className="font-display text-2xl font-light text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-300">
                {project.name}
              </h2>

              {project.description && (
                <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">{project.description}</p>
              )}

              {(project.city || project.state) && (
                <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {[project.city, project.state].filter(Boolean).join(', ')}
                </p>
              )}

              {/* Hover arrow */}
              <div className="mt-5 flex items-center gap-1.5 text-xs text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors duration-300">
                <span>Explorar</span>
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">No hay proyectos disponibles</p>
          </div>
        )}
      </main>
    </div>
  );
}
