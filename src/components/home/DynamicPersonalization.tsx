// ⚡ Performance: Dynamic personalization component for PPR
"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/components/language/LanguageContext";

// ⚡ Performance: Dynamic component that could fetch user-specific data
export function DynamicPersonalization() {
  const { t } = useLanguage();
  // This could include:
  // - User preferences
  // - Recent activity
  // - Personalized recommendations
  // - Time-sensitive content

  return (
    <div className="bg-blue-900/20 backdrop-blur-sm border-t border-blue-700/30 py-8">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">
          {t("home.explore.title", "common")}
        </h3>
        <p className="text-gray-300 mb-4">
          {t("home.explore.description", "common")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/cpa"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {t("home.explore.parent.center", "common")}
          </Link>
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {t("home.explore.login", "common")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ⚡ Performance: Loading skeleton for dynamic content
export function PersonalizationSkeleton() {
  return (
    <div className="bg-gray-900/20 backdrop-blur-sm border-t border-gray-700/30 py-8">
      <div className="container mx-auto px-4 text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto bg-gray-700/50" />
        <Skeleton className="h-4 w-96 mx-auto bg-gray-700/50" />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Skeleton className="h-12 w-40 bg-gray-700/50" />
          <Skeleton className="h-12 w-40 bg-gray-700/50" />
          <Skeleton className="h-12 w-40 bg-gray-700/50" />
        </div>
      </div>
    </div>
  );
}
