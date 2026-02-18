import { signOut } from '@/lib/actions/auth';
import { getAuthUser } from '@/lib/supabase/auth';

export const metadata = { title: 'Admin - Explorador Inmobiliario' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Admin</span>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-[var(--text-muted)]">{user.email}</span>}
          <form action={signOut}>
            <button className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200">
              Cerrar sesion
            </button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
