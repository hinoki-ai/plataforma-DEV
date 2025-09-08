'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity, UserPlus, FileText, Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type:
    | 'user_created'
    | 'document_uploaded'
    | 'meeting_scheduled'
    | 'planning_updated'
    | 'team_member_added';
  title: string;
  description?: string;
  user?: string;
  timestamp: Date;
}

interface ActivityFeedWidgetProps {
  activities: ActivityItem[];
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'user_created':
      return <UserPlus className="w-4 h-4 text-green-600" />;
    case 'document_uploaded':
      return <FileText className="w-4 h-4 text-blue-600" />;
    case 'meeting_scheduled':
      return <Calendar className="w-4 h-4 text-purple-600" />;
    case 'planning_updated':
      return <FileText className="w-4 h-4 text-orange-600" />;
    case 'team_member_added':
      return <Users className="w-4 h-4 text-indigo-600" />;
    default:
      return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

const getUserInitials = (name?: string) => {
  if (!name) return 'S';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export function ActivityFeedWidget({ activities }: ActivityFeedWidgetProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay actividad reciente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getUserInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                          locale: es,
                        })}
                        {activity.user && ` por ${activity.user}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
