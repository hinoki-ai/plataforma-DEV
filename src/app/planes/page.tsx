"use client";

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
import { Check, X, Shield, Server, Lock, Phone } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BillingCycle,
  pricingPlans,
  featureLabels,
  billingCycleDiscount,
  calculateBillingPrice,
  formatCLP,
} from "@/data/pricing-plans";

const plans = pricingPlans;

const featuresList = featureLabels;

export default function PreciosPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("semestral");
  const [showContactForm, setShowContactForm] = useState(false);

  const getDiscount = (cycle: BillingCycle) => billingCycleDiscount[cycle];

  return (
    <div className="min-h-screen bg-responsive-desktop bg-planes">
      <div className="min-h-screen bg-linear-to-b from-black/30 via-black/20 to-black/40">
        <Header />
        <main className="container mx-auto px-4 pt-12 pb-12">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="backdrop-blur-md bg-white/5 dark:bg-black/20 rounded-2xl border border-white/10 dark:border-white/5 shadow-2xl p-6 mx-auto inline-block mb-4">
                <h1 className="text-center text-4xl font-bold leading-tight text-gray-900 dark:text-white drop-shadow-2xl transition-all duration-700 ease-out md:text-5xl">
                  Planes y Precios
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-6">
                Precios transparentes por estudiante. Sin costos ocultos.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="flex justify-center gap-2 mb-4">
                <Button
                  onClick={() => setBillingCycle("semestral")}
                  variant={billingCycle === "semestral" ? "default" : "outline"}
                  className="min-w-[120px]"
                >
                  Semestral
                </Button>
                <Button
                  onClick={() => setBillingCycle("annual")}
                  variant={billingCycle === "annual" ? "default" : "outline"}
                  className="min-w-[120px] relative"
                >
                  Anual
                  <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">
                    -15%
                  </span>
                </Button>
                <Button
                  onClick={() => setBillingCycle("biannual")}
                  variant={billingCycle === "biannual" ? "default" : "outline"}
                  className="min-w-[120px] relative"
                >
                  Bianual
                  <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs px-2 py-0.5 rounded-full">
                    -25%
                  </span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                * Precios en Pesos Chilenos (CLP) + IVA • Factura electrónica
                (SII)
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className="relative backdrop-blur-xl bg-card/80 border border-border rounded-2xl shadow-2xl flex flex-col h-full"
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span
                        className={`${
                          plan.badge === "Premium"
                            ? "bg-linear-to-r from-purple-500 to-pink-500"
                            : "bg-primary"
                        } text-white px-3 py-1 rounded-full text-sm font-medium`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-foreground min-h-[4rem] flex items-center justify-center text-center">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="pt-4">
                      <div className="text-3xl font-bold text-primary">
                        {formatCLP(plan.pricePerStudent)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        por estudiante/mes
                      </div>
                      {billingCycle !== "semestral" && (
                        <div className="text-xs text-green-400 mt-1">
                          Ahorro de {getDiscount(billingCycle) * 100}% en plan{" "}
                          {billingCycle === "annual" ? "anual" : "bianual"}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                      Ejemplo: {plan.maxStudents || "1.500"} estudiantes ={" "}
                      {formatCLP(
                        calculateBillingPrice(
                          plan.pricePerStudent,
                          plan.maxStudents || 1500,
                          billingCycle,
                        ),
                      )}
                      /mes
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li>✓ {plan.features.courses} cursos</li>
                      <li>✓ {plan.features.storage} almacenamiento</li>
                      <li>✓ {plan.features.meetings} reuniones/mes</li>
                      <li>✓ {plan.features.users} usuarios admin</li>
                      <li>✓ {plan.features.support}</li>
                      <li>✓ SLA {plan.features.sla}</li>
                    </ul>
                    <Button
                      className="w-full mt-auto"
                      onClick={() =>
                        router.push(
                          `/planes/calculadora?plan=${plan.id}&billing=${billingCycle}`,
                        )
                      }
                    >
                      Seleccionar Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-6 mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                Comparación Detallada de Planes
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-4 text-muted-foreground font-semibold">
                        Característica
                      </th>
                      {plans.map((plan) => (
                        <th
                          key={plan.id}
                          className="text-center py-4 px-4 text-foreground font-semibold"
                        >
                          {plan.name.replace("Plan ", "")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {featuresList.map((feature, idx) => (
                      <tr
                        key={feature.key}
                        className={`border-b border-border/50 ${
                          idx % 2 === 0 ? "bg-muted/30" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-muted-foreground">
                          {feature.label}
                        </td>
                        {plans.map((plan) => {
                          const value =
                            plan.features[
                              feature.key as keyof typeof plan.features
                            ];
                          return (
                            <td key={plan.id} className="text-center py-3 px-4">
                              {typeof value === "boolean" ? (
                                value ? (
                                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-foreground">{value}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contact Form Section */}
            {showContactForm && (
              <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8 mb-12">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                    Solicita tu Demo Gratuita
                  </h2>
                  <form className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="nombre"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Nombre Completo *
                        </label>
                        <input
                          id="nombre"
                          type="text"
                          required
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Email *
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="establecimiento"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Establecimiento *
                        </label>
                        <input
                          id="establecimiento"
                          type="text"
                          required
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="comuna"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Comuna *
                        </label>
                        <input
                          id="comuna"
                          type="text"
                          required
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="matricula"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Matrícula (N° estudiantes) *
                        </label>
                        <input
                          id="matricula"
                          type="number"
                          required
                          min="1"
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="telefono"
                          className="block text-sm font-medium text-foreground mb-2"
                        >
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          id="telefono"
                          type="tel"
                          required
                          placeholder="+56 9 xxxx xxxx"
                          className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="mensaje"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Mensaje (opcional)
                      </label>
                      <textarea
                        id="mensaje"
                        rows={3}
                        className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                      ></textarea>
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">
                        Solicitar Demo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() =>
                          window.open("https://wa.me/56912345678", "_blank")
                        }
                      >
                        <Phone className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    </div>
                  </form>
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    Al enviar este formulario, aceptas nuestra Política de
                    Privacidad y el tratamiento de tus datos según la Ley 19.628
                  </p>
                </div>
              </div>
            )}

            {!showContactForm && (
              <div className="text-center mb-12">
                <Button
                  size="lg"
                  onClick={() => setShowContactForm(true)}
                  className="text-lg px-8"
                >
                  Contactar a Ventas
                </Button>
              </div>
            )}

            {/* Security & Compliance Section */}
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8 mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                Seguridad y Cumplimiento
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Server className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Datos en Chile
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Servidores ubicados en Chile. Cumplimiento total con
                    regulaciones locales.
                  </p>
                </div>
                <div className="text-center">
                  <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ley 19.628
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Protección de datos personales. Cifrado end-to-end y backups
                    diarios automáticos.
                  </p>
                </div>
                <div className="text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Certificaciones
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ISO 27001 en proceso. Auditorías de seguridad trimestrales.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="backdrop-blur-xl bg-card/80 border border-border rounded-2xl p-8 mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                Preguntas Frecuentes
              </h2>
              <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿El precio incluye IVA?
                  </h3>
                  <p className="text-muted-foreground">
                    No, los precios mostrados son netos. Se añade 19% de IVA en
                    la factura electrónica emitida por el SII.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Cómo se calcula el cobro semestral?
                  </h3>
                  <p className="text-muted-foreground">
                    El precio es por estudiante activo por semestre. Ejemplo:
                    100 estudiantes × CLP $35 = CLP $3.500/semestre + IVA. Se
                    cobra el día 1 de cada semestre.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Qué incluye la prueba gratuita?
                  </h3>
                  <p className="text-muted-foreground">
                    14 días de acceso completo al plan que elijas, sin
                    restricciones. Incluye recorrido guiado por nuestro equipo y
                    soporte completo. No se requiere tarjeta de crédito.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Puedo cambiar de plan después?
                  </h3>
                  <p className="text-muted-foreground">
                    Sí, puedes cambiar de plan en cualquier momento. Los cambios
                    se aplican en el siguiente ciclo de facturación.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Qué pasa con mis datos si cancelo?
                  </h3>
                  <p className="text-muted-foreground">
                    Puedes exportar todos tus datos en cualquier momento.
                    Después de la cancelación, guardamos tus datos por 90 días
                    según Ley 19.628, luego se eliminan permanentemente.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¿Qué horarios tiene el soporte técnico?
                  </h3>
                  <p className="text-muted-foreground">
                    Lunes a viernes de 9:00 a 18:00 hrs (Chile Continental).
                    Planes Premium incluyen soporte 24/7 con tiempo de respuesta
                    garantizado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <MinEducFooter />
        <LegalFooter />
      </div>
    </div>
  );
}
