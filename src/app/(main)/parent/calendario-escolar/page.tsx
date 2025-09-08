import { Metadata } from 'next';
import UnifiedCalendarView from '@/components/calendar/UnifiedCalendarView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { PageTransition } from '@/components/ui/page-transition';
import { requireAuth } from '@/lib/server-auth';
import { getRoleAccess } from '@/lib/role-utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Calendario Escolar | Manitos Pintadas',
  description:
    'Calendario escolar oficial para Escuela Especial de Lenguaje Manitos Pintadas. Fechas importantes, eventos académicos y actividades preescolares.',
  keywords:
    'calendario escolar, educación preescolar, Chile, NT1, NT2, Manitos Pintadas',
  openGraph: {
    title: 'Calendario Escolar | Manitos Pintadas',
    description:
      'Descubre las fechas importantes del año escolar para nuestra escuela especial de lenguaje.',
    type: 'website',
  },
};

export default async function CalendarioEscolarPage() {
  const session = await requireAuth();
  const roleAccess = getRoleAccess(session.user.role);

  // Ensure user has access to parent dashboard
  if (
    !roleAccess.canAccessParent &&
    session.user.role !== 'PROFESOR' &&
    session.user.role !== 'ADMIN'
  ) {
    redirect('/unauthorized');
  }

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div
        className="min-h-screen bg-home-page"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        <div className="relative z-20">

          {/* Calendar Section */}
          <section className="py-2">
            <div className="container mx-auto px-4 py-8">
              <UnifiedCalendarView
                mode="full"
                showAdminControls={false}
                showExport={true}
                initialCategories={[
                  'ACADEMIC',
                  'HOLIDAY',
                  'SPECIAL',
                  'PARENT',
                  'MEETING',
                ]}
                userRole="PARENT"
              />
            </div>
          </section>

          {/* Info Section */}
          <section className="py-4 sm:py-6 lg:py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Año Escolar 2025
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      Inicio: 3 de Marzo
                      <br />
                      Vacaciones de Invierno: 23 Jun - 4 Jul
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Niveles Atendidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      NT1 (Pre-Kinder): 4 años
                      <br />
                      NT2 (Kinder): 5 años
                    </p>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/50 rounded-2xl shadow-2xl text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Horarios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">
                      Mañana: 8:30 - 12:00
                      <br />
                      Tarde: 13:30 - 17:00
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
