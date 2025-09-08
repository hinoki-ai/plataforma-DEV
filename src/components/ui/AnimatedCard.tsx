'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface AnimatedCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  animationType?: 'slide-in' | 'scale-in' | 'fade-in' | 'bounce' | 'grid-entrance';
  animationDelay?: number;
  hoverAnimation?: boolean;
  className?: string;
}

export function AnimatedCard({
  children,
  title,
  description,
  animationType = 'slide-in',
  animationDelay = 0,
  hoverAnimation = true,
  className = '',
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) return '';

    switch (animationType) {
      case 'slide-in':
        return 'animate-slide-in';
      case 'scale-in':
        return 'animate-scale-in';
      case 'fade-in':
        return 'animate-fade-in';
      case 'bounce':
        return 'animate-bounce';
      case 'grid-entrance':
        return 'animate-grid-entrance';
      default:
        return 'animate-slide-in';
    }
  };

  const getHoverClass = () => {
    if (!hoverAnimation) return '';
    return 'hover:animate-card-hover transition-transform duration-300 hover:shadow-lg';
  };

  return (
    <Card
      ref={cardRef}
      className={`will-change-transform ${getAnimationClass()} ${getHoverClass()} ${className}`}
      style={{
        animationDelay: `${animationDelay}ms`,
        transition: hoverAnimation ? 'transform 0.3s ease-out, box-shadow 0.3s ease-out' : undefined,
      }}
    >
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// Specialized animated cards for common school use cases
export function StudentCard({ student, animationDelay = 0 }: { student: any; animationDelay?: number }) {
  return (
    <AnimatedCard
      animationType="grid-entrance"
      animationDelay={animationDelay}
      className="bg-gradient-to-br from-blue-50 to-indigo-50"
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
          {student.name?.charAt(0) || 'S'}
        </div>
        <div>
          <h3 className="font-semibold">{student.name || 'Student Name'}</h3>
          <p className="text-sm text-gray-600">{student.grade || 'Grade'}</p>
        </div>
      </div>
    </AnimatedCard>
  );
}

export function AchievementCard({ achievement, animationDelay = 0 }: { achievement: any; animationDelay?: number }) {
  return (
    <AnimatedCard
      animationType="scale-in"
      animationDelay={animationDelay}
      className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{achievement.icon || '🏆'}</div>
        <h3 className="font-semibold text-lg">{achievement.title || 'Achievement'}</h3>
        <p className="text-sm text-gray-600">{achievement.description || 'Description'}</p>
      </div>
    </AnimatedCard>
  );
}

export function NotificationCard({ notification, animationDelay = 0 }: { notification: any; animationDelay?: number }) {
  return (
    <AnimatedCard
      animationType="slide-in"
      animationDelay={animationDelay}
      className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm animate-bell-ring">
          🔔
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{notification.title || 'Notification'}</h4>
          <p className="text-sm text-gray-600">{notification.message || 'Message'}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.time || 'Just now'}</p>
        </div>
      </div>
    </AnimatedCard>
  );
}

export function CalendarEventCard({ event, animationDelay = 0 }: { event: any; animationDelay?: number }) {
  return (
    <AnimatedCard
      animationType="grid-entrance"
      animationDelay={animationDelay}
      className="bg-gradient-to-br from-purple-50 to-pink-50"
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{event.title || 'Event'}</h4>
          <p className="text-sm text-gray-600">{event.date || 'Date'}</p>
        </div>
        <div className="text-2xl">{event.icon || '📅'}</div>
      </div>
    </AnimatedCard>
  );
}