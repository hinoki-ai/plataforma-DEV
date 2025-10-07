"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SUBJECTS, GRADES } from "@/lib/constants";
import { useLanguage } from "@/components/language/LanguageContext";

export function PlanningDocumentSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedSubject, setSelectedSubject] = useState(
    searchParams.get("subject") || "",
  );
  const [selectedGrade, setSelectedGrade] = useState(
    searchParams.get("grade") || "",
  );

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("q", searchTerm);
    if (selectedSubject) params.set("subject", selectedSubject);
    if (selectedGrade) params.set("grade", selectedGrade);

    const queryString = params.toString();
    const url = queryString
      ? `/profesor/planificaciones?${queryString}`
      : "/profesor/planificaciones";

    router.push(url as any);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubject("");
    setSelectedGrade("");
    router.push("/profesor/planificaciones");
  };

  const hasActiveFilters = searchTerm || selectedSubject || selectedGrade;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("placeholders.search_title_content")}
              </label>
              <Input
                placeholder={t("planning.dashboard.empty.description")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("planning.subject.label")}
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                aria-label={t("common.filter")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t("search.all_subjects")}</option>
                {SUBJECTS.map((subject: string) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("planning.grade.label")}
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                aria-label={t("common.filter")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">{t("search.all_grades")}</option>
                {GRADES.map((grade: string) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch}>{t("common.search")}</Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                {t("search.clear_filters")}
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                  Búsqueda: &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedSubject && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
                  Asignatura: {selectedSubject}
                </span>
              )}
              {selectedGrade && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent-100 text-accent-800">
                  Curso: {selectedGrade}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
