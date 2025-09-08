'use client';

import { MasterPageTemplate } from '@/components/master/MasterPageTemplate';
import { SystemHealthCard } from '@/components/master/SystemHealthCard';

// Force dynamic rendering for Vercel compatibility
export const dynamic = 'force-dynamic';

export default function SystemHealthPage() {
  return (
    <MasterPageTemplate
      title="🏥 System Health Monitor"
      subtitle="Real-time monitoring of all system components"
      context="🏥 System Health Monitor"
      errorContext="SystemHealthPage"
    >
      <SystemHealthCard />
    </MasterPageTemplate>
  );
}