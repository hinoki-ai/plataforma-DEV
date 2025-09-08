'use client';

import { useEffect, useState } from 'react';
import { format as dateFnsFormat } from 'date-fns';
import { es } from 'date-fns/locale';

interface HydratedDateProps {
  date: Date | string | number;
  format?: string;
  locale?: any;
  placeholder?: string;
  className?: string;
  relative?: boolean;
}

/**
 * Component for rendering dates that prevents hydration mismatches
 * Shows a placeholder during SSR and the formatted date after hydration
 */
export function HydratedDate({
  date,
  format = 'dd MMM yyyy',
  locale = es,
  placeholder = '...',
  className,
  relative = false,
}: HydratedDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>(placeholder);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' 
        ? new Date(date) 
        : date;

      if (relative) {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
        
        if (diffInSeconds < 60) {
          setFormattedDate('hace un momento');
        } else if (diffInSeconds < 3600) {
          setFormattedDate(`hace ${Math.floor(diffInSeconds / 60)} minutos`);
        } else if (diffInSeconds < 86400) {
          setFormattedDate(`hace ${Math.floor(diffInSeconds / 3600)} horas`);
        } else if (diffInSeconds < 604800) {
          setFormattedDate(`hace ${Math.floor(diffInSeconds / 86400)} días`);
        } else {
          setFormattedDate(dateFnsFormat(dateObj, format, { locale }));
        }
      } else {
        setFormattedDate(dateFnsFormat(dateObj, format, { locale }));
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      setFormattedDate('Invalid date');
    }
  }, [date, format, locale, relative]);

  return (
    <span 
      className={className}
      suppressHydrationWarning
    >
      {formattedDate}
    </span>
  );
}

interface HydratedTimeProps {
  date: Date | string | number;
  placeholder?: string;
  className?: string;
}

/**
 * Component for rendering times that prevents hydration mismatches
 */
export function HydratedTime({
  date,
  placeholder = '...',
  className,
}: HydratedTimeProps) {
  return (
    <HydratedDate
      date={date}
      format="HH:mm"
      placeholder={placeholder}
      className={className}
    />
  );
}

interface HydratedDateTimeProps {
  date: Date | string | number;
  placeholder?: string;
  className?: string;
}

/**
 * Component for rendering date and time that prevents hydration mismatches
 */
export function HydratedDateTime({
  date,
  placeholder = '...',
  className,
}: HydratedDateTimeProps) {
  return (
    <HydratedDate
      date={date}
      format="dd MMM yyyy HH:mm"
      placeholder={placeholder}
      className={className}
    />
  );
}

interface HydratedRelativeTimeProps {
  date: Date | string | number;
  placeholder?: string;
  className?: string;
}

/**
 * Component for rendering relative time that prevents hydration mismatches
 */
export function HydratedRelativeTime({
  date,
  placeholder = '...',
  className,
}: HydratedRelativeTimeProps) {
  return (
    <HydratedDate
      date={date}
      relative={true}
      placeholder={placeholder}
      className={className}
    />
  );
}