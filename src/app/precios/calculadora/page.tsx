"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import MinEducFooter from "@/components/layout/MinEducFooter";
import LegalFooter from "@/components/layout/LegalFooter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calculator,
  Check,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import {
  BillingCycle,
  pricingPlans,
  findPricingPlan,
  isValidBillingCycle,
  billingCycleDiscount,
  calculateBillingPrice,
  formatCLP,
} from "@/data/pricing-plans";

const billingMetadata: Record<
  BillingCycle,
  { label: string; description: string; months: number }
> = {
  semestral: {
    label: "Semestral",
    description: "Contrato 6 meses",
    months: 6,
  },
  annual: {
    label: "Anual",
    description: "Contrato 12 meses (-15%)",
    months: 12,
  },
  biannual: {
    label: "Bianual",
    description: "Contrato 24 meses (-25%)",
    months: 24,
  },
};

const developerContacts = [
  {
    id: "principal",
    name: "Tu Equipo Astral",
    role: "Lead Developer & Onboarding",
    email: "accion@astral.school",
    whatsappDisplay: "+56 9 7500 1234",
    whatsappLink: "https://wa.me/56975001234",
  },
  {
    id: "loreto",
    name: "Loreto",
    role: "Desarrolladora Senior",
    email: "loreto@astral.school",
    whatsappDisplay: "+56 9 6854 3210",
    whatsappLink: "https://wa.me/56968543210",
  },
] as const;

const numberFormatter = new Intl.NumberFormat("es-CL");

interface PricingCalculatorPageProps {
  searchParams: Promise<{
    plan?: string;
    billing?: string;
    students?: string;
  }>;
}

