"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List, BarChart3, Plus } from "lucide-react";
import { MeetingCalendar } from "./MeetingCalendar";
import { MeetingList } from "./MeetingList";
import { MeetingStats } from "./MeetingStats";
import { ParentRequestsList } from "./ParentRequestsList";
import { MeetingForm } from "./MeetingForm";

interface MeetingTabsProps {
  isAdmin?: boolean;
}

export function MeetingTabs({ isAdmin = false }: MeetingTabsProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const teacherTabs = [
    {
      id: "list",
      label: "Mis Reuniones",
      icon: List,
      content: <MeetingList isAdmin={false} />,
    },
    {
      id: "calendar",
      label: "Calendario",
      icon: CalendarDays,
      content: <MeetingCalendar isAdmin={false} />,
    },
  ];

  const adminTabs = [
    {
      id: "list",
      label: "Todas las Reuniones",
      icon: List,
      content: (
        <MeetingList
          isAdmin={true}
          onCreateMeeting={() => setIsCreateDialogOpen(true)}
        />
      ),
    },
    {
      id: "requests",
      label: "Solicitudes de Padres",
      icon: Plus,
      content: <ParentRequestsList />,
    },
    {
      id: "calendar",
      label: "Calendario",
      icon: CalendarDays,
      content: <MeetingCalendar isAdmin={true} />,
    },
    {
      id: "stats",
      label: "Estadísticas",
      icon: BarChart3,
      content: <MeetingStats />,
    },
  ];

  const tabs = isAdmin ? adminTabs : teacherTabs;

  // Check for create query parameter and open dialog
  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true" && isAdmin) {
      setIsCreateDialogOpen(true);
      // Clean up the URL by removing the query parameter
      router.replace("/admin/reuniones", { scroll: false });
    }
  }, [searchParams, isAdmin, router]);

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    // Refresh the current tab data
    setActiveTab(activeTab);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {tabs.map((tab) => (
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

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>

      {/* Meeting Form Dialog for Admins */}
      {isAdmin && (
        <MeetingForm
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={handleCreateSuccess}
          mode="create"
        />
      )}
    </>
  );
}
