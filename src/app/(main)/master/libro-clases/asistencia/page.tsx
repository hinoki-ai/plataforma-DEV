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
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Globe,
  Database,
  TrendingUp,
  Users,
} from "lucide-react";

function AsistenciaMasterContent() {
  const globalAttendanceStats = {
    totalRecords: 45230,
    averageAttendance: 94.2,
    institutions: 12,
    systemAccuracy: 98.5,
  };

  const attendanceByInstitution = [
    {
      institution: "Colegio San José",
      attendance: 96.8,
      totalStudents: 450,
      trend: "+0.5%",
    },
    {
      institution: "Liceo Nacional",
      attendance: 93.2,
      totalStudents: 380,
      trend: "+1.2%",
    },
    {
      institution: "Escuela República",
      attendance: 91.5,
      totalStudents: 320,
      trend: "-0.8%",
    },
    {
      institution: "Instituto Técnico",
      attendance: 95.7,
      totalStudents: 290,
      trend: "+2.1%",
    },
  ];

  const attendanceAlerts = [
    {
      institution: "Escuela República",
      issue: "Attendance drop in Grade 8B",
      severity: "medium",
      affectedStudents: 12,
    },
    {
      institution: "Colegio San José",
      issue: "Data sync issue resolved",
      severity: "low",
      affectedStudents: 0,
    },
  ];

  return (
    <PageTransition duration={700}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Attendance Master Control</h1>
            <p className="text-muted-foreground mt-2">
              Global attendance monitoring and analytics across all institutions
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
                    Total Records
                  </p>
                  <p className="text-2xl font-bold">
                    {globalAttendanceStats.totalRecords.toLocaleString()}
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
                    Average Attendance
                  </p>
                  <p className="text-2xl font-bold">
                    {globalAttendanceStats.averageAttendance}%
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
                    {globalAttendanceStats.institutions}
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
                    System Accuracy
                  </p>
                  <p className="text-2xl font-bold">
                    {globalAttendanceStats.systemAccuracy}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance by Institution */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Institution</CardTitle>
            <CardDescription>
              Real-time attendance monitoring across all educational institutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceByInstitution.map((institution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{institution.institution}</p>
                        <p className="text-sm text-muted-foreground">
                          {institution.totalStudents} students enrolled
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {institution.attendance}% attendance
                      </p>
                      <Badge
                        variant={
                          institution.attendance >= 95
                            ? "secondary"
                            : institution.attendance >= 90
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {institution.trend}
                      </Badge>
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

        {/* Critical Alerts */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Attendance Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendanceAlerts.map((alert, index) => (
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
                    {alert.affectedStudents > 0 && (
                      <Badge variant="outline">
                        {alert.affectedStudents} students
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">98.5%</div>
                <div className="text-sm text-green-700">Data Accuracy</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">94.2%</div>
                <div className="text-sm text-blue-700">Average Attendance</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">99.1%</div>
                <div className="text-sm text-purple-700">System Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

export default function AsistenciaMasterPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState />}>
        <AsistenciaMasterContent />
      </Suspense>
    </ErrorBoundary>
  );
}
