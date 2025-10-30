// React import removed - not needed in React 19
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Target } from "lucide-react";
import { useDivineParsing } from "@/components/language/ChunkedLanguageProvider";

export function PMEDashboard() {
  const { t } = useDivineParsing(["common"]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("pme.management", "common")}
        </h1>
        <p className="text-muted-foreground">
          {t("pme.active_plans", "common")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pme.active_plans_title", "common")}
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              {t("pme.active_plans", "common")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pme.indicators", "common")}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              {t("pme.indicators_evaluation", "common")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("pme.participants", "common")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              {t("pme.people_involved", "common")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("pme.improvement_plans", "common")}</CardTitle>
            <CardDescription>
              {t("pme.improvement_description", "common")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pme.planning_section", "common")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pme.process_evaluation", "common")}</CardTitle>
            <CardDescription>
              {t("pme.evaluation_tools", "common")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pme.evaluation_reflection", "common")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
