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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Explorador Inmobiliario</h1>
          <p className="text-gray-600 mt-2">Selecciona un proyecto para explorar</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/p/${project.slug}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                  {project.type === 'subdivision' ? 'Loteo' : 'Edificio'}
                </span>
                <span className={`text-sm px-2 py-1 rounded font-medium ${
                  project.status === 'available'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {project.status === 'available' ? 'Disponible' : project.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
              {project.description && (
                <p className="text-gray-600 mt-2 text-sm">{project.description}</p>
              )}
              {(project.city || project.state) && (
                <p className="text-gray-500 mt-2 text-sm">
                  {[project.city, project.state].filter(Boolean).join(', ')}
                </p>
              )}
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No hay proyectos disponibles
          </div>
        )}
      </main>
    </div>
  );
}
