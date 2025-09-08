'use client';

import { useSession } from 'next-auth/react';
import { PageTransition } from '@/components/ui/page-transition';
import { HorariosDashboardReal } from '@/components/horarios/HorariosDashboardReal';

export const dynamic = 'force-dynamic';

export default function ProfesorHorariosPage() {
  const { data: session } = useSession();

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="space-y-6">
        <HorariosDashboardReal />
      </div>
    </PageTransition>
  );
}
