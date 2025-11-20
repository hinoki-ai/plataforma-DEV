/**
 * PROTOCOLOS CONVIVENCIA MASTER PAGE - ENGLISH ONLY
 *
 * CRITICAL RULE: This component MUST remain English-only and hardcoded.
 * No translations, i18n hooks, or internationalization allowed.
 *
 * This is a strict requirement that cannot be broken for:
 * - Master dashboard consistency
 * - Technical admin interface standards
 * - Performance optimization
 * - Avoiding translation overhead for system administrators
 *
 * If you need to add text, hardcode it in English only.
 * DO NOT add useDivineParsing, useLanguage, or any translation hooks.
 */

"use client";

import { Suspense } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Shield,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Globe,
  Database,
} from "lucide-react";
import Link from "next/link";

function ProtocolosComportamientoMasterContent() {
  const systemOverview = {
    totalNormas: 145,
    activeCases: 23,
    totalRecognitions: 892,
    systemHealth: 98.5,
    institutions: 12,
    totalStudents: 3450,
  };

  const globalStats = [
    {
      label: "Resolved Cases (Month)",
      value: "156",
      change: "+12%",
      trend: "up",
    },
    { label: "Success Rate", value: "94.2%", change: "+2.1%", trend: "up" },
    {
      label: "Average Resolution Time",
      value: "3.2 days",
      change: "-0.5 days",
      trend: "up",
    },
    {
      label: "Institutional Satisfaction",
      value: "96%",
      change: "+1.5%",
      trend: "up",
    },
  ];

  const subcategories = [
    {
      title: "Norms",
      description: "Global management of behavior norms",
      href: "/master/protocolos-convivencia/normas",
      icon: Users,
      color: "bg-blue-500",
      stats: `${systemOverview.totalNormas} active norms`,
      priority: "High",
    },
    {
      title: "Discipline",
      description: "Supervision of disciplinary cases across all institutions",
      href: "/master/protocolos-convivencia/disciplina",
      icon: Shield,
      color: "bg-red-500",
      stats: `${systemOverview.activeCases} active cases`,
      priority: "Critical",
    },
    {
      title: "Measures",
      description: "Global administration of corrective measures",
      href: "/master/protocolos-convivencia/medidas",
      icon: AlertTriangle,
      color: "bg-orange-500",
      stats: "Analytics Available",
      priority: "High",
    },
    {
      title: "Recognitions",
      description: "Global system of recognitions and awards",
      href: "/master/protocolos-convivencia/reconocimientos",
      icon: Award,
      color: "bg-green-500",
      stats: `${systemOverview.totalRecognitions} recognitions`,
      priority: "Medium",
    },
    {
      title: "Parent Meetings",
      description: "Global supervision of parent meetings",
      href: "/master/protocolos-convivencia/actas-apoderados",
      icon: FileText,
      color: "bg-purple-500",
      stats: "Global meetings",
      priority: "Medium",
    },
    {
      title: "Student Meetings",
      description: "Global supervision of student meetings",
      href: "/master/protocolos-convivencia/actas-alumnos",
      icon: FileText,
      color: "bg-indigo-500",
      stats: "Global meetings",
      priority: "Medium",
    },
  ];

  const criticalAlerts = [
    {
      institution: "San José School",
      issue: "Increase in disciplinary cases",
      severity: "high",
    },
    {
      institution: "National High School",
      issue: "Recognition system inactive",
      severity: "medium",
    },
    {
      institution: "Republic School",
      issue: "Outdated norms",
      severity: "low",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Behavior Protocols - Master Control
            </h1>
            <p className="text-muted-foreground mt-2">
              Global supervision of the behavior system across all institutions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="w-4 h-4 mr-2" />
              Global System
            </Badge>
            <Button>
              <Settings className="w-4 h-4 mr-2" />
              Global Configuration
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Institutions
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.institutions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Students
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.totalStudents.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Cases
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.activeCases}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    System Health
                  </p>
                  <p className="text-2xl font-bold">
                    {systemOverview.systemHealth}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>System Global Metrics</CardTitle>
            <CardDescription>
              Overall performance of the behavior protocols system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {globalStats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              System Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{alert.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.issue}
                    </p>
                  </div>
                  <Badge
                    variant={
                      alert.severity === "high"
                        ? "destructive"
                        : alert.severity === "medium"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {alert.severity === "high"
                      ? "High"
                      : alert.severity === "medium"
                        ? "Medium"
                        : "Low"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subcategories.map((category, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${category.color}`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Prioridad: {category.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {category.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {category.stats}
                  </Badge>
                  <Button asChild size="sm">
                    <Link href={category.href}>
                      <FileText className="w-4 h-4 mr-2" />
                      Master Control
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Master Controls */}
        <Card>
          <CardHeader>
            <CardTitle>System Master Controls</CardTitle>
            <CardDescription>
              Advanced tools for global management of the behavior system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-16 flex-col">
                <Database className="w-5 h-5 mb-1" />
                <span className="text-sm">Backup Global</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <BarChart3 className="w-5 h-5 mb-1" />
                <span className="text-sm">Advanced Analytics</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-sm">Global Configuration</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col">
                <Globe className="w-5 h-5 mb-1" />
                <span className="text-sm">Sincronización</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ProtocolosComportamientoMasterPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error loading the master behavior protocols panel</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <ProtocolosComportamientoMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
