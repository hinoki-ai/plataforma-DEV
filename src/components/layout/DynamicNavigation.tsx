"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";

// Static navigation structure that renders immediately
export function NavigationShell() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/admin", roles: ["ADMIN"] },
    { name: "Usuarios", href: "/admin/usuarios", roles: ["ADMIN"] },
    { name: "Calendario", href: "/admin/calendario-escolar", roles: ["ADMIN"] },
    { name: "Dashboard", href: "/profesor", roles: ["PROFESOR"] },
    { name: "Planificaciones", href: "/profesor/planificaciones", roles: ["PROFESOR"] },
    { name: "Calendario", href: "/profesor/calendario-escolar", roles: ["PROFESOR"] },
    { name: "Dashboard", href: "/parent", roles: ["PARENT"] },
    { name: "Calendario", href: "/parent/calendario-escolar", roles: ["PARENT"] },
    { name: "Comunicación", href: "/parent/comunicacion", roles: ["PARENT"] },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Plataforma
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? "border-primary text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Static user menu placeholder */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Dynamic user menu that loads after authentication check
export function DynamicUserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/auth/login">Iniciar Sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{session.user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Configuración</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Main PPR-optimized navigation component
export function DynamicNavigation() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Plataforma
              </Link>
            </div>

            {/* Navigation links - static */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Navigation items would go here - simplified for demo */}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* Dynamic user menu loads after */}
            <Suspense fallback={
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            }>
              <DynamicUserMenu />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}
