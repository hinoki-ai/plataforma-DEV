'use client';

import React from 'react';
import { Sidebar, SidebarTrigger } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
}

export function MobileSidebar({
  isSidebarCollapsed,
  onToggleSidebar,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: MobileSidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Trigger - Always visible on mobile */}
      <div className="md:hidden">
        <SidebarTrigger onToggle={onToggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay - Only when sidebar is open */}
      {!isSidebarCollapsed && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={onToggleSidebar}
          onTouchEnd={e => {
            e.preventDefault();
            onToggleSidebar();
          }}
          aria-hidden="true"
          role="presentation"
        />
      )}

      {/* Mobile Sidebar - Only when sidebar is open */}
      {!isSidebarCollapsed && (
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 md:hidden transition-all duration-300 ease-out',
            'translate-x-0 shadow-xl'
          )}
          onTouchStart={e => {
            e.stopPropagation();
            onTouchStart?.(e);
          }}
          onTouchMove={e => {
            e.stopPropagation();
            onTouchMove?.(e);
          }}
          onTouchEnd={onTouchEnd}
        >
          <Sidebar
            isCollapsed={false}
            onToggle={onToggleSidebar}
            className="h-full border-r-2 shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
