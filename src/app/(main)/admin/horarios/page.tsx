'use client';

import { useSession } from 'next-auth/react';
import { PageTransition } from '@/components/ui/page-transition';
import { HorariosDashboardReal } from '@/components/horarios/HorariosDashboardReal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminHorariosPage() {
  const { data: session } = useSession();

  return (
    <PageTransition skeletonType="page" duration={700}>
      <div className="container mx-auto px-4 py-6">
        {/* Admin Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Horarios - Control Administrativo Total
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 gap-1">
                  <Shield className="w-3 h-3" />
                  ADMIN
                </Badge>
              </h1>
              <p className="text-muted-foreground">
                Gestión completa de todos los horarios institucionales • Control
                total de funcionamiento
              </p>
            </div>
          </div>
        </div>

        {/* Admin Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                Real-time
              </div>
              <div className="text-xs text-muted-foreground">Datos en Vivo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                Database
              </div>
              <div className="text-xs text-muted-foreground">SQLite</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                API REST
              </div>
              <div className="text-xs text-muted-foreground">
                Endpoints Activos
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                <Calendar className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-xs text-muted-foreground">Horarios Real</div>
            </CardContent>
          </Card>
        </div>

        {/* Real Data Dashboard */}
        <HorariosDashboardReal />
      </div>
    </PageTransition>
  );
}
