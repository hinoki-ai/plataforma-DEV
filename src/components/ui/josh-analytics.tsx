"use client";

import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { useSession } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

// Analytics context for Josh interactions
interface JoshAnalyticsData {
  userId: string;
  sessionId: string;
  interactions: JoshInteraction[];
  preferences: UserPreferences;
  insights: AnalyticsInsights;
}

interface JoshInteraction {
  id: string;
  type: "click" | "chat" | "tour" | "suggestion" | "dismiss";
  timestamp: Date;
  page: string;
  context: {
    role: string;
    action?: string;
    response?: string;
    duration?: number;
  };
  metadata?: Record<string, any>;
}

interface UserPreferences {
  favoriteFeatures: string[];
  preferredInteractionTime: string;
  language: string;
  accessibility: {
    screenReader: boolean;
    highContrast: boolean;
    largeText: boolean;
  };
  notifications: {
    proactiveSuggestions: boolean;
    tourReminders: boolean;
    chatResponses: boolean;
  };
}

interface AnalyticsInsights {
  mostUsedFeatures: string[];
  preferredTimes: string[];
  commonQuestions: string[];
  engagementScore: number;
  learningPatterns: string[];
  recommendations: string[];
}

interface JoshAnalyticsContextType {
  trackInteraction: (
    interaction: Omit<JoshInteraction, "id" | "timestamp">,
  ) => void;
  getInsights: () => AnalyticsInsights;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  getPersonalizedSuggestions: () => string[];
}

const JoshAnalyticsContext = createContext<JoshAnalyticsContextType | null>(
  null,
);

// Custom hook for analytics
export function useJoshAnalytics() {
  const context = useContext(JoshAnalyticsContext);
  if (!context) {
    throw new Error(
      "useJoshAnalytics must be used within JoshAnalyticsProvider",
    );
  }
  return context;
}