export default function PricingCalculatorPage({
  searchParams,
}: PricingCalculatorPageProps) {
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{
    plan?: string;
    billing?: string;
    students?: string;
  }>({});

  useEffect(() => {
    const resolveParams = async () => {
      const params = await searchParams;
      setResolvedSearchParams(params);
    };
    resolveParams();
  }, [searchParams]);

  const planFromParams = resolvedSearchParams.plan
    ? findPricingPlan(resolvedSearchParams.plan)
    : undefined;
  const fallbackPlan = pricingPlans[1] ?? pricingPlans[0];
  const selectedPlan = planFromParams ?? fallbackPlan;

  const initialBilling: BillingCycle = isValidBillingCycle(
    resolvedSearchParams.billing,
  )
    ? (resolvedSearchParams.billing as BillingCycle)
    : "semestral";
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>(initialBilling);

  const clampStudents = (value: number) => {
    const min = selectedPlan.minStudents;
    const rounded = Math.max(min, Math.round(value));
    if (selectedPlan.maxStudents) {
      return Math.min(selectedPlan.maxStudents, rounded);
    }
    return rounded;
  };

  const initialStudents = (() => {
    const parsed = resolvedSearchParams.students
      ? Number.parseInt(resolvedSearchParams.students, 10)
      : NaN;
    if (Number.isNaN(parsed)) {
      return selectedPlan.minStudents;
    }
    return clampStudents(parsed);
  })();

  const [students, setStudents] = useState<number>(initialStudents);

  const billingInfo = billingMetadata[billingCycle];
  const discountPercentage = billingCycleDiscount[billingCycle];
  const basePrice = selectedPlan.pricePerStudent * students;
  const periodPrice = calculateBillingPrice(
    selectedPlan.pricePerStudent,
    students,
    billingCycle,
  );
  const periodTotal = periodPrice * billingInfo.months;
  const savingsPeriodPrice = basePrice - periodPrice;
  const savingsPeriod = savingsPeriodPrice * billingInfo.months;

  const sliderUpperBound = selectedPlan.maxStudents
    ? selectedPlan.maxStudents
    : Math.max(selectedPlan.minStudents * 4, students, 2000);

  const studentsLabel = `${numberFormatter.format(selectedPlan.minStudents)}${
    selectedPlan.maxStudents
      ? ` - ${numberFormatter.format(selectedPlan.maxStudents)}`
      : "+"
  } estudiantes`;

  const cycleOptions = (
    Object.keys(billingMetadata) as Array<BillingCycle>
  ).map((value) => ({
    value,
    label: billingMetadata[value].label,
    description: billingMetadata[value].description,
  }));

  const studentsFormatted = numberFormatter.format(students);
  const periodLabel =
    billingInfo.months === 1
      ? "mes"
      : `${billingInfo.months} meses (${billingInfo.label})`;

  const whatsappMessage = encodeURIComponent(
    `Hola equipo Astral, necesito activar ${selectedPlan.name} para ${studentsFormatted} estudiantes. ` +
      `Ciclo de facturación: ${billingInfo.label}. ` +
      `Valor mensual estimado: ${formatCLP(Math.round(periodPrice / billingInfo.months))}. ` +
      `Total del período (${periodLabel}): ${formatCLP(periodTotal)}. ` +
      "Hablemos ahora mismo para confirmarlo.",
  );

  const emailSubject = encodeURIComponent(
    `[Astral] ${selectedPlan.name} - ${studentsFormatted} estudiantes`,
  );
  const emailBody = encodeURIComponent(
    `Hola equipo Astral,%0A%0A` +
      `Quiero avanzar con ${selectedPlan.name} para ${studentsFormatted} estudiantes.%0A` +
      `Ciclo de facturación: ${billingInfo.label}.%0A` +
      `Valor mensual estimado: ${formatCLP(Math.round(periodPrice / billingInfo.months))}.%0A` +
      `Total del período (${periodLabel}): ${formatCLP(periodTotal)}.%0A%0A` +
      "Por favor contáctenme hoy para activarlo.%0A%0AGracias!",
  );

  const updateStudents = (value: number) => {
    setStudents(clampStudents(value));
  };

  const handleStudentInput = (value: string) => {
    const numeric = Number.parseInt(value, 10);
    if (Number.isNaN(numeric)) {
      return;
    }
    updateStudents(numeric);
  };

  const adjustStudents = (delta: number) => {
    updateStudents(students + delta);
  };

  const highlightItems = [
    {
      label: "Rango recomendado",
      value: selectedPlan.maxStudents
        ? `${numberFormatter.format(selectedPlan.minStudents)} - ${numberFormatter.format(selectedPlan.maxStudents)} estudiantes`
        : `${numberFormatter.format(selectedPlan.minStudents)}+ estudiantes`,
    },
    {
      label: "Valor por estudiante",
      value: `${formatCLP(selectedPlan.pricePerStudent)} / mes`,
    },
    {
      label: "Usuarios administrativos",
      value: `${selectedPlan.features.users}`,
    },
    {
      label: "Soporte",
      value: selectedPlan.features.support,
    },
  ];

  return (
    <div className="min-h-screen bg-responsive-desktop bg-precios">
      <Header />
      <main className="container mx-auto px-4 pt-10 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-3 text-white">
            <Button variant="ghost" className="w-fit" asChild>
              <Link href="/precios" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Volver a precios
              </Link>
            </Button>
            <div>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold">
                Calculadora de {selectedPlan.name}
              </h1>
              <p className="mt-2 text-lg text-gray-200 max-w-2xl">
                Ajusta la cantidad de estudiantes y descubre la inversión real.
                Estamos listos para activar tu plan en minutos.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-3xl font-semibold">
                        {selectedPlan.name}
                      </CardTitle>
                      {selectedPlan.badge && (
                        <Badge className="bg-primary text-primary-foreground">
                          {selectedPlan.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-300 text-base mt-2">
                      {selectedPlan.description}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      Valor por estudiante
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatCLP(selectedPlan.pricePerStudent)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {highlightItems.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-gray-800 bg-gray-900/60 p-4"
                    >
                      <div className="text-xs uppercase tracking-wide text-gray-400">
                        {item.label}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-white">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-300">
                    <Users className="w-4 h-4" /> Configura estudiantes
                  </div>
                  <div className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        type="number"
                        min={selectedPlan.minStudents}
                        max={selectedPlan.maxStudents ?? undefined}
                        value={students}
                        onChange={(event) =>
                          handleStudentInput(event.target.value)
                        }
                        className="w-32 bg-gray-800 border-gray-700 text-lg font-semibold text-white"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustStudents(-10)}
                          disabled={students <= selectedPlan.minStudents}
                          aria-label="Disminuir 10 estudiantes"
                        >
                          -10
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => adjustStudents(10)}
                          aria-label="Aumentar 10 estudiantes"
                        >
                          +10
                        </Button>
                      </div>
                      <span className="text-sm text-gray-400">
                        {studentsLabel}
                      </span>
                    </div>
                    <Slider
                      value={[students]}
                      min={selectedPlan.minStudents}
                      max={sliderUpperBound}
                      step={1}
                      onValueChange={(value) => updateStudents(value[0])}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calculator className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">
                      Tu inversión estimada
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Calculamos valores en CLP con IVA no incluido
                    </CardDescription>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {cycleOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={
                        billingCycle === option.value ? "default" : "outline"
                      }
                      className="justify-center py-3 px-4"
                      onClick={() => setBillingCycle(option.value)}
                    >
                      <span className="text-sm font-semibold">
                        {option.label}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-gray-800 bg-black/40 p-5">
                  <div className="text-sm text-gray-300">Pago semestral</div>
                  <div className="mt-2 text-4xl font-bold text-primary">
                    {formatCLP(periodPrice)}
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    {studentsFormatted} estudiantes • {billingInfo.label}
                  </p>
                  {discountPercentage > 0 && savingsPeriodPrice > 0 && (
                    <p className="mt-2 text-sm text-green-400">
                      Ahorro por período: {formatCLP(savingsPeriodPrice)} (
                      {Math.round(discountPercentage * 100)}% menos)
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Total por {periodLabel}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-white">
                      {formatCLP(periodTotal)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                    <div className="text-xs uppercase tracking-wide text-gray-400">
                      Ahorro en el período
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-green-400">
                      {savingsPeriod > 0 ? formatCLP(savingsPeriod) : "$0"}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-sm text-primary font-semibold">
                    ¿Listo para activarlo?
                  </p>
                  <p className="text-sm text-gray-200 mt-1">
                    Compartiremos esta simulación de inmediato con el equipo
                    para iniciar la implementación sin demoras.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button asChild className="flex-1">
                      <a
                        href={`${developerContacts[0].whatsappLink}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Contacto Express por WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <a
                        href={`mailto:${developerContacts[0].email}?subject=${emailSubject}&body=${emailBody}`}
                      >
                        Solicitar activación por Email
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="backdrop-blur-xl bg-gray-900/80 border border-gray-700/60 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">
                Contacta directo al equipo de desarrollo
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Estamos en modo reacción inmediata. Escríbenos y comencemos hoy
                mismo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {developerContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-2xl border border-gray-800 bg-black/40 p-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {contact.role}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3 text-sm text-gray-300">
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-gray-500">
                          Email directo
                        </span>
                        <a
                          href={`mailto:${contact.email}?subject=${emailSubject}&body=${emailBody}`}
                          className="text-white hover:underline"
                        >
                          {contact.email}
                        </a>
                      </div>
                      <div>
                        <span className="block text-xs uppercase tracking-wide text-gray-500">
                          WhatsApp inmediato
                        </span>
                        <a
                          href={`${contact.whatsappLink}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:underline"
                        >
                          {contact.whatsappDisplay}
                        </a>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                      <Button asChild className="flex-1">
                        <a
                          href={`${contact.whatsappLink}?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp Ahora
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="flex-1">
                        <a
                          href={`mailto:${contact.email}?subject=${emailSubject}&body=${emailBody}`}
                        >
                          <Mail className="w-4 h-4" />
                          Enviar Email
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MinEducFooter />
      <LegalFooter />
    </div>
  );
}
