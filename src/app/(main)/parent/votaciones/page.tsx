"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { getRoleAccess } from "@/lib/role-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Vote,
  Clock,
  CheckCircle,
  Users,
  BarChart3,
  Calendar,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";
import { useDivineParsing } from "@/components/language/useDivineLanguage";
import { LoadingState } from "@/components/ui/loading-states";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { toast } from "sonner";

interface VoteOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

interface VotingSession {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  status: "active" | "closed";
  isPublic: boolean;
  allowMultipleVotes: boolean;
  totalVotes: number;
  totalOptions: number;
  hasVoted: boolean;
  userVotes?: string[]; // Option IDs that user voted for
  options: VoteOption[];
  creator: {
    name: string;
  };
}

function VotacionesContent() {
  const { data: session, status } = useSession();
  const { t } = useDivineParsing(["common", "parent"]);
  const [votingSessions, setVotingSessions] = useState<VotingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<VotingSession | null>(
    null,
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "PARENT") {
      fetchVotingSessions();
    }
  }, [session]);

  const fetchVotingSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/parent/votes");
      if (!response.ok) {
        throw new Error("Failed to fetch voting sessions");
      }

      const result = await response.json();
      const votes: any[] = result.data || [];

      // Transform API data to match VotingSession interface
      const sessions: VotingSession[] = votes.map((vote) => {
        // Calculate percentages for options
        const optionsWithPercentages = vote.options.map((opt: any) => {
          const percentage =
            vote.totalVotes > 0
              ? Math.round((opt.votes / vote.totalVotes) * 100)
              : 0;
          return {
            ...opt,
            percentage: percentage,
          };
        });

        return {
          id: vote.id,
          title: vote.title,
          description: vote.description || "",
          category: vote.category || "GENERAL",
          endDate: vote.endDate,
          status: vote.status,
          isPublic: vote.isPublic,
          allowMultipleVotes: vote.allowMultipleVotes || false,
          totalVotes: vote.totalVotes || 0,
          totalOptions: vote.options?.length || 0,
          hasVoted: vote.hasVoted || false,
          userVotes: vote.userVote ? [vote.userVote] : [],
          options: optionsWithPercentages,
          creator: {
            name: "Administración Escolar",
          },
        };
      });

      setVotingSessions(sessions);
      if (sessions.length > 0) {
        setSelectedSession(sessions[0]);
      }
    } catch (err) {
      console.error("Error fetching voting sessions:", err);
      setError("Error al cargar las votaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedSession || selectedOptions.length === 0) {
      toast.error("Por favor selecciona al menos una opción");
      return;
    }

    // If multiple votes allowed and multiple selected, cast all votes
    // Otherwise, cast single vote for the first selected option
    const optionToVoteFor = selectedOptions[0];

    setSubmitting(true);
    try {
      const response = await fetch("/api/parent/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voteId: selectedSession.id,
          optionId: optionToVoteFor,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al registrar el voto");
      }

      toast.success("¡Voto registrado exitosamente!");

      // Refresh voting sessions to get updated data
      await fetchVotingSessions();
      setSelectedOptions([]);
    } catch (err: any) {
      console.error("Error submitting vote:", err);
      toast.error(err.message || "Error al registrar el voto");
    } finally {
      setSubmitting(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Finalizada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} días`;
    if (hours > 0) return `${hours} horas`;
    return "Menos de 1 hora";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "FINANCIAL":
        return "bg-green-100 text-green-800";
      case "ACADEMIC":
        return "bg-blue-100 text-blue-800";
      case "GENERAL":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      GENERAL: t("admin.votaciones.category.general", "common"),
      ACADEMIC: t("admin.votaciones.category.academic", "common"),
      ADMINISTRATIVE: t("admin.votaciones.category.administrative", "common"),
      SOCIAL: t("admin.votaciones.category.social", "common"),
      FINANCIAL: t("admin.votaciones.category.financial", "common"),
      INFRASTRUCTURE: t("admin.votaciones.category.infrastructure", "common"),
      CURRICULUM: t("admin.votaciones.category.curriculum", "common"),
      EVENTS: t("admin.votaciones.category.events", "common"),
      POLICIES: t("admin.votaciones.category.policies", "common"),
      OTHER: t("admin.votaciones.category.other", "common"),
    };
    return labels[category] || t("admin.votaciones.category.other", "common");
  };

  // Handle loading state
  if (status === "loading") {
    return <LoadingState />;
  }

  // Ensure user has access to parent section
  if (!session || !session.user) {
    redirect("/login");
  }

  const roleAccess = getRoleAccess(session.user.role);
  if (!roleAccess.canAccessParent) {
    redirect("/unauthorized");
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Votaciones Escolares
          </h1>
          <p className="text-muted-foreground">
            Participa en las decisiones que afectan a la comunidad escolar
          </p>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar votaciones
          </h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={fetchVotingSessions} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const activeVotes = votingSessions.filter((v) => v.status === "active");
  const closedVotes = votingSessions.filter((v) => v.status === "closed");

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Votaciones Escolares
        </h1>
        <p className="text-muted-foreground">
          Participa en las decisiones que afectan a la comunidad escolar
        </p>
      </div>

      {/* Voting Sessions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5" />
                Votaciones Disponibles
              </CardTitle>
              <CardDescription>
                Selecciona una votación para participar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {votingSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSession(session);
                    setSelectedOptions([]);
                    setShowResults(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">
                      {session.title}
                    </h4>
                    <Badge
                      variant={
                        session.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {session.status === "active" ? "Activa" : "Cerrada"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {getTimeRemaining(session.endDate)}
                  </div>
                  {session.hasVoted && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600">Votaste</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Votaciones activas</span>
                <Badge variant="default">{activeVotes.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Votaciones cerradas</span>
                <Badge variant="secondary">{closedVotes.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tu participación</span>
                <Badge variant="outline">
                  {votingSessions.filter((v) => v.hasVoted).length}/
                  {votingSessions.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voting Interface */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      {selectedSession.title}
                      <Badge
                        className={getCategoryColor(selectedSession.category)}
                      >
                        {getCategoryLabel(selectedSession.category)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mb-3">
                      {selectedSession.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedSession.creator.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {getTimeRemaining(selectedSession.endDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Vote className="h-4 w-4" />
                        {selectedSession.totalVotes} votos
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedSession.status === "closed" && (
                      <Button
                        variant={showResults ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowResults(!showResults)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {showResults ? "Ocultar" : "Ver"} Resultados
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedSession.status === "active" &&
                !selectedSession.hasVoted ? (
                  // Voting Form
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {selectedSession.allowMultipleVotes
                          ? "Puedes seleccionar múltiples opciones"
                          : "Selecciona una opción"}
                      </p>
                    </div>

                    <RadioGroup
                      value={
                        selectedSession.allowMultipleVotes
                          ? undefined
                          : selectedOptions[0] || ""
                      }
                      onValueChange={(value) => {
                        if (selectedSession.allowMultipleVotes) {
                          setSelectedOptions((prev) =>
                            prev.includes(value)
                              ? prev.filter((id) => id !== value)
                              : [...prev, value],
                          );
                        } else {
                          setSelectedOptions([value]);
                        }
                      }}
                    >
                      <div className="space-y-3">
                        {selectedSession.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-3"
                          >
                            <input
                              type={
                                selectedSession.allowMultipleVotes
                                  ? "checkbox"
                                  : "radio"
                              }
                              id={option.id}
                              name="vote-option"
                              value={option.id}
                              title={`Votar por: ${option.text}`}
                              checked={selectedOptions.includes(option.id)}
                              onChange={(e) => {
                                if (selectedSession.allowMultipleVotes) {
                                  setSelectedOptions((prev) =>
                                    e.target.checked
                                      ? [...prev, option.id]
                                      : prev.filter((id) => id !== option.id),
                                  );
                                } else {
                                  setSelectedOptions([option.id]);
                                }
                              }}
                              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                            <Label
                              htmlFor={option.id}
                              className="flex-1 text-sm font-medium cursor-pointer"
                            >
                              {option.text}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    <Button
                      onClick={handleVoteSubmit}
                      disabled={selectedOptions.length === 0 || submitting}
                      className="w-full"
                    >
                      {submitting ? "Registrando voto..." : "Enviar Voto"}
                    </Button>
                  </div>
                ) : selectedSession.status === "closed" || showResults ? (
                  // Results View
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">
                      Resultados
                    </h4>
                    <div className="space-y-3">
                      {selectedSession.options.map((option, index) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {index + 1}. {option.text}
                              </span>
                              {selectedSession.userVotes?.includes(
                                option.id,
                              ) && (
                                <Badge variant="outline" className="text-xs">
                                  Tu voto
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {option.votes} votos{" "}
                              {option.percentage && `(${option.percentage}%)`}
                            </span>
                          </div>
                          {option.percentage && (
                            <Progress
                              value={option.percentage}
                              className="h-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        Total de votos: {selectedSession.totalVotes}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Already Voted View
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      ¡Ya has votado!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Tu participación es muy importante para la comunidad
                      escolar
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowResults(true)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Resultados Parciales
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // No session selected
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Vote className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Selecciona una votación
                </h3>
                <p className="text-muted-foreground text-center">
                  Haz clic en una votación de la lista para participar o ver los
                  resultados
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ParentVotacionesPage() {
  return (
    <ErrorBoundary
      fallback={<div>Error al cargar la página de votaciones</div>}
    >
      <Suspense fallback={<LoadingState />}>
        <VotacionesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
