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
  TrendingUp,
  BarChart3,
  Globe,
  Database,
  AlertTriangle,
  CheckCircle,
  Users,
} from "lucide-react";

function CalificacionesMasterContent() {
  const globalGradesStats = {
    totalGrades: 89234,
    averageGrade: 6.8,
    institutions: 12,
    validationRate: 97.2,
  };

  const gradeDistribution = [
    { range: "9.0-10.0", percentage: 15.2, count: 13560, color: "bg-green-500" },
    { range: "8.0-8.9", percentage: 22.4, count: 19980, color: "bg-blue-500" },
    { range: "7.0-7.9", percentage: 28.6, count: 25500, color: "bg-yellow-500" },
    { range: "6.0-6.9", percentage: 20.1, count: 17920, color: "bg-orange-500" },
    { range: "5.0-5.9", percentage: 9.8, count: 8740, color: "bg-red-400" },
    { range: "0.0-4.9", percentage: 3.9, count: 3470, color: "bg-red-600" },
  ];

  const institutionPerformance = [
    {
      institution: "Colegio San José",
      averageGrade: 7.2,
      totalStudents: 450,
      trend: "+0.3",
      status: "excellent",
    },
    {
      institution: "Instituto Técnico",
      averageGrade: 6.9,
      totalStudents: 290,
      trend: "+0.1",
      status: "good",
    },
    {
      institution: "Liceo Nacional",
      averageGrade: 6.5,
      totalStudents: 380,
      trend: "-0.2",
      status: "needs_attention",
    },
  ];

  const validationAlerts = [
    {
      institution: "Liceo Nacional",
      issue: "Grade validation pending for Mathematics",
      severity: "medium",
      pendingValidations: 23,
    },
    {
      institution: "Escuela República",
      issue: "Grade discrepancy detected",
      severity: "high",
      pendingValidations: 5,
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Grades Master Control</h1>
            <p className="text-muted-foreground mt-2">
              Global grade management and analytics across all institutions
            </p>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Advanced Analytics
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
                    Total Grades
                  </p>
                  <p className="text-2xl font-bold">
                    {globalGradesStats.totalGrades.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Grade
                  </p>
                  <p className="text-2xl font-bold">
                    {globalGradesStats.averageGrade}/10
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
                    {globalGradesStats.institutions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Validation Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {globalGradesStats.validationRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Distribution of grades across all institutions and subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeDistribution.map((range, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{range.range}</span>
                    <span>{range.percentage}% ({range.count.toLocaleString()})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${range.color}`}
                      style={{ width: `${range.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Institution Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Performance</CardTitle>
            <CardDescription>
              Average grades and performance metrics by institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutionPerformance.map((institution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{institution.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {institution.totalStudents} students
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {institution.averageGrade}/10 average
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            institution.status === "excellent"
                              ? "secondary"
                              : institution.status === "good"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {institution.trend}
                        </Badge>
                        <Badge variant="outline">{institution.status.replace("_", " ")}</Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Validation Alerts */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Grade Validation Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationAlerts.map((alert, index) => (
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
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        alert.severity === "high"
                          ? "destructive"
                          : alert.severity === "medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline">
                      {alert.pendingValidations} pending
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

export default function CalificacionesMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <CalificacionesMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
