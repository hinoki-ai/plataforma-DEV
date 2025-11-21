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
  Users,
  TrendingUp,
  BarChart3,
  Globe,
  Database,
  AlertTriangle,
} from "lucide-react";

function EstudiantesMasterContent() {
  const globalStudentsStats = {
    totalStudents: 3450,
    activeStudents: 3380,
    averagePerformance: 6.8,
    institutions: 12,
    graduationRate: 94.2,
    atRiskStudents: 156,
  };

  const institutionStudentMetrics = [
    {
      institution: "Colegio San José",
      totalStudents: 450,
      averageGrade: 7.2,
      attendanceRate: 96.8,
      atRiskCount: 12,
      trend: "+2.1%",
    },
    {
      institution: "Instituto Técnico",
      totalStudents: 290,
      averageGrade: 6.9,
      attendanceRate: 95.7,
      atRiskCount: 8,
      trend: "+1.8%",
    },
    {
      institution: "Liceo Nacional",
      totalStudents: 1450,
      averageGrade: 6.5,
      attendanceRate: 93.2,
      atRiskCount: 18,
      trend: "-0.5%",
    },
    {
      institution: "Escuela República",
      totalStudents: 780,
      averageGrade: 6.3,
      attendanceRate: 91.5,
      atRiskCount: 25,
      trend: "-1.2%",
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Students Master Control</h1>
            <p className="text-muted-foreground mt-2">
              Student performance analytics and monitoring across institutions
            </p>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />
            Student Analytics
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-lg font-bold">
                    {globalStudentsStats.totalStudents.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-green-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Active Students
                  </p>
                  <p className="text-lg font-bold">
                    {globalStudentsStats.activeStudents.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Avg Performance
                  </p>
                  <p className="text-lg font-bold">
                    {globalStudentsStats.averagePerformance}/10
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Graduation Rate
                  </p>
                  <p className="text-lg font-bold">
                    {globalStudentsStats.graduationRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-indigo-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Institutions
                  </p>
                  <p className="text-lg font-bold">
                    {globalStudentsStats.institutions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    At-Risk Students
                  </p>
                  <p className="text-lg font-bold">
                    {globalStudentsStats.atRiskStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institution Student Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Student Metrics</CardTitle>
            <CardDescription>
              Student performance and attendance by institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutionStudentMetrics.map((institution, index) => (
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
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm font-medium">
                          {institution.averageGrade}/10
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Grade</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {institution.attendanceRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">Attendance</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-600">
                          {institution.atRiskCount}
                        </p>
                        <p className="text-xs text-muted-foreground">At Risk</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="outline">{institution.trend}</Badge>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
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

export default function EstudiantesMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <EstudiantesMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}