'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, List, Plus } from 'lucide-react';
import { ParentMeetingList } from './ParentMeetingList';
import { ParentMeetingCalendar } from './ParentMeetingCalendar';
import { ParentMeetingRequest } from './ParentMeetingRequest';

interface ParentMeetingTabsProps {
  userId: string;
}

export function ParentMeetingTabs({ userId }: ParentMeetingTabsProps) {
  const [activeTab, setActiveTab] = useState('list');

  const tabs = [
    {
      id: 'list',
      label: 'Mis Reuniones',
      icon: List,
      content: <ParentMeetingList userId={userId} />,
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: CalendarDays,
      content: <ParentMeetingCalendar userId={userId} />,
    },
    {
      id: 'request',
      label: 'Solicitar Reunión',
      icon: Plus,
      content: <ParentMeetingRequest userId={userId} />,
    },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2"
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
