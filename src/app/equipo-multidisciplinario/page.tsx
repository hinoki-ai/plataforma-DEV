import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { resolveRoute } from '@/lib/route-resolver';

export default async function EquipoMultidisciplinarioPage() {
  const session = await auth();

  // Use intelligent route resolution
  const resolution = resolveRoute('/equipo-multidisciplinario', session);

  if (resolution.shouldRedirect) {
    redirect(resolution.redirectPath);
  }

  // Fallback to public view if no redirection needed
  redirect('/public/equipo-multidisciplinario');
}
