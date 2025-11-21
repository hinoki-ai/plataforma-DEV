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
  AlertTriangle,
  BarChart3,
  Globe,
  Database,
  MessageSquare,
  Users,
} from "lucide-react";

function ObservacionesMasterContent() {
  const globalObservationsStats = {
    totalObservations: 15680,
    positiveFeedback: 12450,
    institutions: 12,
    responseRate: 96.7,
  };

  const institutionOverview = [
    {
      institution: "Colegio San José",
      observations: 1456,
      positiveRate: 89.2,
      status: "optimal",
    },
    {
      institution: "Instituto Técnico",
      observations: 1234,
      positiveRate: 87.5,
      status: "good",
    },
    {
      institution: "Liceo Nacional",
      observations: 987,
      positiveRate: 82.1,
      status: "needs_attention",
    },
  ];

  const criticalObservations = [
    {
      institution: "Liceo Nacional",
      student: "Student #4582",
      issue: "Consistent behavioral issues requiring intervention",
      severity: "high",
    },
    {
      institution: "Escuela República",
      student: "Student #3291",
      issue: "Academic performance decline",
      severity: "medium",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Observations Master Control</h1>
            <p className="text-muted-foreground mt-2">
              Global observation and feedback system management across all institutions
            </p>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Global Analytics
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Observations
                  </p>
                  <p className="text-2xl font-bold">
                    {globalObservationsStats.totalObservations.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Positive Feedback
                  </p>
                  <p className="text-2xl font-bold">
                    {globalObservationsStats.positiveFeedback.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Institutions
                  </p>
                  <p className="text-2xl font-bold">
                    {globalObservationsStats.institutions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Response Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {globalObservationsStats.responseRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institution Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Overview</CardTitle>
            <CardDescription>
              Observation metrics by institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutionOverview.map((institution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{institution.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {institution.observations} observations
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">
                        {institution.positiveRate}% positive
                      </p>
                    </div>
                    <Badge
                      variant={
                        institution.status === "optimal"
                          ? "secondary"
                          : institution.status === "good"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {institution.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Observations */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Critical Observations Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalObservations.map((observation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{observation.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {observation.student}: {observation.issue}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        observation.severity === "high"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {observation.severity}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function ObservacionesMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <ObservacionesMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}