// Analytics provider component
export function JoshAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState<JoshAnalyticsData | null>(null);
  const [sessionStart, setSessionStart] = useState<Date>(new Date());

  // Initialize analytics for user
  useEffect(() => {
    if (session?.user?.id) {
      const sessionId = `${session.user.id}_${Date.now()}`;
      const storedData = localStorage.getItem(
        `josh_analytics_${session.user.id}`,
      );

      const initialData: JoshAnalyticsData = storedData
        ? JSON.parse(storedData)
        : {
            userId: session.user.id,
            sessionId,
            interactions: [],
            preferences: {
              favoriteFeatures: [],
              preferredInteractionTime: "morning",
              language: "es",
              accessibility: {
                screenReader: false,
                highContrast: false,
                largeText: false,
              },
              notifications: {
                proactiveSuggestions: true,
                tourReminders: true,
                chatResponses: true,
              },
            },
            insights: {
              mostUsedFeatures: [],
              preferredTimes: [],
              commonQuestions: [],
              engagementScore: 0,
              learningPatterns: [],
              recommendations: [],
            },
          };

      setAnalytics(initialData);
      setSessionStart(new Date());
    }
  }, [session?.user?.id]);

  // Save analytics data
  const saveAnalytics = (data: JoshAnalyticsData) => {
    localStorage.setItem(`josh_analytics_${data.userId}`, JSON.stringify(data));
    setAnalytics(data);
  };

  // Generate unique ID for interactions
  const generateInteractionId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Generate insights from interaction data
  const generateInsights = useCallback(
    (data: JoshAnalyticsData): AnalyticsInsights => {
      const interactions = data.interactions;
      const recentInteractions = interactions.filter(
        (i) =>
          Date.now() - new Date(i.timestamp).getTime() <
          30 * 24 * 60 * 60 * 1000, // Last 30 days
      );

      // Most used features
      const featureCount = recentInteractions.reduce(
        (acc, interaction) => {
          const feature = interaction.type;
          acc[feature] = (acc[feature] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const mostUsedFeatures = Object.entries(featureCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([feature]) => feature);

      // Preferred interaction times
      const hourCount = recentInteractions.reduce(
        (acc, interaction) => {
          const hour = new Date(interaction.timestamp).getHours();
          const timeOfDay =
            hour < 6
              ? "night"
              : hour < 12
                ? "morning"
                : hour < 18
                  ? "afternoon"
                  : "evening";
          acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const preferredTimes = Object.entries(hourCount)
        .sort(([, a], [, b]) => b - a)
        .map(([time]) => time);

      // Common questions (from chat interactions)
      const chatInteractions = recentInteractions.filter(
        (i) => i.type === "chat",
      );
      const questionCount = chatInteractions.reduce(
        (acc, interaction) => {
          const question = interaction.context.action || "general";
          acc[question] = (acc[question] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const commonQuestions = Object.entries(questionCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([question]) => question);

      // Engagement score (0-100)
      const totalInteractions = recentInteractions.length;
      const uniqueFeatures = new Set(recentInteractions.map((i) => i.type))
        .size;
      const avgInteractionsPerDay = totalInteractions / 30;
      const engagementScore = Math.min(
        100,
        totalInteractions * 2 + uniqueFeatures * 10 + avgInteractionsPerDay * 5,
      );

      // Learning patterns
      const learningPatterns = [];
      if (mostUsedFeatures.includes("tour")) {
        learningPatterns.push("prefers_guided_learning");
      }
      if (mostUsedFeatures.includes("chat")) {
        learningPatterns.push("interactive_learner");
      }
      if (preferredTimes.includes("morning")) {
        learningPatterns.push("morning_person");
      }
      if (engagementScore > 70) {
        learningPatterns.push("highly_engaged");
      }

      // Generate recommendations
      const recommendations = [];
      if (!mostUsedFeatures.includes("tour") && totalInteractions > 5) {
        recommendations.push("try_interactive_tours");
      }
      if (!mostUsedFeatures.includes("chat") && totalInteractions > 10) {
        recommendations.push("explore_chat_features");
      }
      if (engagementScore < 30) {
        recommendations.push("increase_engagement");
      }
      if (preferredTimes.length === 0) {
        recommendations.push("set_interaction_preferences");
      }

      return {
        mostUsedFeatures,
        preferredTimes,
        commonQuestions,
        engagementScore: Math.round(engagementScore),
        learningPatterns,
        recommendations,
      };
    },
    [],
  );

  // Track user interactions
  const trackInteraction = useCallback(
    (interaction: Omit<JoshInteraction, "id" | "timestamp">) => {
      if (!analytics) return;

      const newInteraction: JoshInteraction = {
        ...interaction,
        id: generateInteractionId(),
        timestamp: new Date(),
      };

      const updatedAnalytics = {
        ...analytics,
        interactions: [...analytics.interactions, newInteraction],
      };

      // Update insights based on new interaction
      updatedAnalytics.insights = generateInsights(updatedAnalytics);

      saveAnalytics(updatedAnalytics);
    },
    [analytics, generateInteractionId],
  );

  // Update user preferences
  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    if (!analytics) return;

    const updatedAnalytics = {
      ...analytics,
      preferences: { ...analytics.preferences, ...newPreferences },
    };

    saveAnalytics(updatedAnalytics);
  };

  // Get personalized suggestions based on analytics
  const getPersonalizedSuggestions = (): string[] => {
    if (!analytics) return [];

    const { insights, preferences } = analytics;
    const suggestions = [];

    // Based on engagement score
    if (insights.engagementScore > 80) {
      suggestions.push(
        "¡Excelente! Eres un usuario muy activo. ¿Quieres explorar funciones avanzadas?",
      );
    } else if (insights.engagementScore < 30) {
      suggestions.push(
        "Parece que aún no has explorado todas las funciones. ¿Te gustaría un tour rápido?",
      );
    }

    // Based on preferred times
    if (
      insights.preferredTimes.includes("morning") &&
      new Date().getHours() < 12
    ) {
      suggestions.push(
        "¡Buenos días! Es tu hora preferida para aprender. ¿Qué te gustaría hacer hoy?",
      );
    }

    // Based on unused features
    if (!insights.mostUsedFeatures.includes("tour")) {
      suggestions.push(
        "Los tours interactivos pueden ayudarte a conocer mejor la plataforma. ¿Quieres probar uno?",
      );
    }

    // Based on learning patterns
    if (insights.learningPatterns.includes("interactive_learner")) {
      suggestions.push(
        "Como usuario interactivo, te recomiendo explorar el chat para preguntas específicas.",
      );
    }

    return suggestions;
  };

  const contextValue: JoshAnalyticsContextType = {
    trackInteraction,
    getInsights: () =>
      analytics?.insights || {
        mostUsedFeatures: [],
        preferredTimes: [],
        commonQuestions: [],
        engagementScore: 0,
        learningPatterns: [],
        recommendations: [],
      },
    updatePreferences,
    getPersonalizedSuggestions,
  };

  return (
    <JoshAnalyticsContext.Provider value={contextValue}>
      {children}
    </JoshAnalyticsContext.Provider>
  );
}

// Analytics dashboard component (for admin/master users)
export function JoshAnalyticsDashboard() {
  const { session } = useSession();
  const analytics = useJoshAnalytics();
  const [showDashboard, setShowDashboard] = useState(false);

  // Only show for admin/master users
  if (
    !session?.user?.publicMetadata?.role ||
    !["admin", "master"].includes(session.user.publicMetadata.role as string)
  ) {
    return null;
  }

  const insights = analytics.getInsights();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowDashboard(!showDashboard)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
        title="Josh Analytics Dashboard"
      >
        📊
      </button>

      {showDashboard && (
        <div className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border max-w-sm">
          <h3 className="font-bold mb-3">Josh Analytics</h3>

          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Engagement Score:</span>
              <span
                className={`ml-2 px-2 py-1 rounded ${
                  insights.engagementScore > 70
                    ? "bg-green-100 text-green-800"
                    : insights.engagementScore > 40
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {insights.engagementScore}/100
              </span>
            </div>

            <div>
              <span className="font-medium">Most Used Features:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {insights.mostUsedFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium">Learning Patterns:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {insights.learningPatterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                  >
                    {pattern.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-medium">Recommendations:</span>
              <ul className="mt-1 text-xs space-y-1">
                {insights.recommendations.map((rec) => (
                  <li key={rec} className="text-gray-600 dark:text-gray-400">
                    • {rec.replace("_", " ")}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for tracking page views and time spent
export function usePageAnalytics() {
  const analytics = useJoshAnalytics();
  const pathname = usePathname();
  const [pageStartTime, setPageStartTime] = useState<number>(0);

  // Set initial page start time
  useEffect(() => {
    setPageStartTime(Date.now());
  }, []);

  useEffect(() => {
    setPageStartTime(Date.now());

    // Track page view
    analytics.trackInteraction({
      type: "click",
      page: pathname,
      context: {
        role: "user",
        action: "page_view",
      },
    });
  }, [pathname]);

  // Track time spent on page when component unmounts or page changes
  useEffect(() => {
    return () => {
      const timeSpent = Date.now() - pageStartTime;
      analytics.trackInteraction({
        type: "click",
        page: pathname,
        context: {
          role: "user",
          action: "page_time",
          duration: timeSpent,
        },
      });
    };
  }, [pageStartTime, pathname]);
}
