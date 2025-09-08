'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import UnifiedCalendarView from '@/components/calendar/UnifiedCalendarView';
import { useLanguage } from '@/components/language/LanguageContext';

// Removed static revalidation to prevent authentication state conflicts

export default function ProfesorDashboard() {
  const { t } = useLanguage();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Advanced Calendar View - MAIN FIRST PANEL */}
      <div className="mb-12">
        <Card className="w-full">
          <CardContent className="p-0">
            <div className="w-full">
              <UnifiedCalendarView
                mode="full"
                showExport={true}
                showSearch={true}
                userRole="PROFESOR"
                height="700px"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('profesor.dashboard.planning.title', 'common')}</CardTitle>
            <CardDescription>
              {t('profesor.dashboard.planning.description', 'common')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/profesor/planificaciones"
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              {t('profesor.dashboard.view.more', 'common')}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('profesor.dashboard.resources.title', 'common')}</CardTitle>
            <CardDescription>
              {t('profesor.dashboard.resources.description', 'common')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/profesor/recursos"
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              {t('profesor.dashboard.view.more', 'common')}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('profesor.dashboard.activities.title', 'common')}</CardTitle>
            <CardDescription>
              {t('profesor.dashboard.activities.description', 'common')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/profesor/actividades"
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              {t('profesor.dashboard.view.more', 'common')}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
